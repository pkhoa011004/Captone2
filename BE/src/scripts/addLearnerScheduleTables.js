import dotenv from 'dotenv'
import { pool } from '../config/database.js'
import { LearnerScheduleModel } from '../models/LearnerScheduleModel.js'
import { logger } from '../utils/logger.js'

dotenv.config()

async function addLearnerScheduleTables() {
  const connection = await pool.getConnection()

  try {
    await LearnerScheduleModel.ensureTable(connection)
    logger.info('✅ Learner schedule tables are ready')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Failed to create learner schedule tables:', error)
    process.exit(1)
  } finally {
    connection.release()
    await pool.end()
  }
}

addLearnerScheduleTables()
