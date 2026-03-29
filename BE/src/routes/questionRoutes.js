import express from 'express'
import { validateRequest } from '../middleware/validation.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  gradeExam,
} from '../controllers/questionController.js'
import {
  createQuestionSchema,
  updateQuestionSchema,
  gradeExamSchema,
} from '../validators/questionValidator.js'

const router = express.Router()

// Public routes
router.get('/', getAllQuestions)
router.get('/:id', getQuestionById)
router.post('/grade', validateRequest(gradeExamSchema), gradeExam)

// Admin routes
router.post('/', authenticate, authorize('admin'), validateRequest(createQuestionSchema), createQuestion)
router.patch('/:id', authenticate, authorize('admin'), validateRequest(updateQuestionSchema), updateQuestion)
router.delete('/:id', authenticate, authorize('admin'), deleteQuestion)

export default router
