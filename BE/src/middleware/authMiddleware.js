import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Use Bearer token in Authorization header',
      })
    }

    const token = authHeader.slice(7) // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    logger.debug('User authenticated:', decoded.id)
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      })
    }

    logger.error('Auth error:', error.message)
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
    }

    const userRole = req.user.role || req.user.roleId

    const roleAliases = {
      admin: [1, 'admin'],
      user: [2, 'user'],
    }

    const isAllowed = roles.length === 0
      || roles.some((role) => {
        const acceptedValues = roleAliases[role] || [role]
        return acceptedValues.includes(userRole)
      })

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      })
    }

    next()
  }
}

export default { authenticate, authorize }
