import Joi from 'joi'

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  name: Joi.string().min(2).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  phone: Joi.string().optional(),
  licenseType: Joi.string().valid('A1', 'B1').optional().default('A1').messages({
    'any.only': 'License type must be A1 or B1',
  }),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
})

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
})

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
})

export default {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
}
