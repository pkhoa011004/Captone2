import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import {
  getSchedule,
  updateScheduleOverview,
  createSession,
  updateSession,
  deleteSession,
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/scheduleController.js'

const router = express.Router()

router.get('/', authenticate, getSchedule)
router.patch('/overview', authenticate, updateScheduleOverview)

router.get('/bookings', authenticate, getBookings)
router.post('/bookings', authenticate, createBooking)
router.patch('/bookings/:id', authenticate, updateBooking)
router.delete('/bookings/:id', authenticate, deleteBooking)

router.post('/sessions', authenticate, createSession)
router.patch('/sessions/:id', authenticate, updateSession)
router.delete('/sessions/:id', authenticate, deleteSession)

export default router
