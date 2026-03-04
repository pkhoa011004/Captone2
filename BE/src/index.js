import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import 'express-async-errors'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import userRoutes from './routes/userRoutes.js'

// Load environment variables
dotenv.config()

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/v1/users', userRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  })
})

// Global Error Handler
app.use(errorHandler)

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`)
  logger.info(`Environment: ${NODE_ENV}`)
})

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err)
  process.exit(1)
})

export default app
