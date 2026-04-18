import express from 'express'
import {
  getAdminExamManagementData,
  getAdminExamManagementDetail,
  getRandomExam,
  getExamFrom250,
  getExamFrom600,
  gradeExam,
  getExamsSummary,
  getExamsList,
} from '../controllers/examController.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'

const router = express.Router()

// Instructor/Admin routes - exams management with pass rate stats
/**
 * GET /api/v1/exams/summary
 * Get exams summary: totalExams, activeExams, draftExams, averagePassRate
 */
router.get('/summary', authenticate, authorize('admin', 'instructor'), getExamsSummary)

/**
 * GET /api/v1/exams
 * Get exams list with pass rate and attempts statistics
 * Query: ?page=1&limit=10
 */
router.get('/', authenticate, authorize('admin', 'instructor'), getExamsList)

// Admin routes (read-only)
router.get('/admin/management', authenticate, authorize('admin'), getAdminExamManagementData)
router.get('/admin/management/:examId', authenticate, authorize('admin'), getAdminExamManagementDetail)

// Public routes
/**
 * GET /api/v1/exams/random?licenseType=A1&examsSource=exam_250
 * Get random exam từ 250 (25 câu) hoặc 600 (35 câu)
 */
router.get('/random', getRandomExam)

/**
 * GET /api/v1/exams/250?licenseType=A1
 * Get random exam 25 câu từ 250 câu (A1)
 */
router.get('/250', getExamFrom250)

/**
 * GET /api/v1/exams/600?licenseType=B1
 * Get random exam 35 câu từ 600 câu (B1)
 */
router.get('/600', getExamFrom600)

/**
 * POST /api/v1/exams/grade
 * Grade exam submitted by user
 * Body: { questions: [...], userAnswers: {...}, examsSource: 'exam_250' }
 */
router.post('/grade', gradeExam)

export default router
