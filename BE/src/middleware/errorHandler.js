import { logger } from '../utils/logger.js'

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err.message)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details 
    }),
  })
}

export default errorHandler
