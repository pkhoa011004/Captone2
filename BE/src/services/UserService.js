import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'
import { UserModel } from '../models/UserModel.js'
import { logger } from '../utils/logger.js'
import emailService from './EmailService.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const PASSWORD_HASH_ROUNDS = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10

export class UserService {
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

  static resolveManagementStatus(user = {}) {
    if (Number(user?.is_active) === 0) return 'Suspended'
    if (Number(user?.email_verified) === 0) return 'Offline'
    return 'Active'
  }

  static normalizeManagementRole(role) {
    const normalizedRole = String(role || '').trim().toLowerCase()
    if (!normalizedRole) return null
    if (normalizedRole === 'user' || normalizedRole === 'learner') return 'learner'
    return normalizedRole
  }

  static resolveStatusFlags(status = 'Active') {
    const normalized = String(status || '').trim().toLowerCase()

    if (normalized === 'active') {
      return {
        status: 'Active',
        isActive: 1,
        emailVerified: 1,
      }
    }

    if (normalized === 'suspended') {
      return {
        status: 'Suspended',
        isActive: 0,
        emailVerified: 1,
      }
    }

    return {
      status: 'Offline',
      isActive: 1,
      emailVerified: 0,
    }
  }

  static buildAdminUserWhereClause({
    search,
    status,
    role,
    licenseType,
    hasIsActive,
    hasEmailVerified,
    hasLicenseType,
    hasRoleColumn,
    hasRoleIdColumn,
    hasRolesTable,
  }) {
    const conditions = []
    const params = []

    if (hasRolesTable && hasRoleIdColumn && hasRoleColumn) {
      conditions.push('LOWER(COALESCE(r.name, u.role, \'\')) <> \'admin\'')
    } else if (hasRolesTable && hasRoleIdColumn) {
      conditions.push('LOWER(COALESCE(r.name, \'\')) <> \'admin\'')
    } else if (hasRoleColumn) {
      conditions.push('LOWER(COALESCE(u.role, \'\')) <> \'admin\'')
    }

    const searchText = String(search || '').trim()
    if (searchText) {
      const searchPattern = `%${searchText}%`
      conditions.push('(u.name LIKE ? OR u.email LIKE ?)')
      params.push(searchPattern, searchPattern)
    }

    const statusText = String(status || '').trim().toLowerCase()
    if (statusText === 'active') {
      if (hasIsActive && hasEmailVerified) {
        conditions.push('(COALESCE(u.is_active, 1) = 1 AND COALESCE(u.email_verified, 1) = 1)')
      } else if (hasIsActive) {
        conditions.push('COALESCE(u.is_active, 1) = 1')
      } else if (hasEmailVerified) {
        conditions.push('COALESCE(u.email_verified, 1) = 1')
      }
    } else if (statusText === 'offline') {
      if (hasIsActive && hasEmailVerified) {
        conditions.push('(COALESCE(u.email_verified, 0) = 0 AND COALESCE(u.is_active, 1) = 1)')
      } else if (hasEmailVerified) {
        conditions.push('COALESCE(u.email_verified, 0) = 0')
      } else {
        conditions.push('1 = 0')
      }
    } else if (statusText === 'suspended') {
      if (hasIsActive) {
        conditions.push('COALESCE(u.is_active, 1) = 0')
      } else {
        conditions.push('1 = 0')
      }
    }

    const rawRoleText = String(role || '').trim().toLowerCase()
    const roleText = rawRoleText === 'user' ? 'learner' : rawRoleText
    if (roleText) {
      const isLearnerLikeRole = roleText === 'learner'

      if (hasRolesTable && hasRoleIdColumn && hasRoleColumn) {
        if (isLearnerLikeRole) {
          conditions.push('LOWER(COALESCE(r.name, u.role, \'\')) IN (\'learner\', \'user\')')
        } else {
          conditions.push('LOWER(COALESCE(r.name, u.role, \'\')) = ?')
          params.push(roleText)
        }
      } else if (hasRolesTable && hasRoleIdColumn) {
        if (isLearnerLikeRole) {
          conditions.push('LOWER(COALESCE(r.name, \'\')) IN (\'learner\', \'user\')')
        } else {
          conditions.push('LOWER(COALESCE(r.name, \'\')) = ?')
          params.push(roleText)
        }
      } else if (hasRoleColumn) {
        if (isLearnerLikeRole) {
          conditions.push('LOWER(COALESCE(u.role, \'\')) IN (\'learner\', \'user\')')
        } else {
          conditions.push('LOWER(COALESCE(u.role, \'\')) = ?')
          params.push(roleText)
        }
      } else if (hasRoleIdColumn && Number.isInteger(Number(roleText))) {
        conditions.push('u.role_id = ?')
        params.push(Number(roleText))
      } else {
        conditions.push('1 = 0')
      }
    }

    const normalizedLicenseType = String(licenseType || '').trim().toUpperCase()
    if (normalizedLicenseType) {
      if (hasLicenseType) {
        conditions.push('UPPER(COALESCE(u.license_type, \'\')) = ?')
        params.push(normalizedLicenseType)
      } else {
        conditions.push('1 = 0')
      }
    }

    return {
      whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      whereParams: params,
    }
  }

  static mapAdminManagementUser(user = {}) {
    return {
      id: this.toNumberOrNull(user.id),
      name: user.name || null,
      email: user.email || null,
      phone: user.phone || null,
      role: this.normalizeManagementRole(user.role_name || user.role || null),
      roleId: this.toNumberOrNull(user.role_id),
      licenseType: user.license_type || null,
      registeredAt: user.created_at || null,
      lastLogin: user.last_login || null,
      status: this.resolveManagementStatus(user),
    }
  }

  static mapAdminUserDetail(user = {}) {
    return {
      id: this.toNumberOrNull(user.id),
      name: user.name || null,
      email: user.email || null,
      phone: user.phone || null,
      role: this.normalizeManagementRole(user.role_name || user.role || null),
      roleId: this.toNumberOrNull(user.role_id),
      licenseType: user.license_type || null,
      status: this.resolveManagementStatus(user),
      isActive: user.is_active === null || user.is_active === undefined
        ? null
        : Number(user.is_active) === 1,
      emailVerified: user.email_verified === null || user.email_verified === undefined
        ? null
        : Number(user.email_verified) === 1,
      registeredAt: user.created_at || null,
      updatedAt: user.updated_at || null,
      lastLogin: user.last_login || null,
    }
  }

  static async resolveRoleForAdminCreation(connection, role) {
    const requestedRole = String(role || '').trim().toLowerCase()
    const normalizedRole = requestedRole === 'user' ? 'learner' : requestedRole
    const hasRolesTable = await this.tableExists(connection, 'roles')

    if (!hasRolesTable) {
      const error = new Error('Table roles is required for admin user creation')
      error.statusCode = 500
      throw error
    }

    if (normalizedRole === 'admin') {
      const error = new Error('Admin role cannot be created from Add User')
      error.statusCode = 400
      throw error
    }

    const [roleRows] = normalizedRole === 'learner'
      ? await connection.execute(
          `SELECT id, name
           FROM roles
           WHERE LOWER(name) IN ('learner', 'user')
           ORDER BY FIELD(LOWER(name), 'learner', 'user')
           LIMIT 1`
        )
      : await connection.execute(
          `SELECT id, name
           FROM roles
           WHERE LOWER(name) = ?
           LIMIT 1`,
          [normalizedRole]
        )

    if (!roleRows || roleRows.length === 0) {
      const error = new Error(`Role "${normalizedRole}" does not exist in table roles`)
      error.statusCode = 400
      throw error
    }

    return {
      roleId: Number(roleRows[0].id),
      roleName: String(roleRows[0].name || normalizedRole),
    }
  }

  static async register(email, password, name, phone = '', licenseType = 'A1') {
    // Check if user exists
    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      const error = new Error('Email already registered')
      error.statusCode = 409
      throw error
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS)

    // Create user (email_verified defaults to false)
    const user = await UserModel.create({
      email,
      passwordHash,
      name,
      phone,
      licenseType,
    })

    try {
      // Generate verification token
      const verificationToken = UserModel.generateVerificationToken()
      
      // Set verification token with 24-hour expiry
      await UserModel.setVerificationToken(user.id, verificationToken)
      
      // Send verification email
      await emailService.sendVerificationEmail(email, name, verificationToken)
      
      logger.info(`User registered: ${email}`)
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        message: 'Registration successful! Please check your email to verify your account.'
      }
    } catch (emailError) {
      // If email fails, still return success but log the error
      logger.warn(`User registered but email failed to send: ${email}`, emailError.message)
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        message: 'Registration successful but verification email failed to send. Please use "Resend Verification Email".'
      }
    }
  }

  static async login(email, password) {
    const user = await UserModel.findByEmail(email)

    if (!user) {
      const error = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    // Verify password - use password_hash (snake_case from database)
    const passwordHash = user.password_hash || user.passwordHash
    if (!passwordHash) {
      const error = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    const isPasswordValid = await bcrypt.compare(password, passwordHash)
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password')
      error.statusCode = 401
      throw error
    }

    // Check if email is verified (skip for test emails in development)
    const isTestMode = email.includes('test') && process.env.NODE_ENV !== 'production'
    if (!user.email_verified && !isTestMode) {
      const error = new Error('Please verify your email before logging in. Check your email for the verification link.')
      error.statusCode = 403
      throw error
    }

    // Query role name from roles table
    let roleName = 'user'
    try {
      const connection = await pool.getConnection()
      const [roleRows] = await connection.execute(
        'SELECT name FROM roles WHERE id = ? LIMIT 1',
        [user.role_id]
      )
      if (roleRows.length > 0) {
        roleName = roleRows[0].name
      }
      connection.release()
    } catch (roleError) {
      logger.warn(`Failed to fetch role name for user ${email}:`, roleError.message)
    }

    // Generate JWT token with both role and roleId
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
        roleId: user.role_id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    logger.info(`User logged in: ${email}`)

    const userData = UserModel.excludePassword(user)
    return {
      user: {
        ...userData,
        role: roleName,
      },
      token,
    }
  }

  static async getUserById(id) {
    const user = await UserModel.findById(id)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }
    return user
  }

  static async getCurrentUser(userId) {
    const user = await UserModel.findById(userId)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    // Generate Gravatar URL from email
    const crypto = await import('crypto')
    const emailHash = crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex')
    const avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=40`

    return {
      ...UserModel.excludePassword(user),
      avatar: avatarUrl,
      profileImage: avatarUrl,
    }
  }

  static async getAllUsers(filters = {}) {
    return await UserModel.findAll(filters)
  }

  static async getAdminUserManagementData(options = {}) {
    let connection

    try {
      connection = await pool.getConnection()

      const usersColumns = await this.getTableColumns(connection, 'users')
      const hasCreatedAt = usersColumns.has('created_at')
      const hasPhone = usersColumns.has('phone')
      const hasLicenseType = usersColumns.has('license_type')
      const hasRoleColumn = usersColumns.has('role')
      const hasRoleIdColumn = usersColumns.has('role_id')
      const hasIsActive = usersColumns.has('is_active')
      const hasEmailVerified = usersColumns.has('email_verified')
      const hasLastLogin = usersColumns.has('last_login')

      const hasRolesTable = hasRoleIdColumn
        ? await this.tableExists(connection, 'roles')
        : false

      const requestedPage = this.toPositiveIntegerOrDefault(options.page, 1, 1, 100000)
      const limit = this.toPositiveIntegerOrDefault(options.limit, 10, 1, 100)

      const summaryRoleJoin = hasRolesTable && hasRoleIdColumn
        ? 'LEFT JOIN roles sr ON sr.id = u.role_id'
        : ''
      const summaryWhereClause = hasRolesTable && hasRoleIdColumn && hasRoleColumn
        ? 'WHERE LOWER(COALESCE(sr.name, u.role, \'\')) <> \'admin\''
        : hasRolesTable && hasRoleIdColumn
          ? 'WHERE LOWER(COALESCE(sr.name, \'\')) <> \'admin\''
          : hasRoleColumn
            ? 'WHERE LOWER(COALESCE(u.role, \'\')) <> \'admin\''
            : ''

      const [summaryRows] = await connection.execute(
        `SELECT
           COUNT(*) AS total_users,
           ${
             hasCreatedAt
               ? `SUM(CASE
                   WHEN DATE_FORMAT(u.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
                   THEN 1 ELSE 0
                 END)`
               : '0'
           } AS new_this_month,
           ${
             hasCreatedAt
               ? `SUM(CASE
                   WHEN DATE_FORMAT(u.created_at, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
                   THEN 1 ELSE 0
                 END)`
               : '0'
           } AS new_last_month,
           ${
             hasIsActive && hasEmailVerified
               ? 'SUM(CASE WHEN COALESCE(u.is_active, 1) = 1 AND COALESCE(u.email_verified, 1) = 1 THEN 1 ELSE 0 END)'
               : hasIsActive
                 ? 'SUM(CASE WHEN COALESCE(u.is_active, 1) = 1 THEN 1 ELSE 0 END)'
                 : hasEmailVerified
                   ? 'SUM(CASE WHEN COALESCE(u.email_verified, 1) = 1 THEN 1 ELSE 0 END)'
                   : 'COUNT(*)'
           } AS active_now,
           ${
             hasIsActive
               ? 'SUM(CASE WHEN COALESCE(u.is_active, 1) = 0 THEN 1 ELSE 0 END)'
               : '0'
           } AS suspended
         FROM users u
         ${summaryRoleJoin}
         ${summaryWhereClause}`
      )

      const roleJoin = hasRolesTable && hasRoleIdColumn
        ? 'LEFT JOIN roles r ON r.id = u.role_id'
        : ''

      const { whereClause, whereParams } = this.buildAdminUserWhereClause({
        search: options.search,
        status: options.status,
        role: options.role,
        licenseType: options.licenseType,
        hasIsActive,
        hasEmailVerified,
        hasLicenseType,
        hasRoleColumn,
        hasRoleIdColumn,
        hasRolesTable,
      })

      const [filteredRows] = await connection.execute(
        `SELECT COUNT(*) AS filtered_total
         FROM users u
         ${roleJoin}
         ${whereClause}`,
        whereParams
      )

      const totalFilteredUsers = this.toNumberOrNull(filteredRows?.[0]?.filtered_total) || 0
      const totalPages = totalFilteredUsers > 0
        ? Math.ceil(totalFilteredUsers / limit)
        : 1
      const page = Math.min(requestedPage, totalPages)
      const offset = (page - 1) * limit

      const userSelectFields = [
        'u.id',
        'u.name',
        'u.email',
        hasPhone ? 'u.phone' : 'NULL AS phone',
        hasLicenseType ? 'u.license_type' : 'NULL AS license_type',
        hasRoleColumn ? 'u.role' : 'NULL AS role',
        hasRoleIdColumn ? 'u.role_id' : 'NULL AS role_id',
        hasRolesTable && hasRoleIdColumn ? 'r.name AS role_name' : 'NULL AS role_name',
        hasIsActive ? 'u.is_active' : '1 AS is_active',
        hasEmailVerified ? 'u.email_verified' : '1 AS email_verified',
        hasCreatedAt ? 'u.created_at' : 'NULL AS created_at',
        hasLastLogin ? 'u.last_login' : 'NULL AS last_login',
      ]

      const orderByClause = hasCreatedAt ? 'u.created_at DESC' : 'u.id DESC'

      const usersQuery = `SELECT
           ${userSelectFields.join(',\n           ')}
         FROM users u
         ${roleJoin}
         ${whereClause}
         ORDER BY ${orderByClause}
         LIMIT ${Number(limit)} OFFSET ${Number(offset)}`

      const [userRows] = whereParams.length > 0
        ? await connection.execute(usersQuery, whereParams)
        : await connection.query(usersQuery)

      const summaryRaw = summaryRows?.[0] || {}
      const totalUsers = this.toNumberOrNull(summaryRaw.total_users) || 0
      const newThisMonth = this.toNumberOrNull(summaryRaw.new_this_month) || 0
      const newLastMonth = this.toNumberOrNull(summaryRaw.new_last_month) || 0
      const activeNow = this.toNumberOrNull(summaryRaw.active_now) || 0
      const suspended = this.toNumberOrNull(summaryRaw.suspended) || 0

      const newThisMonthGrowthPercent = newLastMonth > 0
        ? Number((((newThisMonth - newLastMonth) / newLastMonth) * 100).toFixed(1))
        : null
      const activeRatioPercent = totalUsers > 0
        ? Number(((activeNow / totalUsers) * 100).toFixed(1))
        : null

      const users = (userRows || []).map((user) => this.mapAdminManagementUser(user))

      return {
        summary: {
          totalUsers,
          newThisMonth,
          newLastMonth,
          activeNow,
          activeRatioPercent,
          suspended,
          newThisMonthGrowthPercent,
        },
        pagination: {
          page,
          limit,
          totalItems: totalFilteredUsers,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        users,
      }
    } catch (error) {
      logger.error('Error getting admin user management data:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  static async getAdminUserDetail(id) {
    let connection

    try {
      const userId = Number(id)
      if (!Number.isInteger(userId) || userId <= 0) {
        const error = new Error('Invalid user id')
        error.statusCode = 400
        throw error
      }

      connection = await pool.getConnection()

      const usersColumns = await this.getTableColumns(connection, 'users')
      const hasPhone = usersColumns.has('phone')
      const hasLicenseType = usersColumns.has('license_type')
      const hasRoleColumn = usersColumns.has('role')
      const hasRoleIdColumn = usersColumns.has('role_id')
      const hasIsActive = usersColumns.has('is_active')
      const hasEmailVerified = usersColumns.has('email_verified')
      const hasCreatedAt = usersColumns.has('created_at')
      const hasUpdatedAt = usersColumns.has('updated_at')
      const hasLastLogin = usersColumns.has('last_login')
      const hasRolesTable = hasRoleIdColumn
        ? await this.tableExists(connection, 'roles')
        : false

      const roleJoin = hasRolesTable && hasRoleIdColumn
        ? 'LEFT JOIN roles r ON r.id = u.role_id'
        : ''

      const selectFields = [
        'u.id',
        'u.name',
        'u.email',
        hasPhone ? 'u.phone' : 'NULL AS phone',
        hasLicenseType ? 'u.license_type' : 'NULL AS license_type',
        hasRoleColumn ? 'u.role' : 'NULL AS role',
        hasRoleIdColumn ? 'u.role_id' : 'NULL AS role_id',
        hasRolesTable && hasRoleIdColumn ? 'r.name AS role_name' : 'NULL AS role_name',
        hasIsActive ? 'u.is_active' : '1 AS is_active',
        hasEmailVerified ? 'u.email_verified' : '1 AS email_verified',
        hasCreatedAt ? 'u.created_at' : 'NULL AS created_at',
        hasUpdatedAt ? 'u.updated_at' : 'NULL AS updated_at',
        hasLastLogin ? 'u.last_login' : 'NULL AS last_login',
      ]

      const [rows] = await connection.execute(
        `SELECT
           ${selectFields.join(',\n           ')}
         FROM users u
         ${roleJoin}
         WHERE u.id = ?
         LIMIT 1`,
        [userId]
      )

      if (!rows || rows.length === 0) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }

      const detail = this.mapAdminUserDetail(rows[0])
      if (String(detail.role || '').toLowerCase() === 'admin') {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }

      return detail
    } catch (error) {
      logger.error('Error getting admin user detail:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  static async updateAdminUserStatus({ id, status, actorUserId }) {
    let connection

    try {
      const userId = Number(id)
      if (!Number.isInteger(userId) || userId <= 0) {
        const error = new Error('Invalid user id')
        error.statusCode = 400
        throw error
      }

      if (Number(actorUserId) === userId && status === 'Suspended') {
        const error = new Error('You cannot suspend your own account')
        error.statusCode = 400
        throw error
      }

      connection = await pool.getConnection()
      const usersColumns = await this.getTableColumns(connection, 'users')
      const hasIsActive = usersColumns.has('is_active')
      const hasUpdatedAt = usersColumns.has('updated_at')

      if (!hasIsActive) {
        const error = new Error('Cannot update status because users.is_active is missing')
        error.statusCode = 400
        throw error
      }

      const [existingRows] = await connection.execute(
        'SELECT id FROM users WHERE id = ? LIMIT 1',
        [userId]
      )

      if (!existingRows || existingRows.length === 0) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }

      const nextActiveValue = status === 'Suspended' ? 0 : 1
      await connection.execute(
        hasUpdatedAt
          ? 'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?'
          : 'UPDATE users SET is_active = ? WHERE id = ?',
        [nextActiveValue, userId]
      )

      logger.info(`User ${userId} status updated to ${status}`)

      return {
        id: userId,
        status: nextActiveValue === 1 ? 'Active' : 'Suspended',
      }
    } catch (error) {
      logger.error('Error updating admin user status:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  static async createAdminUser({
    email,
    password,
    name,
    phone = '',
    licenseType = 'A1',
    role = 'learner',
    status = 'Active',
  }) {
    let connection

    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const normalizedName = String(name || '').trim()
      const normalizedPhone = String(phone || '').trim()
      const normalizedLicenseType = String(licenseType || 'A1').trim()

      const existingUser = await UserModel.findByEmail(normalizedEmail)
      if (existingUser) {
        const error = new Error('Email already registered')
        error.statusCode = 409
        throw error
      }

      connection = await pool.getConnection()
      const usersColumns = await this.getTableColumns(connection, 'users')
      const hasPhone = usersColumns.has('phone')
      const hasLicenseType = usersColumns.has('license_type')
      const hasRoleColumn = usersColumns.has('role')
      const hasRoleIdColumn = usersColumns.has('role_id')
      const hasEmailVerified = usersColumns.has('email_verified')
      const hasIsActive = usersColumns.has('is_active')
      const hasCreatedAt = usersColumns.has('created_at')
      const hasUpdatedAt = usersColumns.has('updated_at')
      const hasLastLogin = usersColumns.has('last_login')

      if (!usersColumns.has('password_hash')) {
        const error = new Error('Cannot create user because users.password_hash is missing')
        error.statusCode = 500
        throw error
      }

      let roleId = null
      const requestedRole = String(role || '').trim().toLowerCase()
      const normalizedRole = requestedRole === 'user' ? 'learner' : requestedRole
      let roleName = normalizedRole || 'learner'

      if (normalizedRole === 'admin') {
        const error = new Error('Admin role cannot be created from Add User')
        error.statusCode = 400
        throw error
      }

      if (hasRoleIdColumn) {
        const resolvedRole = await this.resolveRoleForAdminCreation(connection, normalizedRole)
        roleId = resolvedRole.roleId
        roleName = resolvedRole.roleName
      } else if (!roleName) {
        roleName = 'learner'
      }
      const { status: resolvedStatus, isActive, emailVerified } = this.resolveStatusFlags(status)
      const passwordHash = await bcrypt.hash(String(password || ''), PASSWORD_HASH_ROUNDS)

      const insertColumns = ['email', 'password_hash', 'name']
      const insertValues = ['?', '?', '?']
      const insertParams = [normalizedEmail, passwordHash, normalizedName]

      if (hasPhone) {
        insertColumns.push('phone')
        insertValues.push('?')
        insertParams.push(normalizedPhone)
      }

      if (hasLicenseType) {
        insertColumns.push('license_type')
        insertValues.push('?')
        insertParams.push(normalizedLicenseType)
      }

      if (hasRoleColumn) {
        insertColumns.push('role')
        insertValues.push('?')
        insertParams.push(roleName)
      }

      if (hasRoleIdColumn) {
        insertColumns.push('role_id')
        insertValues.push('?')
        insertParams.push(roleId)
      }

      if (hasEmailVerified) {
        insertColumns.push('email_verified')
        insertValues.push('?')
        insertParams.push(emailVerified)
      }

      if (hasIsActive) {
        insertColumns.push('is_active')
        insertValues.push('?')
        insertParams.push(isActive)
      }

      if (hasCreatedAt) {
        insertColumns.push('created_at')
        insertValues.push('NOW()')
      }

      if (hasUpdatedAt) {
        insertColumns.push('updated_at')
        insertValues.push('NOW()')
      }

      const [insertResult] = await connection.execute(
        `INSERT INTO users (${insertColumns.join(', ')})
         VALUES (${insertValues.join(', ')})`,
        insertParams
      )

      const hasRolesTable = hasRoleIdColumn
        ? await this.tableExists(connection, 'roles')
        : false
      const roleJoin = hasRolesTable && hasRoleIdColumn
        ? 'LEFT JOIN roles r ON r.id = u.role_id'
        : ''
      const createdUserSelectFields = [
        'u.id',
        'u.name',
        'u.email',
        hasPhone ? 'u.phone' : 'NULL AS phone',
        hasLicenseType ? 'u.license_type' : 'NULL AS license_type',
        hasRoleColumn ? 'u.role' : 'NULL AS role',
        hasRoleIdColumn ? 'u.role_id' : 'NULL AS role_id',
        hasRolesTable && hasRoleIdColumn ? 'r.name AS role_name' : 'NULL AS role_name',
        hasIsActive ? 'u.is_active' : `${isActive} AS is_active`,
        hasEmailVerified ? 'u.email_verified' : `${emailVerified} AS email_verified`,
        hasCreatedAt ? 'u.created_at' : 'NULL AS created_at',
        hasLastLogin ? 'u.last_login' : 'NULL AS last_login',
      ]

      const [createdRows] = await connection.execute(
        `SELECT
           ${createdUserSelectFields.join(',\n           ')}
         FROM users u
         ${roleJoin}
         WHERE u.id = ?
         LIMIT 1`,
        [insertResult.insertId]
      )

      const createdUser = createdRows?.[0]
        ? this.mapAdminManagementUser(createdRows[0])
        : {
            id: Number(insertResult.insertId),
            name: normalizedName || null,
            email: normalizedEmail || null,
            phone: normalizedPhone || null,
            role: roleName || null,
            roleId: Number(roleId) || null,
            licenseType: normalizedLicenseType || null,
            registeredAt: null,
            lastLogin: null,
            status: resolvedStatus,
          }

      logger.info(`Admin created new user: ${normalizedEmail}`)

      return {
        user: createdUser,
      }
    } catch (error) {
      logger.error('Error creating user from admin:', error)
      throw error
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  static async updateUser(id, updateData) {
    // Prevent email update (optional - remove if you want to allow it)
    const { email, ...allowedUpdates } = updateData

    const user = await UserModel.update(id, allowedUpdates)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    logger.info(`User updated: ${id}`)
    return user
  }

  static async changePassword(id, currentPassword, newPassword) {
    const user = await UserModel.findById(id)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    const userWithPassword = await UserModel.findById(id)
    const userFull = await UserModel.constructor.prototype.constructor(id)

    // Note: In this mock implementation, we can't fully verify since we exclude password
    // In real implementation with DB, you'd retrieve the full user record

    const newPasswordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS)
    const updated = await UserModel.update(id, { passwordHash: newPasswordHash })

    logger.info(`Password changed for user: ${id}`)
    return updated
  }

  static async deleteUser(id) {
    const user = await UserModel.findById(id)
    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    await UserModel.delete(id)
    logger.info(`User deleted: ${id}`)
    return true
  }

  static async verifyEmail(token) {
    try {
      // Find user by verification token
      const user = await UserModel.findByVerificationToken(token)
      
      if (!user) {
        const error = new Error('Invalid or expired verification token')
        error.statusCode = 400
        throw error
      }

      // Mark email as verified
      await UserModel.verifyEmail(user.id)

      logger.info(`Email verified for user: ${user.email}`)
      
      return {
        success: true,
        message: 'Email verified successfully! You can now login.', 
        email: user.email
      }
    } catch (error) {
      if (error.statusCode) throw error
      logger.error('Error verifying email:', error)
      throw error
    }
  }

  static async resendVerificationEmail(email) {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(email)
      
      if (!user) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }

      // If already verified, return success (don't expose this info)
      if (user.email_verified) {
        logger.info(`Resend verification requested for already-verified user: ${email}`)
        return {
          success: true,
          message: 'If an account exists, a verification email will be sent.'
        }
      }

      // Generate new verification token
      const verificationToken = UserModel.generateVerificationToken()
      
      // Set new token with 24-hour expiry
      await UserModel.setVerificationToken(user.id, verificationToken)
      
      // Send verification email
      await emailService.sendResendVerificationEmail(email, user.name, verificationToken)
      
      logger.info(`Resend verification email sent to: ${email}`)
      
      return {
        success: true,
        message: 'Verification email sent! Check your email for the link.',
        email
      }
    } catch (error) {
      logger.error('Error resending verification email:', error)
      throw error
    }
  }
}

export default UserService
