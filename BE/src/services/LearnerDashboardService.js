import { LearnerDashboardModel } from '../models/LearnerDashboardModel.js'

const FALLBACK_IMAGE =
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/Cover_744a8e3903.jpg'
const LEGACY_FALLBACK_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzuBhk3q3lHZyFQgpUu_MwnkvMVRy3NwtvDg&s'

export class LearnerDashboardService {
  static normalizeSimulationImageUrl(value) {
    const resolved = String(value || '').trim()
    if (!resolved || resolved === LEGACY_FALLBACK_IMAGE) {
      return FALLBACK_IMAGE
    }

    return resolved
  }

  static normalizePositiveNumber(value, fallback = 0) {
    const normalized = Number(value)
    if (!Number.isFinite(normalized) || normalized < 0) {
      return Number(fallback) || 0
    }
    return normalized
  }

  static normalizeDateTimeOrNull(value) {
    if (!value) return null

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return null
    }

    return date.toISOString().slice(0, 19).replace('T', ' ')
  }

  static inferDefaultTotalQuestions(payload = {}) {
    const examsSource = String(payload?.examsSource || '').trim().toLowerCase()
    const licenseType = String(payload?.licenseType || '').trim().toUpperCase()

    if (examsSource === 'exam_250' || licenseType === 'A1') return 250
    if (examsSource === 'exam_600' || licenseType === 'B1') return 600
    return 600
  }

  static mapProfileToDashboard(profile) {
    if (!profile) {
      return {
        knowledgeTheory: {
          completedQuestions: 0,
          totalQuestions: 600,
          completionPercent: 0,
        },
        latestTest: {
          name: 'No test yet',
          correctAnswers: 0,
          totalQuestions: 0,
          accuracyPercent: 0,
        },
        aiLearningBridge: {
          focusTopic: 'Traffic rules',
          message: 'Start a practice test to receive AI insights.',
        },
        simulationTraining: {
          title: 'Simulation Training',
          nextSessionAt: null,
          imageUrl: FALLBACK_IMAGE,
        },
      }
    }

    const completedQuestions = Number(profile.completed_questions || 0)
    const totalQuestions = Number(profile.total_questions || 600)
    const latestTestCorrect = Number(profile.latest_test_correct || 0)
    const latestTestTotal = Number(profile.latest_test_total || 0)

    const completionPercent = totalQuestions > 0
      ? Math.max(0, Math.min(100, Math.round((completedQuestions / totalQuestions) * 100)))
      : 0

    const accuracyPercent = latestTestTotal > 0
      ? Math.round((latestTestCorrect / latestTestTotal) * 100)
      : 0

    return {
      knowledgeTheory: {
        completedQuestions,
        totalQuestions,
        completionPercent,
      },
      latestTest: {
        name: profile.latest_test_name || 'No test yet',
        correctAnswers: latestTestCorrect,
        totalQuestions: latestTestTotal,
        accuracyPercent,
      },
      aiLearningBridge: {
        focusTopic: profile.ai_focus_topic || 'Traffic rules',
        message: profile.ai_message || 'Start a practice test to receive AI insights.',
      },
      simulationTraining: {
        title: profile.next_session_title || 'Simulation Training',
        nextSessionAt: profile.next_session_at || null,
        imageUrl: this.normalizeSimulationImageUrl(
          profile.simulation_image_url || FALLBACK_IMAGE
        ),
      },
    }
  }

  static async getDashboardByUserId(userId) {
    const profile = await LearnerDashboardModel.findByUserId(userId)
    return this.mapProfileToDashboard(profile)
  }

  static async updateDashboardByUserId(userId, payload = {}) {
    const existingProfile = await LearnerDashboardModel.findByUserId(userId)
    const existingDashboard = this.mapProfileToDashboard(existingProfile)

    const existingCompleted = this.normalizePositiveNumber(
      existingDashboard?.knowledgeTheory?.completedQuestions,
      0
    )
    const incomingCompleted = payload?.knowledgeTheory?.completedQuestions
    const progressIncrement = this.normalizePositiveNumber(payload?.knowledgeTheory?.progressIncrement, 0)

    const mergedCompleted = incomingCompleted !== undefined
      ? this.normalizePositiveNumber(incomingCompleted, existingCompleted)
      : (existingCompleted + progressIncrement)

    const defaultTotalQuestions = this.inferDefaultTotalQuestions(payload)
    const mergedTotal = this.normalizePositiveNumber(
      payload?.knowledgeTheory?.totalQuestions,
      existingDashboard?.knowledgeTheory?.totalQuestions ?? defaultTotalQuestions
    )

    const latestTestName = payload?.latestTest?.name
      ?? existingDashboard?.latestTest?.name
      ?? 'No test yet'
    const latestTestCorrect = payload?.latestTest?.correctAnswers
      ?? existingDashboard?.latestTest?.correctAnswers
      ?? 0
    const latestTestTotal = payload?.latestTest?.totalQuestions
      ?? existingDashboard?.latestTest?.totalQuestions
      ?? 0

    const aiFocusTopic = payload?.aiLearningBridge?.focusTopic
      ?? existingDashboard?.aiLearningBridge?.focusTopic
      ?? 'Traffic rules'
    const aiMessage = payload?.aiLearningBridge?.message
      ?? existingDashboard?.aiLearningBridge?.message
      ?? 'Start a practice test to receive AI insights.'

    const simulationTitle = payload?.simulationTraining?.title
      ?? existingDashboard?.simulationTraining?.title
      ?? 'Simulation Training'
    const simulationImage = payload?.simulationTraining?.imageUrl
      ?? existingDashboard?.simulationTraining?.imageUrl
      ?? FALLBACK_IMAGE

    const nextSessionAtInput = payload?.simulationTraining?.nextSessionAt
      ?? existingDashboard?.simulationTraining?.nextSessionAt
      ?? null

    await LearnerDashboardModel.upsertByUserId(userId, {
      completedQuestions: mergedCompleted,
      totalQuestions: mergedTotal || defaultTotalQuestions,
      latestTestName,
      latestTestCorrect: this.normalizePositiveNumber(latestTestCorrect, 0),
      latestTestTotal: this.normalizePositiveNumber(latestTestTotal, 0),
      aiFocusTopic,
      aiMessage,
      nextSessionTitle: simulationTitle,
      nextSessionAt: this.normalizeDateTimeOrNull(nextSessionAtInput),
      simulationImageUrl: this.normalizeSimulationImageUrl(simulationImage),
    })

    return await this.getDashboardByUserId(userId)
  }
}

export default LearnerDashboardService
