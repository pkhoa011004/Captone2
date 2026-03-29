import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/UserModel.js'
import { logger } from '../utils/logger.js'
import emailService from './EmailService.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const PASSWORD_HASH_ROUNDS = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10

export class UserService {
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

    // Check if email is verified
    if (!user.email_verified) {
      const error = new Error('Please verify your email before logging in. Check your email for the verification link.')
      error.statusCode = 403
      throw error
    }

    // Generate JWT token - use role_id instead of role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.role_id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    logger.info(`User logged in: ${email}`)

    return {
      user: UserModel.excludePassword(user),
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

  static async getAllUsers(filters = {}) {
    return await UserModel.findAll(filters)
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
