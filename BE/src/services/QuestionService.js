import { QuestionModel } from '../models/Question.js'
import { logger } from '../utils/logger.js'

export class QuestionService {
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
}

export default QuestionService
