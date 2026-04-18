import { LearnerDashboardService } from '../services/LearnerDashboardService.js'
import { successResponse } from '../utils/responseHandler.js'

export const getLearnerDashboard = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const dashboard = await LearnerDashboardService.getDashboardByUserId(userId)
    successResponse(res, dashboard, 'Learner dashboard retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const updateLearnerDashboard = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const dashboard = await LearnerDashboardService.updateDashboardByUserId(userId, req.body || {})
    successResponse(res, dashboard, 'Learner dashboard updated successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  getLearnerDashboard,
  updateLearnerDashboard,
}
