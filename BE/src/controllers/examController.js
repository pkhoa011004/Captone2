import { ExamService } from '../services/ExamService.js'
import { QuestionService } from '../services/QuestionService.js'
import { successResponse } from '../utils/responseHandler.js'
import { logger } from '../utils/logger.js'

const parseCategoriesQuery = (value) => {
  if (!value) return []

  return String(value)
    .split(',')
    .map((item) => String(item || '').trim().toUpperCase())
    .filter(Boolean)
}

const parseBooleanQuery = (value) => {
  if (value === undefined || value === null) return false
  return ['1', 'true', 'yes', 'y'].includes(String(value).trim().toLowerCase())
}

/**
 * Get random exam từ 250 hoặc 600 câu
 * Query: ?licenseType=A1&examsSource=exam_250
 */
export const getRandomExam = async (req, res, next) => {
  try {
    const { licenseType = 'A1', examsSource = 'exam_250', categories, fatalOnly } = req.query
    const selectedCategories = parseCategoriesQuery(categories)
    const options = { fatalOnly: parseBooleanQuery(fatalOnly) }

    if (!['exam_250', 'exam_600'].includes(examsSource)) {
      const error = new Error('Invalid examsSource. Must be exam_250 or exam_600')
      error.statusCode = 400
      throw error
    }

    if (examsSource === 'exam_600' && licenseType !== 'B1') {
      const error = new Error('exam_600 is only available for B1 license type')
      error.statusCode = 400
      throw error
    }

    const exam = await ExamService.getRandomExam(licenseType, examsSource, selectedCategories, options)
    successResponse(res, exam, 'Random exam generated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Get exam từ 250 câu (25 câu)
 * GET /api/v1/exams/250?licenseType=A1
 */
export const getExamFrom250 = async (req, res, next) => {
  try {
    const licenseType = req.query.licenseType || 'A1'
    const selectedCategories = parseCategoriesQuery(req.query.categories)
    const options = { fatalOnly: parseBooleanQuery(req.query.fatalOnly) }

    const exam = await ExamService.getRandomExamFrom250(licenseType, selectedCategories, options)
    successResponse(res, exam, 'Exam from 250 questions generated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Get exam từ 600 câu (35 câu)
 * GET /api/v1/exams/600?licenseType=B1
 */
export const getExamFrom600 = async (req, res, next) => {
  try {
    const licenseType = req.query.licenseType || 'B1'
    const selectedCategories = parseCategoriesQuery(req.query.categories)
    const options = { fatalOnly: parseBooleanQuery(req.query.fatalOnly) }

    if (licenseType !== 'B1') {
      const error = new Error('Only B1 license type is supported for 600 questions exam')
      error.statusCode = 400
      throw error
    }

    const exam = await ExamService.getRandomExamFrom600(licenseType, selectedCategories, options)
    successResponse(res, exam, 'Exam from 600 questions generated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Grade exam submitted by user
 * POST /api/v1/exams/grade
 * Body: { questions: [...], userAnswers: {...}, examsSource: 'exam_250' }
 */
export const gradeExam = async (req, res, next) => {
  try {
    const { questions, userAnswers, examsSource = 'exam_250' } = req.body

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      const error = new Error('questions array is required and must not be empty')
      error.statusCode = 400
      throw error
    }

    if (!userAnswers || typeof userAnswers !== 'object') {
      const error = new Error('userAnswers object is required')
      error.statusCode = 400
      throw error
    }

    const questionIds = questions
      .map((question) => Number(question?.id ?? question?.question_id))
      .filter((id) => Number.isFinite(id) && id > 0)

    const answers = Object.entries(userAnswers).map(([questionId, selectedAnswer]) => ({
      question_id: Number(questionId),
      selected_answer: selectedAnswer === null || selectedAnswer === undefined || selectedAnswer === ''
        ? null
        : Number(selectedAnswer),
    }))

    const licenseType = req.body.licenseType
      ? String(req.body.licenseType).trim().toUpperCase()
      : (examsSource === 'exam_600' ? 'B1' : 'A1')

    const gradeResult = await QuestionService.gradeExam({
      licenseType,
      question_ids: questionIds,
      answers,
    })

    logger.info(`Exam graded: ${gradeResult.total_questions} questions, score: ${gradeResult.score_percent}%`)

    successResponse(res, gradeResult, 'Exam graded successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Get admin exam management data (read-only)
 * GET /api/v1/exams/admin/management
 */
export const getAdminExamManagementData = async (req, res, next) => {
  try {
    const { search, licenseType, license, source, status, page, limit } = req.query
    const data = await ExamService.getAdminExamManagementData({
      search,
      licenseType: licenseType || license,
      source,
      status,
      page,
      limit,
    })

    successResponse(res, data, 'Admin exam management data retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const getInstructorExamManagementData = async (req, res, next) => {
  try {
    const { search, licenseType, license, source, status, page, limit } = req.query
    const data = await ExamService.getAdminExamManagementData({
      search,
      licenseType: licenseType || license,
      source,
      status,
      page,
      limit,
    })

    successResponse(res, data, 'Instructor exam management data retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const getPublicExamCatalogData = async (req, res, next) => {
  try {
    const { search, licenseType, source, page, limit } = req.query
    const data = await ExamService.getAdminExamManagementData({
      search,
      licenseType,
      source,
      page,
      limit,
    })

    successResponse(res, data, 'Public exam catalog retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const createInstructorExam = async (req, res, next) => {
  try {
    const createdExam = await ExamService.createInstructorExam({
      title: req.body?.title || req.body?.examName,
      examName: req.body?.examName,
      licenseType: req.body?.licenseType,
      source: req.body?.source || req.body?.examsSource,
      questionCount: req.body?.questionCount,
      durationMinutes: req.body?.durationMinutes,
      passThreshold: req.body?.passThreshold,
      status: req.body?.status || 'published', // Default to published
    })

    successResponse(res, { exam: createdExam }, 'Exam created successfully', 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Get detail of one admin exam (read-only)
 * GET /api/v1/exams/admin/management/:examId
 */
export const getAdminExamManagementDetail = async (req, res, next) => {
  try {
    const { examId } = req.params
    const data = await ExamService.getAdminExamManagementDetail({ examId })
    successResponse(res, data, 'Admin exam detail retrieved successfully')
  } catch (error) {
    next(error)
  }
}
