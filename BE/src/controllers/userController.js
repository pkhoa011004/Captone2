import { UserService } from '../services/UserService.js'
import { successResponse, errorResponse } from '../utils/responseHandler.js'
import { logger } from '../utils/logger.js'

export const register = async (req, res, next) => {
  try {
    const { email, password, name, phone, licenseType } = req.validatedData

    const user = await UserService.register(email, password, name, phone, licenseType)

    successResponse(res, user, 'User registered successfully', 201)
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData

    const result = await UserService.login(email, password)

    successResponse(
      res,
      {
        user: result.user,
        token: result.token,
      },
      'Login successful'
    )
  } catch (error) {
    next(error)
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query

    if (!token) {
      return errorResponse(res, 'Verification token is required', 400)
    }

    const result = await UserService.verifyEmail(token)
    successResponse(res, result, result.message)
  } catch (error) {
    next(error)
  }
}

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return errorResponse(res, 'Email is required', 400)
    }

    const result = await UserService.resendVerificationEmail(email)
    successResponse(res, result, result.message)
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.user.id)
    successResponse(res, user, 'Profile retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query
    const filters = {}

    if (search) filters.search = search
    if (role) filters.role = role

    const users = await UserService.getAllUsers(filters)
    successResponse(res, users, 'Users retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await UserService.getUserById(id)
    successResponse(res, user, 'User retrieved successfully')
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = req.validatedData

    const user = await UserService.updateUser(id, updateData)
    successResponse(res, user, 'User updated successfully')
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedData
    const userId = req.user.id

    const user = await UserService.changePassword(userId, currentPassword, newPassword)
    successResponse(res, user, 'Password changed successfully')
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    await UserService.deleteUser(id)
    successResponse(res, null, 'User deleted successfully')
  } catch (error) {
    next(error)
  }
}

export default {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
}
