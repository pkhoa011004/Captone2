import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import 'express-async-errors'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import userRoutes from './routes/userRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import { testConnection } from './config/database.js'

// Load environment variables
dotenv.config()

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const QUESTION_IMAGES_DIR = resolve(__dirname, '../questions')

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security Middleware
app.use(helmet())

// CORS Configuration - Allow localhost on any port for development
const allowedOrigins = NODE_ENV === 'development' 
  ? [/^http:\/\/localhost:\d+$/] 
  : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173']

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files for question images
app.use('/static/questions', express.static(QUESTION_IMAGES_DIR))

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
app.use('/api/v1/questions', questionRoutes)

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
const server = app.listen(PORT, async () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`)
  logger.info(`Environment: ${NODE_ENV}`)
  
  // Test database connection
  await testConnection()
})

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err)
  process.exit(1)
})

export default app
