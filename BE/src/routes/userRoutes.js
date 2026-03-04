import express from 'express'
import { validateRequest } from '../middleware/validation.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import {
  register,
  login,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
} from '../controllers/userController.js'
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
} from '../validators/userValidator.js'

const router = express.Router()

// Public routes
router.post('/register', validateRequest(registerSchema), register)
router.post('/login', validateRequest(loginSchema), login)

// Protected routes
router.get('/profile', authenticate, getProfile)
router.patch('/profile', authenticate, validateRequest(updateUserSchema), updateUser)
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), changePassword)

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllUsers)
router.get('/:id', authenticate, getUserById)
router.delete('/:id', authenticate, authorize('admin'), deleteUser)

export default router
