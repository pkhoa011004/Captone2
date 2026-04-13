import express from 'express'
import { validateRequest } from '../middleware/validation.js'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  getAllUsers,
  getAdminUserManagementData,
  getAdminUserDetail,
  updateAdminUserStatus,
  createAdminUser,
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
  updateManagementStatusSchema,
  adminCreateUserSchema,
} from '../validators/userValidator.js'

const router = express.Router()

// Public routes
router.post('/register', validateRequest(registerSchema), register)
router.post('/login', validateRequest(loginSchema), login)
router.get('/verify-email', verifyEmail)
router.post('/resend-verification-email', resendVerificationEmail)

// Protected routes
router.get('/profile', authenticate, getProfile)
router.patch('/profile', authenticate, validateRequest(updateUserSchema), updateUser)
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), changePassword)

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllUsers)
router.post(
  '/admin',
  authenticate,
  authorize('admin'),
  validateRequest(adminCreateUserSchema),
  createAdminUser
)
router.get('/admin/user-management', authenticate, authorize('admin'), getAdminUserManagementData)
router.get('/admin/:id/detail', authenticate, authorize('admin'), getAdminUserDetail)
router.patch(
  '/admin/:id/status',
  authenticate,
  authorize('admin'),
  validateRequest(updateManagementStatusSchema),
  updateAdminUserStatus
)
router.get('/:id', authenticate, getUserById)
router.delete('/:id', authenticate, authorize('admin'), deleteUser)

export default router
