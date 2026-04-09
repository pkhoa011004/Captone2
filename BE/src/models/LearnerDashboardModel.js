import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'

export class LearnerDashboardModel {
  static async ensureTable(connection) {
    await connection.execute(
      `CREATE TABLE IF NOT EXISTS learner_dashboard_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        completed_questions INT NOT NULL DEFAULT 0,
        total_questions INT NOT NULL DEFAULT 600,
        latest_test_name VARCHAR(120) NULL,
        latest_test_correct INT NULL,
        latest_test_total INT NULL,
        ai_focus_topic VARCHAR(120) NULL,
        ai_message TEXT NULL,
        next_session_title VARCHAR(180) NULL,
        next_session_at DATETIME NULL,
        simulation_image_url VARCHAR(500) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_learner_dashboard_profiles_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    )
  }

  static async findByUserId(userId) {
    const connection = await pool.getConnection()

    try {
      await this.ensureTable(connection)

      const [rows] = await connection.execute(
        `SELECT id, user_id, completed_questions, total_questions,
                latest_test_name, latest_test_correct, latest_test_total,
                ai_focus_topic, ai_message,
                next_session_title, next_session_at, simulation_image_url,
                created_at, updated_at
         FROM learner_dashboard_profiles
         WHERE user_id = ?
         LIMIT 1`,
        [Number(userId)]
      )

      return rows[0] || null
    } catch (error) {
      logger.error('Error finding learner dashboard profile by user id:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async upsertByUserId(userId, payload = {}, connectionOverride = null) {
    const ownConnection = !connectionOverride
    const connection = connectionOverride || await pool.getConnection()

    try {
      await this.ensureTable(connection)

      await connection.execute(
        `INSERT INTO learner_dashboard_profiles (
          user_id,
          completed_questions,
          total_questions,
          latest_test_name,
          latest_test_correct,
          latest_test_total,
          ai_focus_topic,
          ai_message,
          next_session_title,
          next_session_at,
          simulation_image_url,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          completed_questions = VALUES(completed_questions),
          total_questions = VALUES(total_questions),
          latest_test_name = VALUES(latest_test_name),
          latest_test_correct = VALUES(latest_test_correct),
          latest_test_total = VALUES(latest_test_total),
          ai_focus_topic = VALUES(ai_focus_topic),
          ai_message = VALUES(ai_message),
          next_session_title = VALUES(next_session_title),
          next_session_at = VALUES(next_session_at),
          simulation_image_url = VALUES(simulation_image_url),
          updated_at = NOW()`,
        [
          Number(userId),
          Number(payload.completedQuestions || 0),
          Number(payload.totalQuestions || 600),
          payload.latestTestName || null,
          payload.latestTestCorrect ?? null,
          payload.latestTestTotal ?? null,
          payload.aiFocusTopic || null,
          payload.aiMessage || null,
          payload.nextSessionTitle || null,
          payload.nextSessionAt || null,
          payload.simulationImageUrl || null,
        ]
      )

      if (ownConnection) {
        const [rows] = await connection.execute(
          `SELECT id, user_id, completed_questions, total_questions,
                  latest_test_name, latest_test_correct, latest_test_total,
                  ai_focus_topic, ai_message,
                  next_session_title, next_session_at, simulation_image_url,
                  created_at, updated_at
           FROM learner_dashboard_profiles
           WHERE user_id = ?
           LIMIT 1`,
          [Number(userId)]
        )
        return rows[0] || null
      }

      return true
    } catch (error) {
      logger.error('Error upserting learner dashboard profile:', error)
      throw error
    } finally {
      if (ownConnection) {
        connection.release()
      }
    }
  }
}

export default LearnerDashboardModel