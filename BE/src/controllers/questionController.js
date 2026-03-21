import { QuestionService } from '../services/QuestionService.js'
import { successResponse } from '../utils/responseHandler.js'

export const getAllQuestions = async (req, res, next) => {
  try {
    const { certificateId, licenseType, includeAnswer } = req.query

    const questions = await QuestionService.getAllQuestions({
      certificateId,
      licenseType,
      includeAnswer: includeAnswer !== 'false',
    })

    successResponse(res, questions, 'Questions retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params
    const { certificateId, licenseType, includeAnswer } = req.query

    const question = await QuestionService.getQuestionById(Number(id), {
      certificateId,
      licenseType,
      includeAnswer: includeAnswer !== 'false',
    })

    successResponse(res, question, 'Question retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const createQuestion = async (req, res, next) => {
  try {
    const question = await QuestionService.createQuestion(req.validatedData)
    successResponse(res, question, 'Question created successfully', 201)
  } catch (error) {
    next(error)
  }
}

export const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params
    const { certificateId, licenseType } = req.query

    const question = await QuestionService.updateQuestion(Number(id), req.validatedData, {
      certificateId,
      licenseType,
    })

    successResponse(res, question, 'Question updated successfully')
  } catch (error) {
    next(error)
  }
}

export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params
    const { certificateId, licenseType } = req.query

    await QuestionService.deleteQuestion(Number(id), {
      certificateId,
      licenseType,
    })

    successResponse(res, null, 'Question deleted successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
}
