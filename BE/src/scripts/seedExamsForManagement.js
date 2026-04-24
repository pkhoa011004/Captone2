import { pool } from '../config/database.js'

const DEFAULT_SEED_SIZE = 40

const toPositiveInteger = (value, fallback) => {
  const numericValue = Number(value)
  if (!Number.isInteger(numericValue) || numericValue <= 0) return fallback
  return numericValue
}

const tableExists = async (connection, tableName) => {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS table_count
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  )

  return Number(rows?.[0]?.table_count || 0) > 0
}

const getTableColumns = async (connection, tableName) => {
  const [rows] = await connection.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  )

  return new Set((rows || []).map((row) => String(row.COLUMN_NAME || '').toLowerCase()))
}

const pickFirstExistingColumn = (columns = new Set(), candidates = []) => {
  for (const candidate of candidates) {
    if (columns.has(String(candidate || '').toLowerCase())) return candidate
  }
  return null
}

const ensureExamsTable = async (connection) => {
  const hasExamsTable = await tableExists(connection, 'exams')
  if (hasExamsTable) return

  await connection.execute(
    `CREATE TABLE exams (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      license_type ENUM('A1','B1') NOT NULL,
      source ENUM('exam_250','exam_600','manual') NOT NULL DEFAULT 'manual',
      total_questions INT UNSIGNED NOT NULL DEFAULT 0,
      duration_minutes INT NOT NULL,
      pass_threshold INT NOT NULL,
      status ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_exams_license_type (license_type),
      INDEX idx_exams_source (source),
      INDEX idx_exams_status (status)
    )`
  )
}

const buildSeedExam = ({ index, seedTag }) => {
  const isA1 = index % 2 === 1
  const licenseType = isA1 ? 'A1' : 'B1'
  const source = isA1 ? 'exam_250' : 'exam_600'
  const questionCount = isA1 ? 25 : 35
  const durationMinutes = isA1 ? 19 : 22
  const passThreshold = isA1 ? 21 : 27
  const status = index % 11 === 0
    ? 'archived'
    : 'published' // Default to published instead of mixing draft and published

  return {
    title: `${licenseType} Theory Exam ${seedTag} #${String(index).padStart(3, '0')}`,
    licenseType,
    source,
    questionCount,
    durationMinutes,
    passThreshold,
    status,
    isActive: status !== 'archived' ? 1 : 0,
  }
}

const seedExams = async () => {
  let connection
  const seedSize = toPositiveInteger(process.argv[2], DEFAULT_SEED_SIZE)
  const seedTag = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 12)

  try {
    connection = await pool.getConnection()
    await ensureExamsTable(connection)

    const columns = await getTableColumns(connection, 'exams')
    const titleColumn = pickFirstExistingColumn(columns, ['title', 'name', 'exam_name'])
    const licenseColumn = pickFirstExistingColumn(
      columns,
      ['license_type', 'license', 'certificate_code', 'license_code']
    )
    const sourceColumn = pickFirstExistingColumn(columns, ['source', 'exams_source'])
    const questionCountColumn = pickFirstExistingColumn(
      columns,
      ['question_count', 'total_questions', 'questions_count']
    )
    const durationColumn = pickFirstExistingColumn(
      columns,
      ['duration_minutes', 'time_limit_minutes', 'duration']
    )
    const passThresholdColumn = pickFirstExistingColumn(
      columns,
      ['pass_threshold', 'passing_score']
    )
    const statusColumn = pickFirstExistingColumn(columns, ['status'])
    const isActiveColumn = pickFirstExistingColumn(columns, ['is_active'])
    const createdAtColumn = pickFirstExistingColumn(columns, ['created_at'])
    const updatedAtColumn = pickFirstExistingColumn(columns, ['updated_at'])

    if (!titleColumn || !licenseColumn || !sourceColumn) {
      throw new Error('Table exams is missing title/license/source columns required for seeding')
    }

    let inserted = 0
    let skipped = 0

    await connection.beginTransaction()

    for (let index = 1; index <= seedSize; index += 1) {
      const exam = buildSeedExam({ index, seedTag })

      const [existingRows] = await connection.execute(
        `SELECT 1
         FROM exams
         WHERE ${titleColumn} = ?
           AND ${licenseColumn} = ?
           AND ${sourceColumn} = ?
         LIMIT 1`,
        [exam.title, exam.licenseType, exam.source]
      )

      if (existingRows.length > 0) {
        skipped += 1
        continue
      }

      const insertColumns = [titleColumn, licenseColumn, sourceColumn]
      const insertValues = ['?', '?', '?']
      const insertParams = [exam.title, exam.licenseType, exam.source]

      if (questionCountColumn) {
        insertColumns.push(questionCountColumn)
        insertValues.push('?')
        insertParams.push(exam.questionCount)
      }

      if (durationColumn) {
        insertColumns.push(durationColumn)
        insertValues.push('?')
        insertParams.push(exam.durationMinutes)
      }

      if (passThresholdColumn) {
        insertColumns.push(passThresholdColumn)
        insertValues.push('?')
        insertParams.push(exam.passThreshold)
      }

      if (statusColumn) {
        insertColumns.push(statusColumn)
        insertValues.push('?')
        insertParams.push(exam.status)
      }

      if (isActiveColumn) {
        insertColumns.push(isActiveColumn)
        insertValues.push('?')
        insertParams.push(exam.isActive)
      }

      if (createdAtColumn) {
        insertColumns.push(createdAtColumn)
        insertValues.push('NOW()')
      }

      if (updatedAtColumn) {
        insertColumns.push(updatedAtColumn)
        insertValues.push('NOW()')
      }

      await connection.execute(
        `INSERT INTO exams (${insertColumns.join(', ')})
         VALUES (${insertValues.join(', ')})`,
        insertParams
      )

      inserted += 1
    }

    await connection.commit()
    console.log(`✅ Seed exams done. inserted=${inserted}, skipped=${skipped}, seedTag=${seedTag}`)
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error(`❌ Seed exams failed: ${error.message}`)
    process.exitCode = 1
  } finally {
    if (connection) {
      connection.release()
    }
    await pool.end()
  }
}

seedExams()
