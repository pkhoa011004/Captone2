import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'


export class QuestionModel {
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
				`SELECT id, certificate_id, question_text, option_a, option_b, option_c, option_d,
						correct_answer, explanation, is_fatal, image_url
				 FROM questions
				 WHERE ${where.join(' AND ')}
				 ORDER BY certificate_id ASC, id ASC`,
				params
			)

			return questions.map((question) => this.toResponse(question, includeAnswer))
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
				`SELECT id, certificate_id, question_text, option_a, option_b, option_c, option_d,
						correct_answer, explanation, is_fatal, image_url
				 FROM questions
				 WHERE ${where.join(' AND ')}
				 LIMIT 1`,
				params
			)

			if (!questions.length) {
				return null
			}

			return this.toResponse(questions[0], includeAnswer)
		} catch (error) {
			logger.error('Error finding question by id:', error)
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
				question_text,
				image_url = null,
				is_fatal = false,
				explanation = null,
				option_a,
				option_b,
				option_c = null,
				option_d = null,
				correct_answer,
				question_bank_id = 1,
				complexity_level = null,
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
					question_bank_id, question_text, option_a, option_b, option_c, option_d,
					correct_answer, explanation, is_fatal, complexity_level, certificate_id,
					image_url, is_active
				 )
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
				[
					Number(question_bank_id) || 1,
					question_text,
					option_a,
					option_b,
					option_c,
					option_d,
					String(answerNumber),
					explanation,
					is_fatal ? 1 : 0,
					complexity_level || (is_fatal ? 'critical' : 'medium'),
					certificate_id,
					image_url,
				]
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
				fields.push('option_a = ?')
				values.push(data.option_a)
			}
			if (data.option_b !== undefined) {
				fields.push('option_b = ?')
				values.push(data.option_b)
			}
			if (data.option_c !== undefined) {
				fields.push('option_c = ?')
				values.push(data.option_c)
			}
			if (data.option_d !== undefined) {
				fields.push('option_d = ?')
				values.push(data.option_d)
			}
			if (data.correct_answer !== undefined) {
				fields.push('correct_answer = ?')
				values.push(String(Number(data.correct_answer)))
			}
			if (data.certificate_id !== undefined) {
				fields.push('certificate_id = ?')
				values.push(Number(data.certificate_id))
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
