import { LearnerScheduleModel } from '../models/LearnerScheduleModel.js'
import { UserService } from './UserService.js'

const DEFAULT_OVERVIEW = {
  theoryPercent: 0,
  practicePercent: 0,
  mockTestsPercent: 0,
  examName: 'No exam scheduled',
  daysLeft: 0,
  milestoneTitle: 'MILESTONE',
  milestoneDescription: 'No milestone has been set yet.',
  examLocation: '',
  examDate: null,
}

export class LearnerScheduleService {
  static calculateDaysLeft(examDate) {
    if (!examDate) return null

    const parsedExamDate = new Date(examDate)
    if (Number.isNaN(parsedExamDate.getTime())) return null

    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const rawDaysLeft = Math.ceil((parsedExamDate.getTime() - now.getTime()) / msPerDay)

    return Math.max(0, rawDaysLeft)
  }

  static toOverviewResponse(overview) {
    const resolved = overview || DEFAULT_OVERVIEW
    const computedDaysLeft = this.calculateDaysLeft(resolved.examDate)

    return {
      theoryPercent: Number(resolved.theoryPercent || 0),
      practicePercent: Number(resolved.practicePercent || 0),
      mockTestsPercent: Number(resolved.mockTestsPercent || 0),
      examName: resolved.examName || DEFAULT_OVERVIEW.examName,
      daysLeft:
        computedDaysLeft
        ?? (resolved.daysLeft ?? DEFAULT_OVERVIEW.daysLeft),
      milestoneTitle: resolved.milestoneTitle || DEFAULT_OVERVIEW.milestoneTitle,
      milestoneDescription: resolved.milestoneDescription || DEFAULT_OVERVIEW.milestoneDescription,
      examLocation: resolved.examLocation || DEFAULT_OVERVIEW.examLocation,
      examDate: resolved.examDate || DEFAULT_OVERVIEW.examDate,
    }
  }

  static toSessionsResponse(sessions = []) {
    return sessions.map((session) => ({
      id: session.id,
      learnerId: session.learnerId,
      instructorId: session.instructorId,
      createdByUserId: session.createdByUserId,
      sessionType: session.sessionType,
      title: session.title,
      date: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      locationType: session.locationType,
      status: session.status,
      notes: session.notes,
      meetingLink: session.meetingLink,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }))
  }

  static toBookingsResponse(bookings = []) {
    return bookings.map((booking) => ({
      id: booking.id,
      learnerId: booking.learnerId,
      instructorId: booking.instructorId,
      sessionId: booking.sessionId,
      bookedByUserId: booking.bookedByUserId,
      bookedByRole: booking.bookedByRole,
      bookingStatus: booking.bookingStatus,
      bookingReason: booking.bookingReason,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }))
  }

  static buildStudyPlan(overview) {
    const resolved = this.toOverviewResponse(overview)
    return [
      { label: 'Theory', percent: resolved.theoryPercent },
      { label: 'Practice', percent: resolved.practicePercent },
      { label: 'Mock Tests', percent: resolved.mockTestsPercent },
    ]
  }

  static buildCalendarDays(sessions = []) {
    const days = new Map()

    sessions.forEach((session) => {
      const date = session.date || session.sessionDate
      if (!date) return
      const key = String(date).slice(0, 10)
      const day = Number(key.slice(8, 10))
      if (!Number.isFinite(day)) return
      days.set(key, {
        day,
        hasEvent: true,
        hasIcon: session.locationType === 'virtual',
        active: false,
      })
    })

    return Array.from(days.entries()).map(([dateKey, dayData]) => ({
      dateKey,
      ...dayData,
    }))
  }

  static async getScheduleByUserId(userId) {
    const [user, overview, sessions, bookings] = await Promise.all([
      UserService.getUserById(userId).catch(() => null),
      LearnerScheduleModel.findOverviewByUserId(userId),
      LearnerScheduleModel.findSessionsByUserId(userId),
      LearnerScheduleModel.findBookingsByUserId(userId),
    ])

    const resolvedOverview = overview || {
      ...DEFAULT_OVERVIEW,
      examName: user?.license_type?.toUpperCase() === 'B1' ? 'B2 License Exam' : 'A1 License Exam',
      milestoneTitle: 'FINAL MILESTONE',
      milestoneDescription: user?.name
        ? `Keep your momentum, ${user.name}.`
        : DEFAULT_OVERVIEW.milestoneDescription,
    }

    return {
      overview: this.toOverviewResponse(resolvedOverview),
      studyPlan: this.buildStudyPlan(resolvedOverview),
      calendarDays: this.buildCalendarDays(sessions),
      sessions: this.toSessionsResponse(sessions),
      bookings: this.toBookingsResponse(bookings),
    }
  }

  static async updateScheduleOverviewByUserId(userId, payload = {}) {
    const updated = await LearnerScheduleModel.upsertOverviewByUserId(userId, payload)
    return this.toOverviewResponse(updated)
  }

  static async createSession(userId, payload = {}) {
    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    if (!payload.title) {
      const error = new Error('title is required')
      error.statusCode = 400
      throw error
    }

    if (!payload.sessionDate && !payload.session_date) {
      const error = new Error('sessionDate is required')
      error.statusCode = 400
      throw error
    }

    return await LearnerScheduleModel.createSession({
      ...payload,
      learnerId: Number(userId),
      createdByUserId: Number(userId),
    })
  }

  static async updateSession(userId, sessionId, payload = {}) {
    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const existing = await LearnerScheduleModel.findSessionById(sessionId)
    if (!existing) {
      const error = new Error('Schedule session not found')
      error.statusCode = 404
      throw error
    }

    const canModify =
      Number(existing.learnerId) === Number(userId)
      || Number(existing.createdByUserId) === Number(userId)

    if (!canModify) {
      const error = new Error('You do not have permission to update this session')
      error.statusCode = 403
      throw error
    }

    const sanitizedPayload = {
      ...payload,
      learnerId: Number(userId),
      createdByUserId: existing.createdByUserId || Number(userId),
    }

    return await LearnerScheduleModel.updateSession(sessionId, sanitizedPayload)
  }

  static async deleteSession(userId, sessionId) {
    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const existing = await LearnerScheduleModel.findSessionById(sessionId)
    if (!existing) {
      const error = new Error('Schedule session not found')
      error.statusCode = 404
      throw error
    }

    const canDelete =
      Number(existing.learnerId) === Number(userId)
      || Number(existing.createdByUserId) === Number(userId)

    if (!canDelete) {
      const error = new Error('You do not have permission to delete this session')
      error.statusCode = 403
      throw error
    }

    await LearnerScheduleModel.deleteSession(sessionId)
    return true
  }

  static async createBooking(userId, payload = {}) {
    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    return await LearnerScheduleModel.createBooking({
      ...payload,
      learnerId: Number(userId),
      bookedByUserId: Number(userId),
      bookedByRole: payload.bookedByRole || 'learner',
    })
  }

  static async updateBooking(userId, bookingId, payload = {}) {
    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const existing = await LearnerScheduleModel.findBookingById(bookingId)
    if (!existing) {
      const error = new Error('Booking not found')
      error.statusCode = 404
      throw error
    }

    if (Number(existing.learnerId) !== Number(userId)) {
      const error = new Error('You do not have permission to update this booking')
      error.statusCode = 403
      throw error
    }

    return await LearnerScheduleModel.updateBooking(bookingId, {
      ...payload,
      learnerId: Number(userId),
    })
  }

  static async deleteBooking(userId, bookingId) {
    if (!userId) {
      const error = new Error('User is not authenticated')
      error.statusCode = 401
      throw error
    }

    const existing = await LearnerScheduleModel.findBookingById(bookingId)
    if (!existing) {
      const error = new Error('Booking not found')
      error.statusCode = 404
      throw error
    }

    if (Number(existing.learnerId) !== Number(userId)) {
      const error = new Error('You do not have permission to delete this booking')
      error.statusCode = 403
      throw error
    }

    await LearnerScheduleModel.deleteBooking(bookingId)
    return true
  }
}

export default LearnerScheduleService
