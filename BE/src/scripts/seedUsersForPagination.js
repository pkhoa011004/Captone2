import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'

const DEFAULT_COUNT = 40
const DEFAULT_PASSWORD = '123456'
const PASSWORD_HASH_ROUNDS = 10

const toPositiveInt = (value, fallback) => {
  const numericValue = Number(value)
  return Number.isInteger(numericValue) && numericValue > 0
    ? numericValue
    : fallback
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

const ensureRole = async (connection, roleName, description) => {
  const hasRolesTable = await tableExists(connection, 'roles')
  if (!hasRolesTable) {
    return null
  }

  const normalizedRole = String(roleName || '').trim().toLowerCase()
  const [existingRows] = await connection.execute(
    'SELECT id FROM roles WHERE LOWER(name) = ? LIMIT 1',
    [normalizedRole]
  )

  if (existingRows.length > 0) {
    return Number(existingRows[0].id)
  }

  const roleColumns = await getTableColumns(connection, 'roles')
  const insertColumns = ['name']
  const insertValues = ['?']
  const insertParams = [normalizedRole]

  if (roleColumns.has('description')) {
    insertColumns.push('description')
    insertValues.push('?')
    insertParams.push(description)
  }

  if (roleColumns.has('created_at')) {
    insertColumns.push('created_at')
    insertValues.push('NOW()')
  }

  if (roleColumns.has('updated_at')) {
    insertColumns.push('updated_at')
    insertValues.push('NOW()')
  }

  await connection.execute(
    `INSERT INTO roles (${insertColumns.join(', ')})
     VALUES (${insertValues.join(', ')})`,
    insertParams
  )

  const [createdRows] = await connection.execute(
    'SELECT id FROM roles WHERE LOWER(name) = ? LIMIT 1',
    [normalizedRole]
  )

  return createdRows.length > 0 ? Number(createdRows[0].id) : null
}

const buildPhone = (index) => {
  const suffix = String(10000000 + ((index * 137) % 90000000))
  return `09${suffix}`
}

const buildSeedUsers = ({ count, seedTag }) => {
  const users = []

  for (let i = 1; i <= count; i += 1) {
    const isInstructor = i % 5 === 0
    const isSuspended = i % 9 === 0
    const isOffline = !isSuspended && i % 4 === 0

    users.push({
      name: isInstructor ? `Instructor Seed ${i}` : `Learner Seed ${i}`,
      email: `seed_user_${seedTag}_${i}@example.com`,
      phone: buildPhone(i),
      role: isInstructor ? 'instructor' : 'learner',
      licenseType: i % 2 === 0 ? 'A1' : 'B1',
      isActive: isSuspended ? 0 : 1,
      emailVerified: isOffline ? 0 : 1,
    })
  }

  return users
}

const seedUsersForPagination = async () => {
  let connection

  try {
    const count = toPositiveInt(process.argv[2], DEFAULT_COUNT)
    const seedTag = Date.now()

    connection = await pool.getConnection()

    const usersColumns = await getTableColumns(connection, 'users')
    const hasRoleIdColumn = usersColumns.has('role_id')
    const hasRoleColumn = usersColumns.has('role')
    const hasLicenseTypeColumn = usersColumns.has('license_type')
    const hasPhoneColumn = usersColumns.has('phone')
    const hasEmailVerifiedColumn = usersColumns.has('email_verified')
    const hasIsActiveColumn = usersColumns.has('is_active')
    const hasCreatedAtColumn = usersColumns.has('created_at')
    const hasUpdatedAtColumn = usersColumns.has('updated_at')

    const hasRolesTable = await tableExists(connection, 'roles')
    if (hasRoleIdColumn && !hasRolesTable) {
      throw new Error('users.role_id exists but table roles is missing')
    }

    let learnerRoleId = null
    let instructorRoleId = null
    if (hasRoleIdColumn) {
      learnerRoleId = await ensureRole(connection, 'learner', 'Learner role')
      instructorRoleId = await ensureRole(connection, 'instructor', 'Instructor role')

      if (learnerRoleId === null || instructorRoleId === null) {
        throw new Error('Cannot resolve learner/instructor role ids in table roles')
      }
    }

    const insertColumns = ['email', 'password_hash', 'name']
    const insertValues = ['?', '?', '?']

    if (hasPhoneColumn) {
      insertColumns.push('phone')
      insertValues.push('?')
    }

    if (hasLicenseTypeColumn) {
      insertColumns.push('license_type')
      insertValues.push('?')
    }

    if (hasRoleColumn) {
      insertColumns.push('role')
      insertValues.push('?')
    }

    if (hasRoleIdColumn) {
      insertColumns.push('role_id')
      insertValues.push('?')
    }

    if (hasEmailVerifiedColumn) {
      insertColumns.push('email_verified')
      insertValues.push('?')
    }

    if (hasIsActiveColumn) {
      insertColumns.push('is_active')
      insertValues.push('?')
    }

    if (hasCreatedAtColumn) {
      insertColumns.push('created_at')
      insertValues.push('NOW()')
    }

    if (hasUpdatedAtColumn) {
      insertColumns.push('updated_at')
      insertValues.push('NOW()')
    }

    const users = buildSeedUsers({ count, seedTag })
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, PASSWORD_HASH_ROUNDS)

    let inserted = 0
    for (const user of users) {
      const insertParams = [user.email, passwordHash, user.name]

      if (hasPhoneColumn) {
        insertParams.push(user.phone)
      }

      if (hasLicenseTypeColumn) {
        insertParams.push(user.licenseType)
      }

      if (hasRoleColumn) {
        insertParams.push(user.role)
      }

      if (hasRoleIdColumn) {
        insertParams.push(user.role === 'instructor' ? instructorRoleId : learnerRoleId)
      }

      if (hasEmailVerifiedColumn) {
        insertParams.push(user.emailVerified)
      }

      if (hasIsActiveColumn) {
        insertParams.push(user.isActive)
      }

      await connection.execute(
        `INSERT INTO users (${insertColumns.join(', ')})
         VALUES (${insertValues.join(', ')})`,
        insertParams
      )

      inserted += 1
    }

    console.log(`Seed users completed. Inserted: ${inserted}`)
    console.log(`Default password for seeded users: ${DEFAULT_PASSWORD}`)
    console.log('Tip: refresh User Management page to test pagination.')
  } catch (error) {
    console.error('Seed users failed:', error.message)
  } finally {
    if (connection) connection.release()
    process.exit(0)
  }
}

seedUsersForPagination()
