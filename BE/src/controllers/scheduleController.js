import { LearnerScheduleService } from '../services/LearnerScheduleService.js'
import { successResponse } from '../utils/responseHandler.js'

export const getSchedule = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const schedule = await LearnerScheduleService.getScheduleByUserId(userId)
    successResponse(res, schedule, 'Learner schedule retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const updateScheduleOverview = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const overview = await LearnerScheduleService.updateScheduleOverviewByUserId(userId, req.body || {})
    successResponse(res, overview, 'Schedule overview updated successfully')
  } catch (error) {
    next(error)
  }
}

export const createSession = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const session = await LearnerScheduleService.createSession(userId, req.body || {})
    successResponse(res, session, 'Schedule session created successfully', 201)
  } catch (error) {
    next(error)
  }
}

export const updateSession = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const { id } = req.params
    const session = await LearnerScheduleService.updateSession(userId, id, req.body || {})
    successResponse(res, session, 'Schedule session updated successfully')
  } catch (error) {
    next(error)
  }
}

export const deleteSession = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const { id } = req.params
    await LearnerScheduleService.deleteSession(userId, id)
    successResponse(res, null, 'Schedule session deleted successfully')
  } catch (error) {
    next(error)
  }
}

export const getBookings = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const schedule = await LearnerScheduleService.getScheduleByUserId(userId)
    successResponse(res, schedule.bookings, 'Schedule bookings retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const createBooking = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const booking = await LearnerScheduleService.createBooking(userId, req.body || {})
    successResponse(res, booking, 'Booking created successfully', 201)
  } catch (error) {
    next(error)
  }
}

export const updateBooking = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const { id } = req.params
    const booking = await LearnerScheduleService.updateBooking(userId, id, req.body || {})
    successResponse(res, booking, 'Booking updated successfully')
  } catch (error) {
    next(error)
  }
}

export const deleteBooking = async (req, res, next) => {
  try {
    const userId = req?.user?.id

    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const { id } = req.params
    await LearnerScheduleService.deleteBooking(userId, id)
    successResponse(res, null, 'Booking deleted successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  getSchedule,
  updateScheduleOverview,
  createSession,
  updateSession,
  deleteSession,
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
}
