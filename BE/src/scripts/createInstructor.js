import { pool } from '../config/database.js'
import bcrypt from 'bcryptjs'

const getTableColumns = async (connection, tableName) => {
  const [rows] = await connection.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  )

  return new Set((rows || []).map((row) => String(row.COLUMN_NAME || '').toLowerCase()))
}

const createInstructorAccount = async () => {
  let connection

  try {
    connection = await pool.getConnection()

    const usersColumns = await getTableColumns(connection, 'users')
    const roleColumns = await getTableColumns(connection, 'roles')

    const [existingRole] = await connection.execute(
      "SELECT id FROM roles WHERE LOWER(name) = 'instructor' LIMIT 1"
    )

    let instructorRoleId = null
    if (existingRole.length === 0) {
      const roleInsertColumns = ['name']
      const roleInsertValues = ['?']
      const roleInsertParams = ['instructor']

      if (roleColumns.has('description')) {
        roleInsertColumns.push('description')
        roleInsertValues.push('?')
        roleInsertParams.push('Instructor')
      }

      if (roleColumns.has('created_at')) {
        roleInsertColumns.push('created_at')
        roleInsertValues.push('NOW()')
      }

      if (roleColumns.has('updated_at')) {
        roleInsertColumns.push('updated_at')
        roleInsertValues.push('NOW()')
      }

      await connection.execute(
        `INSERT INTO roles (${roleInsertColumns.join(', ')})
         VALUES (${roleInsertValues.join(', ')})`,
        roleInsertParams
      )

      const [newRole] = await connection.execute(
        "SELECT id FROM roles WHERE LOWER(name) = 'instructor' LIMIT 1"
      )

      instructorRoleId = newRole?.[0]?.id ?? null
      console.log('Role instructor created')
    } else {
      instructorRoleId = existingRole[0].id
      console.log('Role instructor already exists')
    }

    const email = 'maiphuockhoa@dtu.edu.vn'
    const password = 'Phuockhoa@0909'
    const passwordHash = await bcrypt.hash(password, 10)

    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    if (existing.length === 0) {
      const insertColumns = ['email', 'password_hash', 'name']
      const insertValues = ['?', '?', '?']
      const insertParams = [email, passwordHash, 'Instructor']

      if (usersColumns.has('phone')) {
        insertColumns.push('phone')
        insertValues.push('?')
        insertParams.push('')
      }

      if (usersColumns.has('license_type')) {
        insertColumns.push('license_type')
        insertValues.push('?')
        insertParams.push('A1')
      }

      if (usersColumns.has('role')) {
        insertColumns.push('role')
        insertValues.push('?')
        insertParams.push('instructor')
      }

      if (usersColumns.has('role_id') && instructorRoleId !== null) {
        insertColumns.push('role_id')
        insertValues.push('?')
        insertParams.push(instructorRoleId)
      }

      if (usersColumns.has('email_verified')) {
        insertColumns.push('email_verified')
        insertValues.push('1')
      }

      if (usersColumns.has('created_at')) {
        insertColumns.push('created_at')
        insertValues.push('NOW()')
      }

      if (usersColumns.has('updated_at')) {
        insertColumns.push('updated_at')
        insertValues.push('NOW()')
      }

      await connection.execute(
        `INSERT INTO users (${insertColumns.join(', ')})
         VALUES (${insertValues.join(', ')})`,
        insertParams
      )

      console.log('Instructor account created successfully')
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
    } else {
      const updateParts = []
      const updateParams = []

      if (usersColumns.has('role')) {
        updateParts.push("role = 'instructor'")
      }

      if (usersColumns.has('role_id') && instructorRoleId !== null) {
        updateParts.push('role_id = ?')
        updateParams.push(instructorRoleId)
      }

      if (usersColumns.has('email_verified')) {
        updateParts.push('email_verified = 1')
      }

      if (usersColumns.has('updated_at')) {
        updateParts.push('updated_at = NOW()')
      }

      if (updateParts.length > 0) {
        updateParams.push(email)
        await connection.execute(
          `UPDATE users
           SET ${updateParts.join(', ')}
           WHERE email = ?`,
          updateParams
        )
        console.log('Existing account has been synced to instructor role')
      } else {
        console.log('Instructor account exists, but no compatible role columns found to sync')
      }

      console.log(`Instructor account already exists with email: ${email}`)
    }

    if (!usersColumns.has('role') && usersColumns.has('role_id')) {
      console.log('Note: users.role does not exist, script used users.role_id instead')
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    if (connection) connection.release()
    process.exit(0)
  }
}

createInstructorAccount()
