import { pool } from './database.js'
import { logger } from '../utils/logger.js'
import { LearnerScheduleModel } from '../models/LearnerScheduleModel.js'

export async function ensureUsersEmailVerificationSchema() {
  let connection

  try {
    connection = await pool.getConnection()

    const [dbResult] = await connection.execute('SELECT DATABASE() AS db_name')
    const databaseName = dbResult?.[0]?.db_name

    if (!databaseName) {
      logger.warn('⚠️ Auto-migration skipped: no active database selected')
      return false
    }

    const [tableRows] = await connection.execute(
      `SELECT COUNT(*) AS total
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [databaseName]
    )

    if (!tableRows?.[0]?.total) {
      logger.warn(`⚠️ Auto-migration skipped: table users not found in schema ${databaseName}`)
      return false
    }

    const [columnRows] = await connection.execute(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'users'
         AND COLUMN_NAME IN ('email_verified', 'verification_token', 'token_expires_at')`,
      [databaseName]
    )

    const hasEmailVerified = columnRows.some((row) => row.COLUMN_NAME === 'email_verified')
    const hasVerificationToken = columnRows.some((row) => row.COLUMN_NAME === 'verification_token')
    const hasTokenExpiresAt = columnRows.some((row) => row.COLUMN_NAME === 'token_expires_at')

    if (!hasEmailVerified) {
      await connection.execute(
        'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER updated_at'
      )
    }

    if (!hasVerificationToken) {
      await connection.execute(
        'ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL AFTER email_verified'
      )
    }

    if (!hasTokenExpiresAt) {
      await connection.execute(
        'ALTER TABLE users ADD COLUMN token_expires_at DATETIME NULL AFTER verification_token'
      )
    }

    await connection.execute(
      `ALTER TABLE users
         MODIFY COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0,
         MODIFY COLUMN verification_token VARCHAR(255) NULL,
         MODIFY COLUMN token_expires_at DATETIME NULL`
    )

    const [indexRows] = await connection.execute(
      `SELECT COUNT(*) AS total
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'users'
         AND INDEX_NAME = 'uq_users_verification_token'`,
      [databaseName]
    )

    if (!indexRows?.[0]?.total) {
      await connection.execute(
        'CREATE UNIQUE INDEX uq_users_verification_token ON users (verification_token)'
      )
    }

    await connection.execute(
      'UPDATE users SET email_verified = 0 WHERE email_verified IS NULL'
    )

    logger.info('✅ Auto-migration completed: users email verification schema is up to date')
    return true
  } catch (error) {
    logger.error(`❌ Auto-migration failed: ${error.message}`)
    return false
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function ensureLearnerScheduleSchema() {
  let connection

  try {
    connection = await pool.getConnection()
    await LearnerScheduleModel.ensureTable(connection)
    logger.info('✅ Auto-migration completed: learner schedule schema is up to date')
    return true
  } catch (error) {
    logger.error(`❌ Learner schedule auto-migration failed: ${error.message}`)
    return false
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function ensureTestResultsSchema() {
  let connection

  try {
    connection = await pool.getConnection()

    const [dbResult] = await connection.execute('SELECT DATABASE() AS db_name')
    const databaseName = dbResult?.[0]?.db_name

    if (!databaseName) {
      logger.warn('⚠️ Auto-migration skipped: no active database selected')
      return false
    }

    const [tableRows] = await connection.execute(
      `SELECT COUNT(*) AS total
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'test_results'`,
      [databaseName]
    )

    const tableExists = tableRows?.[0]?.total > 0

    if (!tableExists) {
      await connection.execute(`
        CREATE TABLE test_results (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          exam_id BIGINT UNSIGNED NOT NULL,
          score INT NOT NULL COMMENT 'Score achieved in the test',
          passed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = failed, 1 = passed',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
          INDEX idx_test_results_user_id (user_id),
          INDEX idx_test_results_exam_id (exam_id),
          INDEX idx_test_results_created_at (created_at)
        )
      `)
      logger.info('✅ Created test_results table')
    }

    logger.info('✅ Auto-migration completed: test_results schema is up to date')
    return true
  } catch (error) {
    logger.error(`❌ Auto-migration failed for test_results: ${error.message}`)
    return false
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export default ensureUsersEmailVerificationSchema