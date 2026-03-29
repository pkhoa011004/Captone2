import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'
import crypto from 'crypto'

export class UserModel {
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT id, email, name, phone, license_type, role_id, email_verified, created_at, updated_at FROM users WHERE 1=1'
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
        'SELECT id, email, name, phone, license_type, role_id, email_verified, created_at, updated_at FROM users WHERE id = ?',
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
    try {
      const { email, passwordHash, name, phone = '', licenseType = 'A1', roleId = 1 } = data

      // Validate required fields
      if (!email || !passwordHash || !name) {
        throw new Error('Missing required fields: email, passwordHash, name')
      }

      const connection = await pool.getConnection()

      const [result] = await connection.execute(
        'INSERT INTO users (email, password_hash, name, phone, license_type, role_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          String(email || ''),
          String(passwordHash || ''),
          String(name || ''),
          String(phone || ''),
          String(licenseType || 'A1'),
          parseInt(roleId || 1)
        ]
      )

      connection.release()

      logger.info(`User created with id: ${result.insertId}`)
      return {
        id: result.insertId,
        email,
        name,
        phone: phone || '',
        license_type: licenseType || 'A1',
      }
    } catch (error) {
      logger.error('Error creating user:', error)
      throw error
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

  static async findByVerificationToken(token) {
    try {
      const connection = await pool.getConnection()
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE verification_token = ? AND token_expires_at > NOW()',
        [token]
      )
      connection.release()

      return users[0] || null
    } catch (error) {
      logger.error('Error finding user by verification token:', error)
      throw error
    }
  }

  static async setVerificationToken(userId, token) {
    try {
      const connection = await pool.getConnection()
      // Token expires in 24 hours
      await connection.execute(
        'UPDATE users SET verification_token = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR), email_verified = FALSE WHERE id = ?',
        [token, userId]
      )
      connection.release()

      logger.info(`Verification token set for user id: ${userId}`)
      return true
    } catch (error) {
      logger.error('Error setting verification token:', error)
      throw error
    }
  }

  static async verifyEmail(userId) {
    try {
      const connection = await pool.getConnection()
      await connection.execute(
        'UPDATE users SET email_verified = TRUE, verification_token = NULL, token_expires_at = NULL WHERE id = ?',
        [userId]
      )
      connection.release()

      logger.info(`Email verified for user id: ${userId}`)
      return true
    } catch (error) {
      logger.error('Error verifying email:', error)
      throw error
    }
  }

  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  static excludePassword(user) {
    const { password_hash, verification_token, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export default UserModel
