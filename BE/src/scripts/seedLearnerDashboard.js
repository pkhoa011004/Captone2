import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { LearnerDashboardModel } from '../models/LearnerDashboardModel.js'

function buildSeedPayload(user = {}, index = 0) {
  const isB1 = String(user.license_type || 'A1').toUpperCase() === 'B1'
  const totalQuestions = Number(isB1 ? 600 : 250)
  const baseCompleted = isB1
    ? 220 + (index % 8) * 35
    : 120 + (index % 8) * 18
  const completedQuestions = Math.min(baseCompleted, totalQuestions)
  const latestTestTotal = Number(isB1 ? 35 : 30)
  const latestTestCorrect = Math.max(0, latestTestTotal - ((index % 6) + 1))

  const hoursAhead = 24 + (index % 5) * 6
  const nextSessionAt = new Date(Date.now() + hoursAhead * 60 * 60 * 1000)

  return {
    completedQuestions,
    totalQuestions,
    latestTestName: `Practice Exam #${12 + index}`,
    latestTestCorrect,
    latestTestTotal,
    aiFocusTopic: index % 2 === 0 ? 'Right-of-Way' : 'Traffic Signs',
    aiMessage:
      index % 2 === 0
        ? 'Your performance in Right-of-Way scenarios is slightly lagging. Let\'s focus there next.'
        : 'Great progress on regulations. Spend a bit more time reviewing traffic signs.',
    nextSessionTitle: 'Simulation Training',
    nextSessionAt: nextSessionAt.toISOString().slice(0, 19).replace('T', ' '),
    simulationImageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzuBhk3q3lHZyFQgpUu_MwnkvMVRy3NwtvDg&s',
  }
}

async function seedLearnerDashboard() {
  const connection = await pool.getConnection()

  try {
    await LearnerDashboardModel.ensureTable(connection)

    const [users] = await connection.execute(
      `SELECT id, name, license_type
       FROM users
       ORDER BY id ASC`
    )

    if (!users.length) {
      logger.warn('No users found. Create users before running learner dashboard seed.')
      return
    }

    await connection.beginTransaction()

    for (let index = 0; index < users.length; index += 1) {
      const user = users[index]
      const payload = buildSeedPayload(user, index)

      await LearnerDashboardModel.upsertByUserId(user.id, payload, connection)
    }

    await connection.commit()
    logger.info(`Seeded learner dashboard data for ${users.length} user(s)`)
  } catch (error) {
    await connection.rollback()
    logger.error('Failed to seed learner dashboard data:', error)
    throw error
  } finally {
    connection.release()
    await pool.end()
  }
}

seedLearnerDashboard()
  .then(() => {
    logger.info('Learner dashboard seed completed')
    process.exit(0)
  })
  .catch((error) => {
    logger.error('Learner dashboard seed failed:', error)
    process.exit(1)
  })
