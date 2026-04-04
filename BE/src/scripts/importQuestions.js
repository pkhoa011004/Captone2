import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const QUESTION_SOURCES = [
  { fileName: 'question_a1.json', licenseType: 'A1' },
  { fileName: 'question_b1.json', licenseType: 'B1' },
]

function toBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['1', 'true', 'yes', 'y'].includes(normalized)
  }
  return false
}

function resolveFatalFlag(raw = {}) {
  return toBoolean(
    raw.isCritical
      ?? raw.is_critical
      ?? raw.isFatal
      ?? raw.is_fatal
      ?? raw.fatal
      ?? raw.critical
      ?? false
  )
}

function normalizeImagePath(rawImage) {
  const value = rawImage ? String(rawImage).trim() : ''
  if (!value) return null

  if (/^https?:\/\//i.test(value) || value.startsWith('/static/questions/')) {
    return value
  }

  return `/static/questions/${path.basename(value)}`
}

function normalizeQuestion(raw, certificateId) {
  const rawImage = raw.image ? String(raw.image).trim() : null
  const normalizedImage = normalizeImagePath(rawImage)
  const isFatal = resolveFatalFlag(raw)

  const options = Array.isArray(raw.options)
    ? raw.options.map((text) => String(text || '').trim())
    : []

  return {
    source_question_id: Number(raw.questionId),
    certificate_id: Number(certificateId),
    question_text: String(raw.content || '').trim(),
    image_url: normalizedImage,
    is_fatal: isFatal,
    explanation: raw.explanation ?? null,
    option_a: options[0] || null,
    option_b: options[1] || null,
    option_c: options[2] || null,
    option_d: options[3] || null,
    correct_answer: Number(raw.correctAnswer),
    complexity_level: isFatal ? 'critical' : 'medium',
    question_bank_id: 1,
  }
}

async function logFatalSummary(connection) {
  const [rows] = await connection.execute(
    `SELECT certificate_id,
            COUNT(*) AS total,
            SUM(CASE WHEN is_fatal = 1 THEN 1 ELSE 0 END) AS fatal_total
     FROM questions
     WHERE is_active = 1
     GROUP BY certificate_id
     ORDER BY certificate_id ASC`
  )

  if (!rows.length) {
    logger.warn('No active questions found after import')
    return
  }

  rows.forEach((row) => {
    const certificateId = Number(row.certificate_id)
    const total = Number(row.total || 0)
    const fatalTotal = Number(row.fatal_total || 0)

    logger.info(`[IMPORT SUMMARY] certificate_id=${certificateId}, total=${total}, fatal_total=${fatalTotal}`)

    if (fatalTotal === 0) {
      logger.warn(
        `[IMPORT SUMMARY] certificate_id=${certificateId} has 0 fatal questions. Check source field mapping (isCritical/is_fatal/isFatal...)`
      )
    }
  })
}

async function resolveCertificateIds(connection) {
  const [certs] = await connection.execute(
    `SELECT id, UPPER(code) AS code
     FROM certificates
     WHERE UPPER(code) IN ('A1', 'B1')`
  )

  const certMap = Object.fromEntries(certs.map((row) => [row.code, Number(row.id)]))

  if (!certMap.A1 || !certMap.B1) {
    throw new Error('Missing certificate rows for A1/B1 in certificates table')
  }

  return certMap
}

async function loadAllQuestions(certMap) {
  const merged = []

  for (const source of QUESTION_SOURCES) {
    const filePath = path.resolve(__dirname, `../config/${source.fileName}`)
    const raw = await fs.readFile(filePath, 'utf-8')
    const json = JSON.parse(raw)

    if (!Array.isArray(json)) {
      throw new Error(`Question config JSON must be an array: ${source.fileName}`)
    }

    const certificateId = certMap[source.licenseType]
    const normalized = json
      .map((item) => normalizeQuestion(item, certificateId))
      .sort((a, b) => a.source_question_id - b.source_question_id)

    merged.push(...normalized)
  }

  return merged
}

async function upsertQuestion(connection, question) {
  const [existingRows] = await connection.execute(
    `SELECT id
     FROM questions
     WHERE certificate_id = ?
       AND question_text = ?
       AND option_a = ?
       AND option_b = ?
     LIMIT 1`,
    [question.certificate_id, question.question_text, question.option_a, question.option_b]
  )

  if (existingRows.length) {
    const id = Number(existingRows[0].id)
    await connection.execute(
      `UPDATE questions
       SET question_bank_id = ?,
           question_text = ?,
           option_a = ?,
           option_b = ?,
           option_c = ?,
           option_d = ?,
           correct_answer = ?,
           explanation = ?,
           is_fatal = ?,
           complexity_level = ?,
           certificate_id = ?,
           image_url = ?,
           is_active = 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        question.question_bank_id,
        question.question_text,
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
        String(question.correct_answer),
        question.explanation,
        question.is_fatal ? 1 : 0,
        question.complexity_level,
        question.certificate_id,
        question.image_url,
        id,
      ]
    )
    return 'updated'
  }

  await connection.execute(
    `INSERT INTO questions (
      question_bank_id, question_text, option_a, option_b, option_c, option_d,
      correct_answer, explanation, is_fatal, complexity_level, certificate_id, image_url, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      question.question_bank_id,
      question.question_text,
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d,
      String(question.correct_answer),
      question.explanation,
      question.is_fatal ? 1 : 0,
      question.complexity_level,
      question.certificate_id,
      question.image_url,
    ]
  )

  return 'inserted'
}

async function importQuestions() {
  const connection = await pool.getConnection()

  try {
    const certMap = await resolveCertificateIds(connection)
    const data = await loadAllQuestions(certMap)

    let inserted = 0
    let updated = 0

    await connection.beginTransaction()

    for (const question of data) {
      if (!question.source_question_id || !question.question_text) {
        throw new Error(`Invalid question format for source ID: ${question.source_question_id}`)
      }

      const optionCount = [question.option_a, question.option_b, question.option_c, question.option_d]
        .filter((option) => option !== null && option !== undefined && String(option).trim() !== '')
        .length

      if (optionCount < 2) {
        throw new Error(`Question ${question.source_question_id} must have at least 2 options`)
      }

      if (!question.correct_answer || question.correct_answer < 1 || question.correct_answer > optionCount) {
        throw new Error(`Question ${question.source_question_id} has invalid correct_answer`) 
      }

      const result = await upsertQuestion(connection, question)
      if (result === 'inserted') inserted += 1
      if (result === 'updated') updated += 1
    }

    await connection.commit()
    await logFatalSummary(connection)
    logger.info(`Imported questions successfully: inserted=${inserted}, updated=${updated}, total=${data.length}`)
  } catch (error) {
    await connection.rollback()
    logger.error('Failed to import questions:', error)
    throw error
  } finally {
    connection.release()
    await pool.end()
  }
}

importQuestions()
  .then(() => {
    logger.info('Question import completed')
    process.exit(0)
  })
  .catch((error) => {
    logger.error('Question import failed:', error)
    process.exit(1)
  })
