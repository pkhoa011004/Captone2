import { QuestionModel } from '../models/Question.js'
import { logger } from '../utils/logger.js'

export class QuestionService {
  static DEFAULT_PASS_THRESHOLD_BY_LICENSE = {
    A1: 21,
    B1: 27,
  }

  static async resolveCertificateId({ certificateId, licenseType }) {
    if (certificateId !== undefined && certificateId !== null && certificateId !== '') {
      return Number(certificateId)
    }

    if (licenseType) {
      const resolved = await QuestionModel.getCertificateIdByCode(String(licenseType).trim().toUpperCase())
      if (!resolved) {
        const error = new Error(`Certificate not found for licenseType: ${licenseType}`)
        error.statusCode = 400
        throw error
      }
      return resolved
    }

    return null
  }

  static async getAllQuestions(filters = {}) {
    const certificateId = await this.resolveCertificateId(filters)
    const includeAnswer = filters.includeAnswer !== false

    return await QuestionModel.findAll({
      certificateId,
      includeAnswer,
    })
  }

  static async getQuestionById(questionId, filters = {}) {
    const certificateId = await this.resolveCertificateId(filters)
    const includeAnswer = filters.includeAnswer !== false

    const question = await QuestionModel.findById(questionId, {
      certificateId,
      includeAnswer,
    })

    if (!question) {
      const error = new Error('Question not found')
      error.statusCode = 404
      throw error
    }

    return question
  }

  static async createQuestion(questionData) {
    let certificateId = questionData.certificate_id

    if (!certificateId && questionData.licenseType) {
      certificateId = await this.resolveCertificateId({ licenseType: questionData.licenseType })
    }

    const question = await QuestionModel.create({
      ...questionData,
      certificate_id: certificateId ?? null,
    })

    logger.info(`Question created: ${question.id}`)
    return question
  }

  static async updateQuestion(questionId, questionData, filters = {}) {
    const certificateId = await this.resolveCertificateId(filters)
    const existing = await QuestionModel.findById(questionId, { certificateId, includeAnswer: true })

    if (!existing) {
      const error = new Error('Question not found')
      error.statusCode = 404
      throw error
    }

    const updatedQuestion = await QuestionModel.update(questionId, {
      ...questionData,
      certificate_id: questionData.certificate_id ?? certificateId,
    })

    logger.info(`Question updated: ${questionId}`)
    return updatedQuestion
  }

  static async deleteQuestion(questionId, filters = {}) {
    const certificateId = await this.resolveCertificateId(filters)
    const existing = await QuestionModel.findById(questionId, { certificateId, includeAnswer: true })

    if (!existing) {
      const error = new Error('Question not found')
      error.statusCode = 404
      throw error
    }

    await QuestionModel.delete(questionId)
    logger.info(`Question deleted: ${questionId}`)
    return true
  }

  static resolvePassThreshold({ pass_threshold, licenseType, totalQuestions }) {
    if (pass_threshold !== undefined && pass_threshold !== null) {
      const normalized = Number(pass_threshold)
      if (!Number.isNaN(normalized) && normalized >= 1) {
        return normalized
      }
    }

    const normalizedLicense = licenseType ? String(licenseType).trim().toUpperCase() : null
    if (normalizedLicense && this.DEFAULT_PASS_THRESHOLD_BY_LICENSE[normalizedLicense]) {
      return this.DEFAULT_PASS_THRESHOLD_BY_LICENSE[normalizedLicense]
    }

    return Math.ceil(Number(totalQuestions) * 0.84)
  }

  static async gradeExam(payload = {}) {
    const certificateId = await this.resolveCertificateId(payload)
    const questionIds = [...new Set((payload.question_ids || []).map((id) => Number(id)))]
    const answers = payload.answers || []
    const answerMap = new Map(answers.map((item) => [Number(item.question_id), item.selected_answer === null ? null : Number(item.selected_answer)]))

    const questions = await QuestionModel.findByIds(questionIds, {
      certificateId,
      includeAnswer: true,
    })

    if (questions.length !== questionIds.length) {
      const foundIds = new Set(questions.map((item) => Number(item.id)))
      const missingQuestionIds = questionIds.filter((id) => !foundIds.has(id))
      const error = new Error(`Some questions were not found or do not belong to this license: ${missingQuestionIds.join(', ')}`)
      error.statusCode = 400
      throw error
    }

    const questionById = new Map(questions.map((item) => [Number(item.id), item]))
    const details = []
    let correctCount = 0
    let incorrectCount = 0
    let fatalWrongCount = 0

    for (const questionId of questionIds) {
      const question = questionById.get(questionId)
      const selectedAnswer = answerMap.has(questionId) ? answerMap.get(questionId) : null
      const isAnswered = selectedAnswer !== null && selectedAnswer !== undefined
      const isCorrect = isAnswered && Number(selectedAnswer) === Number(question.correct_answer)
      const isFatalWrong = Boolean(question.is_fatal) && !isCorrect

      if (isCorrect) {
        correctCount += 1
      } else {
        incorrectCount += 1
      }

      if (isFatalWrong) {
        fatalWrongCount += 1
      }

      details.push({
        question_id: questionId,
        selected_answer: isAnswered ? Number(selectedAnswer) : null,
        correct_answer: Number(question.correct_answer),
        is_correct: isCorrect,
        is_fatal: Boolean(question.is_fatal),
        is_fatal_wrong: isFatalWrong,
      })
    }

    const totalQuestions = questionIds.length
    const passThreshold = this.resolvePassThreshold({
      pass_threshold: payload.pass_threshold,
      licenseType: payload.licenseType,
      totalQuestions,
    })

    const passedByScore = correctCount >= passThreshold
    const passedByFatalRule = fatalWrongCount === 0
    const passed = passedByScore && passedByFatalRule

    return {
      licenseType: payload.licenseType ? String(payload.licenseType).trim().toUpperCase() : null,
      certificate_id: certificateId,
      total_questions: totalQuestions,
      pass_threshold: passThreshold,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      fatal_wrong_count: fatalWrongCount,
      score_percent: totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0,
      passed,
      failed_reason: {
        score_not_enough: !passedByScore,
        wrong_fatal_question: !passedByFatalRule,
      },
      details,
    }
  }
}

export default QuestionService
