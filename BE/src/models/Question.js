import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'


export class QuestionModel {
	static OPTION_KEY_TO_ID = {
		A: 1,
		B: 2,
		C: 3,
		D: 4,
	}

	static OPTION_ID_TO_KEY = {
		1: 'A',
		2: 'B',
		3: 'C',
		4: 'D',
	}

	static toResponse(question, includeAnswer = true) {
		const rawOptions = [question.option_a, question.option_b, question.option_c, question.option_d]
			.filter((option) => option !== null && option !== undefined && String(option).trim() !== '')

		const correctAnswer = Number(question.correct_answer)
		const options = rawOptions.map((optionText, index) => ({
			option_id: index + 1,
			option_text: optionText,
			...(includeAnswer ? { is_correct: correctAnswer === index + 1 } : {}),
		}))

		return {
			id: question.id,
			question_id: question.id,
			certificate_id: question.certificate_id,
			question_text: question.question_text,
			image: question.image_url,
			is_fatal: Boolean(question.is_fatal),
			explanation: question.explanation,
			options,
			...(includeAnswer ? { correct_answer: correctAnswer } : {}),
		}
	}

	static async attachOptions(connection, questions = [], includeAnswer = true) {
		if (!questions.length) {
			return []
		}

		const questionIds = questions.map((q) => Number(q.id)).filter((id) => Number.isFinite(id) && id > 0)
		if (!questionIds.length) {
			return questions.map((question) => this.toResponse(question, includeAnswer))
		}

		const placeholders = questionIds.map(() => '?').join(', ')
		const [optionRows] = await connection.execute(
			`SELECT question_id, option_key, option_text, is_correct
			 FROM question_options
			 WHERE question_id IN (${placeholders})
			 ORDER BY question_id ASC, FIELD(option_key, 'A', 'B', 'C', 'D'), id ASC`,
			questionIds
		)

		const optionsByQuestionId = new Map()
		for (const row of optionRows) {
			const questionId = Number(row.question_id)
			if (!optionsByQuestionId.has(questionId)) {
				optionsByQuestionId.set(questionId, {
					option_a: null,
					option_b: null,
					option_c: null,
					option_d: null,
					correct_answer: null,
				})
			}

			const normalizedKey = String(row.option_key || '').trim().toUpperCase()
			const optionState = optionsByQuestionId.get(questionId)

			if (normalizedKey === 'A') optionState.option_a = row.option_text
			if (normalizedKey === 'B') optionState.option_b = row.option_text
			if (normalizedKey === 'C') optionState.option_c = row.option_text
			if (normalizedKey === 'D') optionState.option_d = row.option_text

			if (Number(row.is_correct) === 1 && this.OPTION_KEY_TO_ID[normalizedKey]) {
				optionState.correct_answer = this.OPTION_KEY_TO_ID[normalizedKey]
			}
		}

		return questions.map((question) => {
			const optionState = optionsByQuestionId.get(Number(question.id)) || {
				option_a: null,
				option_b: null,
				option_c: null,
				option_d: null,
				correct_answer: null,
			}

			return this.toResponse(
				{
					...question,
					...optionState,
				},
				includeAnswer
			)
		})
	}

	static async upsertOptions(connection, questionId, data = {}, fallbackCorrectAnswer = null) {
		const [existingRows] = await connection.execute(
			`SELECT option_key, option_text, is_correct
			 FROM question_options
			 WHERE question_id = ?
			 ORDER BY FIELD(option_key, 'A', 'B', 'C', 'D'), id ASC`,
			[Number(questionId)]
		)

		const optionMap = {
			A: null,
			B: null,
			C: null,
			D: null,
		}

		let existingCorrectAnswer = null
		for (const row of existingRows) {
			const key = String(row.option_key || '').trim().toUpperCase()
			if (!this.OPTION_KEY_TO_ID[key]) {
				continue
			}

			optionMap[key] = row.option_text
			if (Number(row.is_correct) === 1) {
				existingCorrectAnswer = this.OPTION_KEY_TO_ID[key]
			}
		}

		const dataToKey = {
			option_a: 'A',
			option_b: 'B',
			option_c: 'C',
			option_d: 'D',
		}

		for (const [field, key] of Object.entries(dataToKey)) {
			if (data[field] !== undefined && data[field] !== null && String(data[field]).trim() !== '') {
				optionMap[key] = String(data[field])
			}
		}

		const resolvedCorrectAnswer = data.correct_answer !== undefined
			? Number(data.correct_answer)
			: (fallbackCorrectAnswer !== null && fallbackCorrectAnswer !== undefined
				? Number(fallbackCorrectAnswer)
				: existingCorrectAnswer)

		for (const [key, optionText] of Object.entries(optionMap)) {
			if (!optionText || String(optionText).trim() === '') {
				continue
			}

			await connection.execute(
				`INSERT INTO question_options (question_id, option_key, option_text, is_correct, created_at)
				 VALUES (?, ?, ?, ?, NOW())
				 ON DUPLICATE KEY UPDATE
				 	option_text = VALUES(option_text),
				 	is_correct = VALUES(is_correct)`,
				[
					Number(questionId),
					key,
					optionText,
					resolvedCorrectAnswer === this.OPTION_KEY_TO_ID[key] ? 1 : 0,
				]
			)
		}

		if (Number.isFinite(resolvedCorrectAnswer) && this.OPTION_ID_TO_KEY[resolvedCorrectAnswer]) {
			const correctKey = this.OPTION_ID_TO_KEY[resolvedCorrectAnswer]
			await connection.execute(
				`UPDATE question_options
				 SET is_correct = CASE WHEN option_key = ? THEN 1 ELSE 0 END
				 WHERE question_id = ?`,
				[correctKey, Number(questionId)]
			)
		}
	}

	static async getCertificateIdByCode(code) {
		const connection = await pool.getConnection()
		try {
			const [rows] = await connection.execute(
				`SELECT id FROM certificates WHERE UPPER(code) = UPPER(?) AND is_active = 1 LIMIT 1`,
				[code]
			)

			return rows.length ? Number(rows[0].id) : null
		} catch (error) {
			logger.error('Error finding certificate by code:', error)
			throw error
		} finally {
			connection.release()
		}
	}

	static async findAll(filters = {}) {
		const connection = await pool.getConnection()

		try {
			const { certificateId = null, includeAnswer = true } = filters
			const where = ['is_active = 1']
			const params = []

			if (certificateId) {
				where.push('certificate_id = ?')
				params.push(Number(certificateId))
			}

			const [questions] = await connection.execute(
				`SELECT id, certificate_id, question_text, explanation, is_fatal, image_url
				 FROM questions
				 WHERE ${where.join(' AND ')}
				 ORDER BY certificate_id ASC, id ASC`,
				params
			)

			return await this.attachOptions(connection, questions, includeAnswer)
		} catch (error) {
			logger.error('Error finding all questions:', error)
			throw error
		} finally {
			connection.release()
		}
	}

	static async findById(questionId, filters = {}) {
		const connection = await pool.getConnection()

		try {
			const { certificateId = null, includeAnswer = true } = filters
			const where = ['id = ?', 'is_active = 1']
			const params = [Number(questionId)]

			if (certificateId) {
				where.push('certificate_id = ?')
				params.push(Number(certificateId))
			}

			const [questions] = await connection.execute(
				`SELECT id, certificate_id, question_text, explanation, is_fatal, image_url
				 FROM questions
				 WHERE ${where.join(' AND ')}
				 LIMIT 1`,
				params
			)

			if (!questions.length) {
				return null
			}

			const [mapped] = await this.attachOptions(connection, [questions[0]], includeAnswer)
			return mapped || null
		} catch (error) {
			logger.error('Error finding question by id:', error)
			throw error
		} finally {
			connection.release()
		}
	}

	static async findByIds(questionIds, filters = {}) {
		const connection = await pool.getConnection()

		try {
			const normalizedIds = [...new Set((questionIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))]
			if (!normalizedIds.length) {
				return []
			}

			const { certificateId = null, includeAnswer = true } = filters
			const placeholders = normalizedIds.map(() => '?').join(', ')
			const where = [`id IN (${placeholders})`, 'is_active = 1']
			const params = [...normalizedIds]

			if (certificateId) {
				where.push('certificate_id = ?')
				params.push(Number(certificateId))
			}

			const [questions] = await connection.execute(
				`SELECT id, certificate_id, question_text, explanation, is_fatal, image_url
				 FROM questions
				 WHERE ${where.join(' AND ')}`,
				params
			)

			return await this.attachOptions(connection, questions, includeAnswer)
		} catch (error) {
			logger.error('Error finding questions by ids:', error)
			throw error
		} finally {
			connection.release()
		}
	}

	static async create(data) {
		const connection = await pool.getConnection()

		try {
			const {
				certificate_id = null,
				question_no = null,
				question_text,
				image_url = null,
				is_fatal = false,
				explanation = null,
				option_a,
				option_b,
				option_c = null,
				option_d = null,
				correct_answer,
				level = 'medium',
				source = 'manual',
			} = data

			if (!question_text || !option_a || !option_b || !correct_answer) {
				throw new Error('Missing required fields: question_text, option_a, option_b, correct_answer')
			}

			const answerNumber = Number(correct_answer)
			const optionCount = [option_a, option_b, option_c, option_d]
				.filter((option) => option !== null && option !== undefined && String(option).trim() !== '')
				.length
			if (answerNumber < 1 || answerNumber > optionCount) {
				throw new Error('correct_answer is out of option range')
			}

			const [result] = await connection.execute(
				`INSERT INTO questions (
					certificate_id, question_no, question_text, image_url, explanation,
					is_fatal, level, source, is_active, created_at, updated_at
				 )
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
				[
					certificate_id ? Number(certificate_id) : null,
					question_no ? Number(question_no) : null,
					question_text,
					image_url,
					explanation,
					is_fatal ? 1 : 0,
					String(level || 'medium').toLowerCase(),
					source,
				]
			)

			await this.upsertOptions(
				connection,
				result.insertId,
				{ option_a, option_b, option_c, option_d, correct_answer: answerNumber },
				answerNumber
			)

			logger.info(`Question created with id: ${result.insertId}`)
			return await this.findById(result.insertId, { includeAnswer: true })
		} catch (error) {
			logger.error('Error creating question:', error)
			throw error
		} finally {
			connection.release()
		}
	}

	static async update(questionId, data) {
		const connection = await pool.getConnection()

		try {
			const fields = []
			const values = []

			if (data.question_text !== undefined) {
				fields.push('question_text = ?')
				values.push(data.question_text)
			}
			if (data.image_url !== undefined) {
				fields.push('image_url = ?')
				values.push(data.image_url)
			}
			if (data.image !== undefined) {
				fields.push('image_url = ?')
				values.push(data.image)
			}
			if (data.is_fatal !== undefined) {
				fields.push('is_fatal = ?')
				values.push(data.is_fatal ? 1 : 0)
			}
			if (data.explanation !== undefined) {
				fields.push('explanation = ?')
				values.push(data.explanation)
			}
			if (data.option_a !== undefined) {
				// handled via question_options table
			}
			if (data.option_b !== undefined) {
				// handled via question_options table
			}
			if (data.option_c !== undefined) {
				// handled via question_options table
			}
			if (data.option_d !== undefined) {
				// handled via question_options table
			}
			if (data.correct_answer !== undefined) {
				// handled via question_options table
			}
			if (data.certificate_id !== undefined) {
				fields.push('certificate_id = ?')
				values.push(Number(data.certificate_id))
			}
			if (data.level !== undefined) {
				fields.push('level = ?')
				values.push(String(data.level).toLowerCase())
			}
			if (data.source !== undefined) {
				fields.push('source = ?')
				values.push(data.source)
			}

			if (fields.length) {
				values.push(questionId)
				await connection.execute(
					`UPDATE questions
					 SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
					 WHERE id = ?`,
					values
				)
			}

			if (
				data.option_a !== undefined
				|| data.option_b !== undefined
				|| data.option_c !== undefined
				|| data.option_d !== undefined
				|| data.correct_answer !== undefined
			) {
				await this.upsertOptions(connection, questionId, data)
			}

			return await this.findById(questionId, { includeAnswer: true })
		} catch (error) {
			logger.error('Error updating question:', error)
			throw error
		} finally {
			connection.release()
		}
	}

	static async delete(questionId) {
		const connection = await pool.getConnection()

		try {
			const [result] = await connection.execute(
				'DELETE FROM questions WHERE id = ?',
				[questionId]
			)

			return result.affectedRows > 0
		} catch (error) {
			logger.error('Error deleting question:', error)
			throw error
		} finally {
			connection.release()
		}
	}
}

export default QuestionModel
