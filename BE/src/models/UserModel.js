import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'

export class UserModel {
  static async resolveDefaultRoleId(connection) {
    const [preferredRoles] = await connection.execute(
      `SELECT id
       FROM roles
       WHERE LOWER(name) IN ('user', 'learner')
       ORDER BY FIELD(LOWER(name), 'user', 'learner')
       LIMIT 1`
    )

    if (preferredRoles.length > 0) {
      return Number(preferredRoles[0].id)
    }

    const [fallbackRoles] = await connection.execute(
      'SELECT id FROM roles ORDER BY id ASC LIMIT 1'
    )

    if (fallbackRoles.length > 0) {
      return Number(fallbackRoles[0].id)
    }

    await connection.execute(
      `INSERT INTO roles (name, description, created_at, updated_at)
       VALUES ('user', 'Auto-created default role', NOW(), NOW())`
    )

    const [createdRoles] = await connection.execute(
      `SELECT id FROM roles WHERE LOWER(name) = 'user' LIMIT 1`
    )

    if (createdRoles.length > 0) {
      return Number(createdRoles[0].id)
    }

    const error = new Error('No roles found. Please seed table roles before registering users.')
    error.statusCode = 500
    throw error
  }

  static async findAll(filters = {}) {
    try {
      let query = 'SELECT id, email, name, phone, license_type, role_id, created_at, updated_at FROM users WHERE 1=1'
      const params = []

      if (filters.search) {
        query += ' AND (name LIKE ? OR email LIKE ?)'
        params.push(`%${filters.search}%`, `%${filters.search}%`)
      }

      if (filters.roleId) {
        query += ' AND role_id = ?'
        params.push(filters.roleId)
      }

      const connection = await pool.getConnection()
      const [users] = await connection.execute(query, params)
      connection.release()

      return users
    } catch (error) {
      logger.error('Error finding all users:', error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const connection = await pool.getConnection()
      const [users] = await connection.execute(
        'SELECT id, email, name, phone, license_type, role_id, created_at, updated_at FROM users WHERE id = ?',
        [id]
      )
      connection.release()

      return users[0] || null
    } catch (error) {
      logger.error('Error finding user by id:', error)
      throw error
    }
  }

  static async findByEmail(email) {
    try {
      const connection = await pool.getConnection()
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      )
      connection.release()

      return users[0] || null
    } catch (error) {
      logger.error('Error finding user by email:', error)
      throw error
    }
  }

  static async create(data) {
    let connection

    try {
      const { email, passwordHash, name, phone = '', licenseType = 'A1', roleId } = data

      // Validate required fields
      if (!email || !passwordHash || !name) {
        throw new Error('Missing required fields: email, passwordHash, name')
      }

      connection = await pool.getConnection()
      const resolvedRoleId = roleId ?? await this.resolveDefaultRoleId(connection)

      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, name, phone, license_type, role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          String(email || ''),
          String(passwordHash || ''),
          String(name || ''),
          String(phone || ''),
          String(licenseType || 'A1'),
          Number(resolvedRoleId)
        ]
      )

      logger.info(`User created with id: ${result.insertId}`)
      return {
        id: result.insertId,
        email,
        name,
        phone: phone || '',
        license_type: licenseType || 'A1',
        role_id: Number(resolvedRoleId),
      }
    } catch (error) {
      logger.error('Error creating user:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  static async update(id, data) {
    try {
      const fields = []
      const values = []

      if (data.name !== undefined) {
        fields.push('name = ?')
        values.push(data.name)
      }
      if (data.phone !== undefined) {
        fields.push('phone = ?')
        values.push(data.phone)
      }
      if (data.licenseType !== undefined) {
        fields.push('license_type = ?')
        values.push(data.licenseType)
      }
      if (data.roleId !== undefined) {
        fields.push('role_id = ?')
        values.push(data.roleId)
      }

      if (fields.length === 0) {
        return null
      }

      fields.push('updated_at = NOW()')
      values.push(id)

      const connection = await pool.getConnection()
      await connection.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      )
      connection.release()

      return this.findById(id)
    } catch (error) {
      logger.error('Error updating user:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const connection = await pool.getConnection()
      await connection.execute('DELETE FROM users WHERE id = ?', [id])
      connection.release()

      return true
    } catch (error) {
      logger.error('Error deleting user:', error)
      throw error
    }
  }

  static excludePassword(user) {
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export default UserModel
