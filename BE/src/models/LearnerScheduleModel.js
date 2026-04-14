import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'

export class LearnerScheduleModel {
  static async ensureTable(connection) {
    await connection.execute(
      `CREATE TABLE IF NOT EXISTS learner_schedule_overview (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        theory_percent INT NOT NULL DEFAULT 0,
        practice_percent INT NOT NULL DEFAULT 0,
        mock_tests_percent INT NOT NULL DEFAULT 0,
        exam_name VARCHAR(180) NULL,
        days_left INT NULL,
        milestone_title VARCHAR(180) NULL,
        milestone_description TEXT NULL,
        exam_location VARCHAR(255) NULL,
        exam_date DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_learner_schedule_overview_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    )

    await connection.execute(
      `CREATE TABLE IF NOT EXISTS learner_schedule_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        learner_id INT NOT NULL,
        instructor_id INT NULL,
        created_by_user_id INT NULL,
        session_type VARCHAR(40) NOT NULL,
        title VARCHAR(180) NOT NULL,
        session_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location VARCHAR(255) NULL,
        location_type VARCHAR(30) NOT NULL DEFAULT 'physical',
        status VARCHAR(30) NOT NULL DEFAULT 'upcoming',
        notes TEXT NULL,
        meeting_link VARCHAR(500) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_learner_schedule_sessions_learner (learner_id),
        INDEX idx_learner_schedule_sessions_instructor (instructor_id),
        INDEX idx_learner_schedule_sessions_date (session_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    )

    await connection.execute(
      `CREATE TABLE IF NOT EXISTS learner_schedule_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        learner_id INT NOT NULL,
        instructor_id INT NULL,
        session_id INT NULL,
        booked_by_user_id INT NULL,
        booked_by_role VARCHAR(30) NOT NULL DEFAULT 'learner',
        booking_status VARCHAR(30) NOT NULL DEFAULT 'pending',
        booking_reason VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_learner_schedule_bookings_learner (learner_id),
        INDEX idx_learner_schedule_bookings_instructor (instructor_id),
        INDEX idx_learner_schedule_bookings_session (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    )
  }

  static normalizeDateTimeOrNull(value) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().slice(0, 19).replace('T', ' ')
  }

  static normalizeDateOrNull(value) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().slice(0, 10)
  }

  static normalizeTimeOrNull(value) {
    if (!value) return null
    const valueString = String(value).trim()
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(valueString)) {
      return valueString.length === 5 ? `${valueString}:00` : valueString
    }
    const date = new Date(`1970-01-01T${valueString}`)
    if (Number.isNaN(date.getTime())) return null
    return date.toTimeString().slice(0, 8)
  }

  static normalizeSession(row) {
    if (!row) return null

    return {
      id: row.id,
      learnerId: row.learner_id,
      instructorId: row.instructor_id,
      createdByUserId: row.created_by_user_id,
      sessionType: row.session_type,
      title: row.title,
      sessionDate: row.session_date,
      startTime: row.start_time,
      endTime: row.end_time,
      location: row.location,
      locationType: row.location_type,
      status: row.status,
      notes: row.notes,
      meetingLink: row.meeting_link,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  static normalizeBooking(row) {
    if (!row) return null

    return {
      id: row.id,
      learnerId: row.learner_id,
      instructorId: row.instructor_id,
      sessionId: row.session_id,
      bookedByUserId: row.booked_by_user_id,
      bookedByRole: row.booked_by_role,
      bookingStatus: row.booking_status,
      bookingReason: row.booking_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  static normalizeOverview(row) {
    if (!row) return null

    return {
      id: row.id,
      userId: row.user_id,
      theoryPercent: row.theory_percent,
      practicePercent: row.practice_percent,
      mockTestsPercent: row.mock_tests_percent,
      examName: row.exam_name,
      daysLeft: row.days_left,
      milestoneTitle: row.milestone_title,
      milestoneDescription: row.milestone_description,
      examLocation: row.exam_location,
      examDate: row.exam_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  static async findOverviewByUserId(userId) {
    const connection = await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const [rows] = await connection.execute(
        `SELECT id, user_id, theory_percent, practice_percent, mock_tests_percent,
                exam_name, days_left, milestone_title, milestone_description,
                exam_location, exam_date, created_at, updated_at
         FROM learner_schedule_overview
         WHERE user_id = ?
         LIMIT 1`,
        [Number(userId)]
      )

      return this.normalizeOverview(rows[0])
    } catch (error) {
      logger.error('Error finding learner schedule overview:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async upsertOverviewByUserId(userId, payload = {}, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)

      await connection.execute(
        `INSERT INTO learner_schedule_overview (
          user_id,
          theory_percent,
          practice_percent,
          mock_tests_percent,
          exam_name,
          days_left,
          milestone_title,
          milestone_description,
          exam_location,
          exam_date,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          theory_percent = VALUES(theory_percent),
          practice_percent = VALUES(practice_percent),
          mock_tests_percent = VALUES(mock_tests_percent),
          exam_name = VALUES(exam_name),
          days_left = VALUES(days_left),
          milestone_title = VALUES(milestone_title),
          milestone_description = VALUES(milestone_description),
          exam_location = VALUES(exam_location),
          exam_date = VALUES(exam_date),
          updated_at = NOW()`,
        [
          Number(userId),
          Number(payload.theoryPercent || 0),
          Number(payload.practicePercent || 0),
          Number(payload.mockTestsPercent || 0),
          payload.examName || null,
          payload.daysLeft ?? null,
          payload.milestoneTitle || null,
          payload.milestoneDescription || null,
          payload.examLocation || null,
          this.normalizeDateTimeOrNull(payload.examDate),
        ]
      )

      if (ownConnection) {
        return await this.findOverviewByUserId(userId)
      }

      return true
    } catch (error) {
      logger.error('Error upserting learner schedule overview:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }

  static async findSessionsByUserId(userId) {
    const connection = await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const [rows] = await connection.execute(
        `SELECT id, learner_id, instructor_id, created_by_user_id,
                session_type, title, session_date, start_time, end_time,
                location, location_type, status, notes, meeting_link,
                created_at, updated_at
         FROM learner_schedule_sessions
         WHERE learner_id = ?
         ORDER BY session_date ASC, start_time ASC`,
        [Number(userId)]
      )

      return rows.map((row) => this.normalizeSession(row))
    } catch (error) {
      logger.error('Error finding learner schedule sessions:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async createSession(payload = {}, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const learnerId = Number(payload.learnerId || payload.learner_id)
      const instructorId = payload.instructorId ?? payload.instructor_id ?? null
      const createdByUserId = payload.createdByUserId ?? payload.created_by_user_id ?? null
      const sessionType = String(payload.sessionType || payload.session_type || 'SESSION').trim().toUpperCase()
      const title = String(payload.title || '').trim()
      const sessionDate = this.normalizeDateOrNull(payload.sessionDate || payload.session_date)
      const startTime = this.normalizeTimeOrNull(payload.startTime || payload.start_time)
      const endTime = this.normalizeTimeOrNull(payload.endTime || payload.end_time)
      const location = payload.location || null
      const locationType = String(payload.locationType || payload.location_type || 'physical').trim().toLowerCase()
      const status = String(payload.status || 'upcoming').trim().toLowerCase()
      const notes = payload.notes || null
      const meetingLink = payload.meetingLink || payload.meeting_link || null

      const [result] = await connection.execute(
        `INSERT INTO learner_schedule_sessions (
          learner_id,
          instructor_id,
          created_by_user_id,
          session_type,
          title,
          session_date,
          start_time,
          end_time,
          location,
          location_type,
          status,
          notes,
          meeting_link,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          learnerId,
          instructorId,
          createdByUserId,
          sessionType,
          title,
          sessionDate,
          startTime,
          endTime,
          location,
          locationType,
          status,
          notes,
          meetingLink,
        ]
      )

      const [rows] = await connection.execute(
        `SELECT id, learner_id, instructor_id, created_by_user_id,
                session_type, title, session_date, start_time, end_time,
                location, location_type, status, notes, meeting_link,
                created_at, updated_at
         FROM learner_schedule_sessions
         WHERE id = ?
         LIMIT 1`,
        [result.insertId]
      )

      if (ownConnection) {
        return this.normalizeSession(rows[0])
      }

      return result.insertId
    } catch (error) {
      logger.error('Error creating learner schedule session:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }

  static async updateSession(sessionId, payload = {}, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const updates = []
      const values = []

      const mapping = {
        learnerId: 'learner_id',
        instructorId: 'instructor_id',
        createdByUserId: 'created_by_user_id',
        sessionType: 'session_type',
        title: 'title',
        sessionDate: 'session_date',
        startTime: 'start_time',
        endTime: 'end_time',
        location: 'location',
        locationType: 'location_type',
        status: 'status',
        notes: 'notes',
        meetingLink: 'meeting_link',
      }

      for (const [key, column] of Object.entries(mapping)) {
        if (payload[key] === undefined) continue

        let value = payload[key]
        if (key === 'sessionDate') value = this.normalizeDateOrNull(value)
        if (key === 'startTime' || key === 'endTime') value = this.normalizeTimeOrNull(value)
        if (key === 'sessionType' || key === 'locationType' || key === 'status') {
          value = String(value || '').trim().toUpperCase()
          if (key === 'locationType' || key === 'status') {
            value = String(value || '').trim().toLowerCase()
          }
        }

        updates.push(`${column} = ?`)
        values.push(value)
      }

      if (!updates.length) {
        return ownConnection ? await this.findSessionById(sessionId) : true
      }

      values.push(Number(sessionId))

      await connection.execute(
        `UPDATE learner_schedule_sessions
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = ?`,
        values
      )

      if (ownConnection) {
        return await this.findSessionById(sessionId)
      }

      return true
    } catch (error) {
      logger.error('Error updating learner schedule session:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }

  static async deleteSession(sessionId, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)

      await connection.execute(
        'DELETE FROM learner_schedule_sessions WHERE id = ?',
        [Number(sessionId)]
      )

      return true
    } catch (error) {
      logger.error('Error deleting learner schedule session:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }

  static async findSessionById(sessionId) {
    const connection = await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const [rows] = await connection.execute(
        `SELECT id, learner_id, instructor_id, created_by_user_id,
                session_type, title, session_date, start_time, end_time,
                location, location_type, status, notes, meeting_link,
                created_at, updated_at
         FROM learner_schedule_sessions
         WHERE id = ?
         LIMIT 1`,
        [Number(sessionId)]
      )

      return this.normalizeSession(rows[0])
    } catch (error) {
      logger.error('Error finding learner schedule session by id:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async findBookingsByUserId(userId) {
    const connection = await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const [rows] = await connection.execute(
        `SELECT id, learner_id, instructor_id, session_id, booked_by_user_id,
                booked_by_role, booking_status, booking_reason,
                created_at, updated_at
         FROM learner_schedule_bookings
         WHERE learner_id = ?
         ORDER BY created_at DESC`,
        [Number(userId)]
      )

      return rows.map((row) => this.normalizeBooking(row))
    } catch (error) {
      logger.error('Error finding learner schedule bookings:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async createBooking(payload = {}, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const learnerId = Number(payload.learnerId || payload.learner_id)
      const instructorId = payload.instructorId ?? payload.instructor_id ?? null
      const sessionId = payload.sessionId ?? payload.session_id ?? null
      const bookedByUserId = payload.bookedByUserId ?? payload.booked_by_user_id ?? null
      const bookedByRole = String(payload.bookedByRole || payload.booked_by_role || 'learner').trim().toLowerCase()
      const bookingStatus = String(payload.bookingStatus || payload.booking_status || 'pending').trim().toLowerCase()
      const bookingReason = payload.bookingReason || payload.booking_reason || null

      const [result] = await connection.execute(
        `INSERT INTO learner_schedule_bookings (
          learner_id,
          instructor_id,
          session_id,
          booked_by_user_id,
          booked_by_role,
          booking_status,
          booking_reason,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          learnerId,
          instructorId,
          sessionId,
          bookedByUserId,
          bookedByRole,
          bookingStatus,
          bookingReason,
        ]
      )

      const [rows] = await connection.execute(
        `SELECT id, learner_id, instructor_id, session_id, booked_by_user_id,
                booked_by_role, booking_status, booking_reason,
                created_at, updated_at
         FROM learner_schedule_bookings
         WHERE id = ?
         LIMIT 1`,
        [result.insertId]
      )

      if (ownConnection) {
        return this.normalizeBooking(rows[0])
      }

      return result.insertId
    } catch (error) {
      logger.error('Error creating learner schedule booking:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }

  static async updateBooking(bookingId, payload = {}, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const updates = []
      const values = []
      const mapping = {
        learnerId: 'learner_id',
        instructorId: 'instructor_id',
        sessionId: 'session_id',
        bookedByUserId: 'booked_by_user_id',
        bookedByRole: 'booked_by_role',
        bookingStatus: 'booking_status',
        bookingReason: 'booking_reason',
      }

      for (const [key, column] of Object.entries(mapping)) {
        if (payload[key] === undefined) continue
        let value = payload[key]
        if (key === 'bookedByRole' || key === 'bookingStatus') {
          value = String(value || '').trim().toLowerCase()
        }
        updates.push(`${column} = ?`)
        values.push(value)
      }

      if (!updates.length) {
        return ownConnection ? await this.findBookingById(bookingId) : true
      }

      values.push(Number(bookingId))

      await connection.execute(
        `UPDATE learner_schedule_bookings
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = ?`,
        values
      )

      if (ownConnection) {
        return await this.findBookingById(bookingId)
      }

      return true
    } catch (error) {
      logger.error('Error updating learner schedule booking:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }

  static async deleteBooking(bookingId, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)
      await connection.execute('DELETE FROM learner_schedule_bookings WHERE id = ?', [Number(bookingId)])
      return true
    } catch (error) {
      logger.error('Error deleting learner schedule booking:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }

  static async findBookingById(bookingId) {
    const connection = await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const [rows] = await connection.execute(
        `SELECT id, learner_id, instructor_id, session_id, booked_by_user_id,
                booked_by_role, booking_status, booking_reason,
                created_at, updated_at
         FROM learner_schedule_bookings
         WHERE id = ?
         LIMIT 1`,
        [Number(bookingId)]
      )

      return this.normalizeBooking(rows[0])
    } catch (error) {
      logger.error('Error finding learner schedule booking by id:', error)
      throw error
    } finally {
      connection.release()
    }
  }
}

export default LearnerScheduleModel
