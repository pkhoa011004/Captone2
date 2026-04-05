import { QuestionModel } from '../models/Question.js'
import { logger } from '../utils/logger.js'

export class ExamService {
  // Cấu trúc exam 250 câu (25 câu per exam)
  static EXAM_250_STRUCTURE = {
    A1: {
      questionsPerExam: 25,
      structure: {
        REGULATIONS: 8,
        TRAFFIC_CULTURE: 1,
        DRIVING_TECHNIQUE: 1,
        TRAFFIC_SIGNS: 9,
        SITUATION_HANDLING: 6,
      },
    },
  }

  // Cấu trúc exam 600 câu (35 câu per exam)
  static EXAM_600_STRUCTURE = {
    B1: {
      questionsPerExam: 35,
      structure: {
        REGULATIONS: 10,
        TRAFFIC_CULTURE: 2,
        DRIVING_TECHNIQUE: 2,
        VEHICLE_REPAIR: 2,
        TRAFFIC_SIGNS: 12,
        SITUATION_HANDLING: 7,
      },
    },
  }

  /**
   * Infer category từ question ID cho bộ 250 câu
   */
  static inferCategoryFrom250(questionId) {
    const id = Number(questionId)
    if (id >= 1 && id <= 80) return 'REGULATIONS'
    if (id >= 81 && id <= 90) return 'TRAFFIC_CULTURE'
    if (id >= 91 && id <= 100) return 'DRIVING_TECHNIQUE'
    if (id >= 101 && id <= 180) return 'TRAFFIC_SIGNS'
    if (id >= 181 && id <= 250) return 'SITUATION_HANDLING'
    return 'OTHER'
  }

  /**
   * Infer category từ question ID cho bộ 600 câu
   */
  static inferCategoryFrom600(questionId) {
    const id = Number(questionId)

    if (id >= 1 && id <= 148) return 'REGULATIONS'
    if (id >= 149 && id <= 167) return 'TRAFFIC_CULTURE'
    if (id >= 168 && id <= 223) return 'DRIVING_TECHNIQUE'
    if (id >= 224 && id <= 264) return 'VEHICLE_REPAIR'
    if (id >= 265 && id <= 440) return 'TRAFFIC_SIGNS'
    if (id >= 441 && id <= 600) return 'SITUATION_HANDLING'

    return 'OTHER'
  }

  /**
   * Shuffle array
   */
  static shuffleArray(items = []) {
    const copied = [...items]
    for (let i = copied.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copied[i], copied[j]] = [copied[j], copied[i]]
    }
    return copied
  }

  static normalizeSelectedCategories(structure = {}, selectedCategories = []) {
    const availableCategories = Object.keys(structure)

    if (!Array.isArray(selectedCategories) || !selectedCategories.length) {
      return availableCategories
    }

    const normalized = [...new Set(
      selectedCategories
        .map((item) => String(item || '').trim().toUpperCase())
        .filter((item) => availableCategories.includes(item))
    )]

    if (!normalized.length) {
      return availableCategories
    }

    return normalized
  }

  static buildSelectedStructure(structure = {}, selectedCategories = [], totalQuestions = 0) {
    const categories = this.normalizeSelectedCategories(structure, selectedCategories)
    const originalCategories = Object.keys(structure)

    const isFullStructure =
      categories.length === originalCategories.length &&
      categories.every((category) => originalCategories.includes(category))

    if (isFullStructure) {
      return structure
    }

    const total = Number(totalQuestions)
    if (!Number.isFinite(total) || total <= 0) {
      return structure
    }

    const baseWeights = categories.map((category) => Number(structure[category] || 1))
    const sumWeights = baseWeights.reduce((acc, value) => acc + value, 0)

    const allocation = {}
    categories.forEach((category) => {
      allocation[category] = 1
    })

    let remaining = total - categories.length
    if (remaining <= 0) {
      return allocation
    }

    const floatShares = categories.map((category, index) => {
      const ratio = sumWeights > 0 ? baseWeights[index] / sumWeights : 1 / categories.length
      const exact = remaining * ratio
      const floor = Math.floor(exact)
      allocation[category] += floor
      return {
        category,
        remainder: exact - floor,
      }
    })

    const assignedExtra = Object.values(allocation).reduce((acc, value) => acc + value, 0) - categories.length
    let leftover = remaining - assignedExtra

    floatShares
      .sort((a, b) => b.remainder - a.remainder)
      .forEach(({ category }) => {
        if (leftover <= 0) return
        allocation[category] += 1
        leftover -= 1
      })

    return allocation
  }

  static pickQuestionsByStructure(pool = [], structure = {}, fallbackTotal = 0) {
    const usedIds = new Set()
    const selectedQuestions = []

    for (const [category, count] of Object.entries(structure)) {
      const categoryQuestions = this.shuffleArray(
        pool.filter((q) => !usedIds.has(q.id) && q.categoryInferred === category)
      ).slice(0, count)

      selectedQuestions.push(...categoryQuestions)
      categoryQuestions.forEach((q) => usedIds.add(q.id))
    }

    const targetTotal = Number(fallbackTotal) || selectedQuestions.length
    const missing = targetTotal - selectedQuestions.length

    if (missing > 0) {
      const fallback = this.shuffleArray(
        pool.filter((q) => !usedIds.has(q.id))
      ).slice(0, missing)

      fallback.forEach((q) => usedIds.add(q.id))
      selectedQuestions.push(...fallback)
    }

    return this.shuffleArray(selectedQuestions).slice(0, targetTotal)
  }

  static ensureAtLeastOneFatalQuestion(selectedQuestions = [], pool = []) {
    if (!Array.isArray(selectedQuestions) || !selectedQuestions.length) {
      return selectedQuestions
    }

    if (selectedQuestions.some((question) => Boolean(question?.is_fatal))) {
      return selectedQuestions
    }

    const selectedIds = new Set(selectedQuestions.map((question) => Number(question?.id)))
    const fatalCandidate = this.shuffleArray(
      (pool || []).filter(
        (question) => Boolean(question?.is_fatal) && !selectedIds.has(Number(question?.id))
      )
    )[0]

    if (!fatalCandidate) {
      return selectedQuestions
    }

    const replaceIndex = selectedQuestions.findIndex((question) => !Boolean(question?.is_fatal))
    if (replaceIndex < 0) {
      return selectedQuestions
    }

    const next = [...selectedQuestions]
    next[replaceIndex] = fatalCandidate
    return next
  }

  /**
   * Get exam từ 250 câu (25 câu)
   */
  static async getRandomExamFrom250(licenseType = 'A1', selectedCategories = [], options = {}) {
    try {
      const examConfig = this.EXAM_250_STRUCTURE[licenseType]
      if (!examConfig) {
        throw new Error(`Invalid licenseType: ${licenseType}`)
      }

      const fatalOnly = Boolean(options?.fatalOnly)

      // Lấy tất cả câu từ 1-250
      const allQuestions = await QuestionModel.findAll({
        includeAnswer: false,
      })

      let filtered = allQuestions
        .filter((q) => {
          const id = Number(q.id)
          return id >= 1 && id <= 250
        })
        .map((q) => ({
          ...q,
          categoryInferred: this.inferCategoryFrom250(q.id),
        }))

      if (fatalOnly) {
        filtered = filtered.filter((q) => Boolean(q.is_fatal))
      }

      if (!filtered.length) {
        throw new Error(
          fatalOnly
            ? 'No fatal questions available for selected criteria in exam_250'
            : 'No questions available for selected criteria in exam_250'
        )
      }

      const structure = this.buildSelectedStructure(
        examConfig.structure,
        selectedCategories,
        examConfig.questionsPerExam
      )
      let selectedQuestions = this.pickQuestionsByStructure(
        filtered,
        structure,
        examConfig.questionsPerExam
      )

      if (!fatalOnly) {
        selectedQuestions = this.ensureAtLeastOneFatalQuestion(selectedQuestions, filtered)
      }

      return {
        totalQuestions: examConfig.questionsPerExam,
        licenseType,
        examsSource: 'exam_250',
        fatalOnly,
        fatalCount: selectedQuestions.filter((question) => Boolean(question?.is_fatal)).length,
        selectedCategories: Object.keys(structure),
        categories: structure,
        questions: selectedQuestions,
      }
    } catch (error) {
      logger.error(`Error generating exam from 250: ${error.message}`)
      throw error
    }
  }

  /**
   * Get exam từ 600 câu (35 câu)
   */
  static async getRandomExamFrom600(licenseType = 'B1', selectedCategories = [], options = {}) {
    try {
      const examConfig = this.EXAM_600_STRUCTURE[licenseType]
      if (!examConfig) {
        throw new Error(`Invalid licenseType for 600: ${licenseType}`)
      }

      const fatalOnly = Boolean(options?.fatalOnly)

      // Lấy tất cả câu từ 1-600
      const allQuestions = await QuestionModel.findAll({
        includeAnswer: false,
      })

      let filtered = allQuestions
        .filter((q) => {
          const id = Number(q.id)
          return id >= 1 && id <= 600
        })
        .map((q) => ({
          ...q,
          categoryInferred: this.inferCategoryFrom600(q.id),
        }))

      if (fatalOnly) {
        filtered = filtered.filter((q) => Boolean(q.is_fatal))
      }

      if (!filtered.length) {
        throw new Error(
          fatalOnly
            ? 'No fatal questions available for selected criteria in exam_600'
            : 'No questions available for selected criteria in exam_600'
        )
      }

      const structure = this.buildSelectedStructure(
        examConfig.structure,
        selectedCategories,
        examConfig.questionsPerExam
      )
      let selectedQuestions = this.pickQuestionsByStructure(
        filtered,
        structure,
        examConfig.questionsPerExam
      )

      if (!fatalOnly) {
        selectedQuestions = this.ensureAtLeastOneFatalQuestion(selectedQuestions, filtered)
      }

      return {
        totalQuestions: examConfig.questionsPerExam,
        licenseType,
        examsSource: 'exam_600',
        fatalOnly,
        fatalCount: selectedQuestions.filter((question) => Boolean(question?.is_fatal)).length,
        selectedCategories: Object.keys(structure),
        categories: structure,
        questions: selectedQuestions,
      }
    } catch (error) {
      logger.error(`Error generating exam from 600: ${error.message}`)
      throw error
    }
  }

  /**
   * Get random exam (250 hoặc 600)
   */
  static async getRandomExam(licenseType, examsSource, selectedCategories = [], options = {}) {
    try {
      if (examsSource === 'exam_600') {
        return await this.getRandomExamFrom600(licenseType, selectedCategories, options)
      } else {
        return await this.getRandomExamFrom250(licenseType, selectedCategories, options)
      }
    } catch (error) {
      logger.error(`Error generating random exam: ${error.message}`)
      throw error
    }
  }

  /**
   * Check answer
   */
  static checkAnswer(question, userAnswer) {
    if (!question || !question.correct_answer) {
      return false
    }
    return String(userAnswer).toLowerCase().trim() === String(question.correct_answer).toLowerCase().trim()
  }

  /**
   * Grade exam
   */
  static gradeExam(questions, userAnswers, examsSource = 'exam_250') {
    const licenseType = examsSource === 'exam_600' ? 'B1' : 'A1'
    const passingScore = licenseType === 'B1' ? 27 : 21

    const correctCount = questions.reduce((count, question) => {
      const userAnswer = userAnswers[question.id]
      const isCorrect = this.checkAnswer(question, userAnswer)
      return isCorrect ? count + 1 : count
    }, 0)

    const score = Math.round((correctCount / questions.length) * 100)
    const isPassed = correctCount >= passingScore

    return {
      totalQuestions: questions.length,
      correctCount,
      score,
      isPassed,
      passingScore,
      licenseType,
      details: questions.map((question) => {
        const userAnswer = userAnswers[question.id]
        const isCorrect = this.checkAnswer(question, userAnswer)
        return {
          questionId: question.id,
          userAnswer,
          correctAnswer: question.correct_answer,
          isCorrect,
          category: question.categoryInferred,
        }
      }),
    }
  }
}
