import { QuestionModel } from '../models/Question.js'
import { pool } from '../config/database.js'
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

  static ADMIN_EXAM_TEMPLATES = [
    {
      codePrefix: 'A1',
      licenseType: 'A1',
      source: 'exam_250',
      titlePrefix: 'A1 Theory Exam',
      questionsPerExam: 25,
      durationMinutes: 19,
      passThreshold: 21,
    },
    {
      codePrefix: 'B1',
      licenseType: 'B1',
      source: 'exam_600',
      titlePrefix: 'B1 Theory Exam',
      questionsPerExam: 35,
      durationMinutes: 22,
      passThreshold: 27,
    },
  ]

  static toNumberOrNull(value) {
    if (value === null || value === undefined) return null
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : null
  }

  static toPositiveIntegerOrDefault(value, fallback, min = 1, max = 100) {
    const numericValue = Number(value)
    if (!Number.isInteger(numericValue) || numericValue < min) {
      return fallback
    }

    return Math.min(numericValue, max)
  }

  static async tableExists(connection, tableName) {
    const [rows] = await connection.execute(
      `SELECT COUNT(*) AS table_count
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    )

    return Number(rows?.[0]?.table_count || 0) > 0
  }

  static async getTableColumns(connection, tableName) {
    const [rows] = await connection.execute(
      `SELECT COLUMN_NAME
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    )

    return new Set(
      (rows || []).map((row) => String(row.COLUMN_NAME || '').toLowerCase())
    )
  }

  static normalizeExamStatus(status) {
    const normalized = String(status || '').trim().toLowerCase()
    if (normalized === 'published') return 'Published'
    if (normalized === 'draft') return 'Draft'
    if (normalized === 'unavailable') return 'Unavailable'
    if (normalized === 'archived') return 'Unavailable'
    if (normalized === 'active' || normalized === 'ready') return 'Published'
    if (normalized === 'inactive' || normalized === 'disabled') return 'Unavailable'
    if (normalized === 'pending') return 'Draft'
    return ''
  }

  static pickFirstExistingColumn(columns = new Set(), candidates = []) {
    for (const candidate of candidates) {
      if (columns.has(String(candidate || '').toLowerCase())) {
        return candidate
      }
    }
    return null
  }

  static normalizeExamSource(source, licenseType, questionCount) {
    const normalizedSource = String(source || '').trim().toLowerCase()
    if (normalizedSource === 'exam_250' || normalizedSource === 'exam_600' || normalizedSource === 'manual') {
      return normalizedSource
    }

    if (normalizedSource) return normalizedSource

    const normalizedLicense = String(licenseType || '').trim().toUpperCase()
    if (normalizedLicense === 'B1') return 'exam_600'

    const totalQuestions = this.toNumberOrNull(questionCount) || 0
    if (totalQuestions >= 35) return 'exam_600'
    return 'exam_250'
  }

  static toIsoDateTimeOrNull(value) {
    if (!value) return null

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }

    return parsedDate.toISOString()
  }

  static getAdminSourceLabel(source) {
    const normalized = String(source || '').trim().toLowerCase()
    if (normalized === 'exam_250') return 'Question Bank 250'
    if (normalized === 'exam_600') return 'Question Bank 600'
    if (normalized === 'manual') return 'Manual'
    return source || '--'
  }

  static getAdminStatusDescription(status) {
    const normalized = this.normalizeExamStatus(status)
    if (normalized === 'Published') return 'Ready for learners'
    if (normalized === 'Draft') return 'Needs review before publishing'
    if (normalized === 'Unavailable') return 'Hidden or inactive'
    return 'Unknown status'
  }

  static getCategoryLabel(category) {
    const labels = {
      REGULATIONS: 'Regulations',
      TRAFFIC_CULTURE: 'Traffic Culture',
      DRIVING_TECHNIQUE: 'Driving Technique',
      VEHICLE_REPAIR: 'Vehicle Repair',
      TRAFFIC_SIGNS: 'Traffic Signs',
      SITUATION_HANDLING: 'Situation Handling',
    }

    return labels[category] || category
  }

  static getBaseStructureForAdminExam({ licenseType, source }) {
    const normalizedLicense = String(licenseType || '').trim().toUpperCase()
    const normalizedSource = String(source || '').trim().toLowerCase()

    if (normalizedSource === 'exam_600' || normalizedLicense === 'B1') {
      return this.EXAM_600_STRUCTURE.B1?.structure || {}
    }

    return this.EXAM_250_STRUCTURE.A1?.structure || {}
  }

  static buildAdminCategoryDistribution(exam = {}) {
    const questionCount = this.toNumberOrNull(exam.questionCount) || 0
    if (questionCount <= 0) {
      return []
    }

    const baseStructure = this.getBaseStructureForAdminExam({
      licenseType: exam.licenseType,
      source: exam.source,
    })
    const scaledStructure = this.buildSelectedStructure(baseStructure, [], questionCount)
    const total = Object.values(scaledStructure).reduce(
      (sum, count) => sum + (this.toNumberOrNull(count) || 0),
      0
    )

    return Object.entries(scaledStructure).map(([category, count]) => {
      const numericCount = this.toNumberOrNull(count) || 0
      const percentage = total > 0
        ? Number(((numericCount / total) * 100).toFixed(1))
        : 0

      return {
        category,
        label: this.getCategoryLabel(category),
        count: numericCount,
        percentage,
      }
    })
  }

  static normalizeExamRow(raw = {}, index = 0) {
    const numericQuestionCount = this.toNumberOrNull(raw.question_count)
    const normalizedQuestionCount = numericQuestionCount || 0
    const normalizedLicenseType = String(raw.license_type || raw.license || '')
      .trim()
      .toUpperCase()
    const fallbackLicenseType = normalizedQuestionCount >= 35 ? 'B1' : 'A1'
    const licenseType = normalizedLicenseType || fallbackLicenseType
    const source = this.normalizeExamSource(raw.source, licenseType, normalizedQuestionCount)

    const passThresholdFromField = this.toNumberOrNull(raw.pass_threshold)
    const passScoreRaw = String(raw.pass_score || '').trim()
    const passThresholdFromPassScore = passScoreRaw.includes('/')
      ? this.toNumberOrNull(passScoreRaw.split('/')[0])
      : null
    const passThresholdFallback = source === 'exam_600' ? 27 : 21
    const passThreshold = passThresholdFromField
      || passThresholdFromPassScore
      || passThresholdFallback

    const durationMinutes = this.toNumberOrNull(raw.duration_minutes)
      || (source === 'exam_600' ? 22 : 19)

    const normalizedStatus = this.normalizeExamStatus(raw.status)
      || (Number(raw.is_active) === 0 ? 'Unavailable' : 'Published')
    const generatedId = `${licenseType || 'EX'}-${String(index + 1).padStart(3, '0')}`

    return {
      id: String(raw.id || generatedId),
      title: String(raw.title || '').trim() || `Exam ${generatedId}`,
      licenseType,
      source,
      questionCount: normalizedQuestionCount || (source === 'exam_600' ? 35 : 25),
      durationMinutes,
      passScore: `${passThreshold}/${normalizedQuestionCount || (source === 'exam_600' ? 35 : 25)}`,
      passThreshold,
      status: normalizedStatus,
      questionBankTotal: normalizedQuestionCount || 0,
      createdAt: this.toIsoDateTimeOrNull(raw.created_at),
      updatedAt: this.toIsoDateTimeOrNull(raw.updated_at),
    }
  }

  static async getAdminExamRowsFromExamsTable(connection) {
    const hasExamsTable = await this.tableExists(connection, 'exams')
    if (!hasExamsTable) {
      return null
    }

    const columns = await this.getTableColumns(connection, 'exams')
    const idColumn = this.pickFirstExistingColumn(columns, ['id', 'exam_id'])
    if (!idColumn) {
      return []
    }

    const titleColumn = this.pickFirstExistingColumn(columns, ['title', 'name', 'exam_name'])
    const licenseColumn = this.pickFirstExistingColumn(
      columns,
      ['license_type', 'license', 'certificate_code', 'license_code']
    )
    const sourceColumn = this.pickFirstExistingColumn(columns, ['source', 'exams_source'])
    const questionCountColumn = this.pickFirstExistingColumn(
      columns,
      ['question_count', 'total_questions', 'questions_count']
    )
    const durationColumn = this.pickFirstExistingColumn(
      columns,
      ['duration_minutes', 'time_limit_minutes', 'duration']
    )
    const passThresholdColumn = this.pickFirstExistingColumn(
      columns,
      ['pass_threshold', 'passing_score']
    )
    const passScoreColumn = this.pickFirstExistingColumn(columns, ['pass_score'])
    const statusColumn = this.pickFirstExistingColumn(columns, ['status'])
    const isActiveColumn = this.pickFirstExistingColumn(columns, ['is_active'])
    const createdAtColumn = this.pickFirstExistingColumn(columns, ['created_at'])
    const updatedAtColumn = this.pickFirstExistingColumn(columns, ['updated_at'])

    const selectFields = [
      `e.${idColumn} AS id`,
      titleColumn ? `e.${titleColumn} AS title` : 'NULL AS title',
      licenseColumn ? `e.${licenseColumn} AS license_type` : 'NULL AS license_type',
      sourceColumn ? `e.${sourceColumn} AS source` : 'NULL AS source',
      questionCountColumn ? `e.${questionCountColumn} AS question_count` : 'NULL AS question_count',
      durationColumn ? `e.${durationColumn} AS duration_minutes` : 'NULL AS duration_minutes',
      passThresholdColumn ? `e.${passThresholdColumn} AS pass_threshold` : 'NULL AS pass_threshold',
      passScoreColumn ? `e.${passScoreColumn} AS pass_score` : 'NULL AS pass_score',
      statusColumn ? `e.${statusColumn} AS status` : 'NULL AS status',
      isActiveColumn ? `e.${isActiveColumn} AS is_active` : '1 AS is_active',
      createdAtColumn ? `e.${createdAtColumn} AS created_at` : 'NULL AS created_at',
      updatedAtColumn ? `e.${updatedAtColumn} AS updated_at` : 'NULL AS updated_at',
    ]

    const orderBy = updatedAtColumn
      ? `e.${updatedAtColumn} DESC`
      : createdAtColumn
        ? `e.${createdAtColumn} DESC`
        : `e.${idColumn} DESC`

    const [rows] = await connection.query(
      `SELECT
         ${selectFields.join(',\n         ')}
       FROM exams e
       ORDER BY ${orderBy}`
    )

    return (rows || []).map((row, index) => this.normalizeExamRow(row, index))
  }

  static buildAdminExamRows({ questionCountsByLicense = {} } = {}) {
    const rows = []

    this.ADMIN_EXAM_TEMPLATES.forEach((template) => {
      const questionBankTotal = this.toNumberOrNull(questionCountsByLicense[template.licenseType]) || 0
      const publishedVariants = questionBankTotal > 0
        ? Math.floor(questionBankTotal / template.questionsPerExam)
        : 0
      const needsDraftVariant = questionBankTotal > 0 && publishedVariants === 0
      const totalVariants = Math.max(publishedVariants + (needsDraftVariant ? 1 : 0), 1)

      for (let index = 1; index <= totalVariants; index += 1) {
        const isPublished = index <= publishedVariants
        const status = isPublished
          ? 'Published'
          : questionBankTotal > 0
            ? 'Draft'
            : 'Unavailable'
        const formattedOrder = String(index).padStart(3, '0')
        const examCode = `${template.codePrefix}-${formattedOrder}`

        rows.push({
          id: examCode,
          title: `${template.titlePrefix} #${index}`,
          licenseType: template.licenseType,
          source: template.source,
          questionCount: template.questionsPerExam,
          durationMinutes: template.durationMinutes,
          passScore: `${template.passThreshold}/${template.questionsPerExam}`,
          passThreshold: template.passThreshold,
          status,
          questionBankTotal,
        })
      }
    })

    return rows
  }

  static async getQuestionCountsByLicense(connection) {
    const defaultCounts = { A1: 0, B1: 0 }
    const hasQuestionsTable = await this.tableExists(connection, 'questions')
    if (!hasQuestionsTable) {
      return defaultCounts
    }

    const questionColumns = await this.getTableColumns(connection, 'questions')
    const hasCertificateId = questionColumns.has('certificate_id')
    const hasIsActive = questionColumns.has('is_active')
    if (!hasCertificateId) {
      return defaultCounts
    }

    const hasCertificatesTable = await this.tableExists(connection, 'certificates')
    if (!hasCertificatesTable) {
      return defaultCounts
    }

    const certificateColumns = await this.getTableColumns(connection, 'certificates')
    if (!certificateColumns.has('id') || !certificateColumns.has('code')) {
      return defaultCounts
    }

    const [rows] = await connection.execute(
      `SELECT
         UPPER(c.code) AS license_type,
         COUNT(q.id) AS total_questions
       FROM certificates c
       LEFT JOIN questions q
         ON q.certificate_id = c.id
         ${hasIsActive ? 'AND COALESCE(q.is_active, 1) = 1' : ''}
       WHERE UPPER(c.code) IN ('A1', 'B1')
       GROUP BY UPPER(c.code)
       ORDER BY UPPER(c.code) ASC`
    )

    const counts = { ...defaultCounts }
    for (const row of rows || []) {
      const code = String(row.license_type || '').trim().toUpperCase()
      if (code === 'A1' || code === 'B1') {
        counts[code] = this.toNumberOrNull(row.total_questions) || 0
      }
    }

    return counts
  }

  static async getAdminExamRows(connection) {
    let allRows = await this.getAdminExamRowsFromExamsTable(connection)
    if (allRows === null) {
      const questionCountsByLicense = await this.getQuestionCountsByLicense(connection)
      allRows = this.buildAdminExamRows({ questionCountsByLicense })
    }

    return allRows
  }

  static async getAdminExamManagementData(options = {}) {
    let connection

    try {
      connection = await pool.getConnection()

      const searchText = String(options.search || '').trim().toLowerCase()
      const licenseTypeFilter = String(options.licenseType || '').trim().toUpperCase()
      const sourceFilter = String(options.source || '').trim().toLowerCase()
      const statusFilter = this.normalizeExamStatus(options.status)
      const requestedPage = this.toPositiveIntegerOrDefault(options.page, 1, 1, 100000)
      const limit = this.toPositiveIntegerOrDefault(options.limit, 10, 1, 100)

      const allRows = await this.getAdminExamRows(connection)

      const filteredRows = allRows.filter((row) => {
        if (licenseTypeFilter && String(row.licenseType).toUpperCase() !== licenseTypeFilter) {
          return false
        }

        if (sourceFilter && String(row.source).toLowerCase() !== sourceFilter) {
          return false
        }

        if (statusFilter && String(row.status) !== statusFilter) {
          return false
        }

        if (searchText) {
          const haystack = [
            row.id,
            row.title,
            row.licenseType,
            row.source,
            row.status,
          ]
            .map((item) => String(item || '').toLowerCase())
            .join(' ')

          if (!haystack.includes(searchText)) {
            return false
          }
        }

        return true
      })

      const totalItems = filteredRows.length
      const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 1
      const page = Math.min(requestedPage, totalPages)
      const offset = (page - 1) * limit
      const exams = filteredRows.slice(offset, offset + limit)

      const totalExams = allRows.length
      const publishedExams = allRows.filter((exam) => exam.status === 'Published').length
      const draftExams = allRows.filter((exam) => exam.status === 'Draft').length
      const unavailableExams = allRows.filter((exam) => exam.status === 'Unavailable').length
      const totalQuestionCount = allRows.reduce(
        (sum, exam) => sum + (this.toNumberOrNull(exam.questionCount) || 0),
        0
      )
      const averageQuestions = totalExams > 0
        ? Number((totalQuestionCount / totalExams).toFixed(1))
        : 0
      const totalLicenseTypes = new Set(
        allRows.map((exam) => String(exam.licenseType || '').toUpperCase()).filter(Boolean)
      ).size
      const licenseCounts = new Map()
      const sourceCounts = new Map()
      const statusCounts = new Map()

      for (const exam of allRows) {
        const licenseValue = String(exam.licenseType || '').trim().toUpperCase()
        const sourceValue = String(exam.source || '').trim().toLowerCase()
        const statusValue = this.normalizeExamStatus(exam.status)

        if (licenseValue) {
          licenseCounts.set(licenseValue, (licenseCounts.get(licenseValue) || 0) + 1)
        }
        if (sourceValue) {
          sourceCounts.set(sourceValue, (sourceCounts.get(sourceValue) || 0) + 1)
        }
        if (statusValue) {
          statusCounts.set(statusValue, (statusCounts.get(statusValue) || 0) + 1)
        }
      }

      const licenses = Array.from(licenseCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([value, count]) => ({
          value,
          label: value,
          count,
        }))

      const sourceOrder = ['exam_250', 'exam_600']
      const sourceEntries = Array.from(sourceCounts.entries())
      sourceEntries.sort((a, b) => {
        const indexA = sourceOrder.indexOf(a[0])
        const indexB = sourceOrder.indexOf(b[0])
        if (indexA >= 0 && indexB >= 0) return indexA - indexB
        if (indexA >= 0) return -1
        if (indexB >= 0) return 1
        return a[0].localeCompare(b[0])
      })

      const sources = sourceEntries.map(([value, count]) => ({
        value,
        label: value,
        count,
      }))

      const statusOrder = ['Published', 'Draft', 'Unavailable']
      const statuses = statusOrder
        .filter((value) => statusCounts.has(value))
        .map((value) => ({
          value,
          label: value,
          count: statusCounts.get(value) || 0,
        }))

      return {
        summary: {
          totalExams,
          publishedExams,
          draftExams,
          unavailableExams,
          totalLicenseTypes,
          averageQuestions,
        },
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        filters: {
          licenses,
          sources,
          statuses,
        },
        exams,
      }
    } catch (error) {
      logger.error('Error getting admin exam management data:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  /**
   * Infer category từ question ID cho bộ 250 câu
   */
  // Get admin exam detail (read-only)
  static async getAdminExamManagementDetail({ examId } = {}) {
    let connection

    try {
      const normalizedExamId = String(examId || '').trim()
      if (!normalizedExamId) {
        const error = new Error('Exam ID is required')
        error.statusCode = 400
        throw error
      }

      connection = await pool.getConnection()
      const allRows = await this.getAdminExamRows(connection)
      const exam = allRows.find(
        (item) => String(item?.id || '').trim().toLowerCase() === normalizedExamId.toLowerCase()
      )

      if (!exam) {
        const error = new Error('Exam not found')
        error.statusCode = 404
        throw error
      }

      const categoryDistribution = this.buildAdminCategoryDistribution(exam)
      const questionCount = this.toNumberOrNull(exam.questionCount) || 0
      const questionBankTotal = this.toNumberOrNull(exam.questionBankTotal)
      const questionCoveragePercent = questionBankTotal && questionBankTotal > 0
        ? Number(((questionCount / questionBankTotal) * 100).toFixed(1))
        : null
      const estimatedSecondsPerQuestion = questionCount > 0
        ? Math.round(((this.toNumberOrNull(exam.durationMinutes) || 0) * 60) / questionCount)
        : null

      return {
        exam: {
          ...exam,
          sourceLabel: this.getAdminSourceLabel(exam.source),
          statusDescription: this.getAdminStatusDescription(exam.status),
        },
        categoryDistribution,
        questionCoveragePercent,
        questionBankRemaining: questionBankTotal !== null
          ? Math.max(questionBankTotal - questionCount, 0)
          : null,
        estimatedSecondsPerQuestion,
      }
    } catch (error) {
      logger.error('Error getting admin exam management detail:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  // Infer category from question ID for exam_250
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

  /**
   * Get exams summary with pass rate statistics
   * Returns: totalExams, activeExams, draftExams, averagePassRate
   */
  static async getExamsSummaryWithPassRate() {
    let connection

    try {
      connection = await pool.getConnection()

      // Get all exams
      const [exams] = await connection.execute(`
        SELECT 
          e.id,
          e.title,
          e.license_type,
          e.source,
          e.total_questions,
          e.duration_minutes,
          e.pass_threshold,
          e.status,
          e.created_at,
          e.updated_at
        FROM exams e
        ORDER BY e.updated_at DESC
      `)

      // Get test results summary (passed count, total attempts per exam)
      const [testResults] = await connection.execute(`
        SELECT 
          exam_id,
          COUNT(*) as total_attempts,
          SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count
        FROM test_results
        GROUP BY exam_id
      `)

      // Create a map of test results for quick lookup
      const testResultsMap = {}
      for (const result of testResults) {
        testResultsMap[result.exam_id] = {
          attempts: result.total_attempts,
          passed: result.passed_count,
        }
      }

      // Calculate summary statistics
      const totalExams = exams.length
      const activeExams = exams.filter(e => e.status === 'active').length
      const draftExams = exams.filter(e => e.status === 'draft').length

      // Calculate average pass rate
      let totalPassed = 0
      let totalAttempts = 0
      for (const examId in testResultsMap) {
        totalPassed += testResultsMap[examId].passed
        totalAttempts += testResultsMap[examId].attempts
      }

      const averagePassRate = totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0

      return {
        totalExams,
        activeExams,
        draftExams,
        averagePassRate,
      }
    } catch (error) {
      logger.error('Error getting exams summary with pass rate:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  /**
   * Get exams list with pass rate and attempts statistics
   * Performs LEFT JOIN with test_results to calculate metrics
   */
  static async getExamsListWithStats(options = {}) {
    let connection

    try {
      connection = await pool.getConnection()

      const requestedPage = this.toPositiveIntegerOrDefault(options.page, 1, 1, 100000)
      const limit = this.toPositiveIntegerOrDefault(options.limit, 10, 1, 100)

      // Get exams with test_results statistics using LEFT JOIN
      const [rows] = await connection.execute(`
        SELECT 
          e.id,
          e.title,
          e.license_type,
          e.source,
          e.total_questions,
          e.duration_minutes,
          e.pass_threshold,
          e.status,
          e.created_at,
          e.updated_at,
          COUNT(tr.id) as total_attempts,
          SUM(CASE WHEN tr.passed = 1 THEN 1 ELSE 0 END) as passed_count
        FROM exams e
        LEFT JOIN test_results tr ON e.id = tr.exam_id
        GROUP BY e.id
        ORDER BY e.updated_at DESC
      `)

      // Calculate pass rates for each exam
      const examsWithStats = (rows || []).map(row => {
        const attempts = row.total_attempts || 0
        const passedCount = row.passed_count || 0
        
        // Calculate pass rate: (passed / total) * 100, or 0 if no attempts yet
        const passRate = attempts > 0 ? Math.round((passedCount / attempts) * 100) : 0
        
        // Map database column names to UI column names
        return {
          id: row.id,
          title: row.title,
          license: row.license_type,
          questions: row.total_questions,
          time: `${row.duration_minutes} min`,
          status: row.status === 'active' ? 'Active' : row.status === 'draft' ? 'Draft' : 'Archived',
          passRate: attempts > 0 ? `${passRate}%` : 'N/A',
          attempts: attempts || 0,
          attemptsText: attempts > 0 ? `${attempts} attempts` : '0 attempts',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
      })

      // Calculate pagination
      const totalItems = examsWithStats.length
      const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 1
      const page = Math.min(requestedPage, totalPages)
      const offset = (page - 1) * limit
      const paginatedExams = examsWithStats.slice(offset, offset + limit)

      return {
        exams: paginatedExams,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
    } catch (error) {
      logger.error('Error getting exams list with stats:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }
}
