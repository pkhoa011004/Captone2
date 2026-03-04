// Validation middleware using Joi

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
    })

    if (error) {
      const messages = error.details.map((detail) => detail.message)
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      })
    }

    req.validatedData = value
    next()
  }
}

export default validateRequest
