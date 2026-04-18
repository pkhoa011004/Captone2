import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import { getLearnerDashboard, updateLearnerDashboard } from '../controllers/learnerController.js'
import scheduleRoutes from './scheduleRoutes.js'

const router = express.Router()

/**
 * GET /api/v1/learners/dashboard
 * Get learner dashboard data for current authenticated user
 */
router.get('/dashboard', authenticate, getLearnerDashboard)
router.patch('/dashboard', authenticate, updateLearnerDashboard)
router.use('/schedule', scheduleRoutes)

export default router
