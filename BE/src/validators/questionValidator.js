import Joi from 'joi'

const optionSchema = Joi.object({
  option_text: Joi.string().trim().required().messages({
    'any.required': 'option_text is required',
  }),
  is_correct: Joi.boolean().optional().default(false),
})

const correctAnswerSchema = Joi.alternatives().try(
  Joi.number().integer().min(1).max(4),
  Joi.string().valid('1', '2', '3', '4')
)

export const createQuestionSchema = Joi.object({
  certificate_id: Joi.number().integer().positive().optional(),
  licenseType: Joi.string().trim().uppercase().valid('A1', 'B1').optional(),
  question_text: Joi.string().trim().required().messages({
    'any.required': 'question_text is required',
  }),
  option_a: Joi.string().trim().optional(),
  option_b: Joi.string().trim().optional(),
  option_c: Joi.string().trim().allow(null, '').optional().default(null),
  option_d: Joi.string().trim().allow(null, '').optional().default(null),
  correct_answer: correctAnswerSchema.optional(),
  image_url: Joi.string().allow(null, '').optional().default(null),
  image: Joi.string().allow(null, '').optional().default(null),
  is_fatal: Joi.boolean().optional().default(false),
  explanation: Joi.string().allow(null, '').optional().default(null),
  options: Joi.array().items(optionSchema).min(2).optional().messages({
    'array.min': 'Question must have at least 2 options',
  }),
})
  .or('option_a', 'options')
  .custom((value, helpers) => {
    const hasLegacyOptions = Array.isArray(value.options) && value.options.length >= 2

    if (hasLegacyOptions) {
      const legacyOptions = value.options.map((item) => item.option_text)
      const correctIndex = value.options.findIndex((item) => item.is_correct === true)

      value.option_a = value.option_a ?? legacyOptions[0] ?? null
      value.option_b = value.option_b ?? legacyOptions[1] ?? null
      value.option_c = value.option_c ?? legacyOptions[2] ?? null
      value.option_d = value.option_d ?? legacyOptions[3] ?? null
      value.correct_answer = value.correct_answer ?? (correctIndex >= 0 ? correctIndex + 1 : null)
    }

    if (!value.option_a || !value.option_b) {
      return helpers.error('any.invalid', { message: 'option_a and option_b are required' })
    }

    if (!value.correct_answer) {
      return helpers.error('any.invalid', { message: 'correct_answer is required' })
    }

    const optionCount = [value.option_a, value.option_b, value.option_c, value.option_d]
      .filter((option) => option !== null && option !== undefined && String(option).trim() !== '')
      .length

    const answerNumber = Number(value.correct_answer)
    if (Number.isNaN(answerNumber) || answerNumber < 1 || answerNumber > optionCount) {
      return helpers.error('any.invalid', { message: 'correct_answer is out of option range' })
    }

    value.correct_answer = answerNumber
    if (value.image && !value.image_url) {
      value.image_url = value.image
    }

    return value
  })

export const updateQuestionSchema = Joi.object({
  certificate_id: Joi.number().integer().positive().optional(),
  licenseType: Joi.string().trim().uppercase().valid('A1', 'B1').optional(),
  question_text: Joi.string().trim().optional(),
  option_a: Joi.string().trim().optional(),
  option_b: Joi.string().trim().optional(),
  option_c: Joi.string().trim().allow(null, '').optional(),
  option_d: Joi.string().trim().allow(null, '').optional(),
  correct_answer: correctAnswerSchema.optional(),
  image_url: Joi.string().allow(null, '').optional(),
  image: Joi.string().allow(null, '').optional(),
  is_fatal: Joi.boolean().optional(),
  explanation: Joi.string().allow(null, '').optional(),
  options: Joi.array().items(optionSchema).min(2).optional().messages({
    'array.min': 'Question must have at least 2 options',
  }),
})
  .min(1)
  .custom((value) => {
    if (Array.isArray(value.options) && value.options.length >= 2) {
      const legacyOptions = value.options.map((item) => item.option_text)
      const correctIndex = value.options.findIndex((item) => item.is_correct === true)

      value.option_a = value.option_a ?? legacyOptions[0] ?? undefined
      value.option_b = value.option_b ?? legacyOptions[1] ?? undefined
      value.option_c = value.option_c ?? legacyOptions[2] ?? undefined
      value.option_d = value.option_d ?? legacyOptions[3] ?? undefined

      if (value.correct_answer === undefined && correctIndex >= 0) {
        value.correct_answer = correctIndex + 1
      }
    }

    if (value.image !== undefined && value.image_url === undefined) {
      value.image_url = value.image
    }

    return value
  })

const answerItemSchema = Joi.object({
  question_id: Joi.number().integer().positive().required(),
  selected_answer: Joi.alternatives().try(
    Joi.number().integer().min(1).max(4),
    Joi.string().valid('1', '2', '3', '4'),
    Joi.valid(null)
  ).required(),
})

export const gradeExamSchema = Joi.object({
  certificate_id: Joi.number().integer().positive().optional(),
  licenseType: Joi.string().trim().uppercase().valid('A1', 'B1').optional(),
  pass_threshold: Joi.number().integer().min(1).optional(),
  question_ids: Joi.array().items(Joi.number().integer().positive()).min(1).optional(),
  answers: Joi.array().items(answerItemSchema).min(1).required(),
})
  .custom((value, helpers) => {
    const answerQuestionIds = value.answers.map((item) => Number(item.question_id))
    const uniqueIds = new Set(answerQuestionIds)

    if (uniqueIds.size !== answerQuestionIds.length) {
      return helpers.error('any.invalid', { message: 'Duplicate question_id in answers' })
    }

    value.answers = value.answers.map((item) => ({
      question_id: Number(item.question_id),
      selected_answer: item.selected_answer === null ? null : Number(item.selected_answer),
    }))

    if (Array.isArray(value.question_ids)) {
      const normalizedQuestionIds = [...new Set(value.question_ids.map((id) => Number(id)))]
      const answerIdSet = new Set(value.answers.map((item) => item.question_id))
      const invalidAnswer = value.answers.find((item) => !normalizedQuestionIds.includes(item.question_id))

      if (invalidAnswer) {
        return helpers.error('any.invalid', {
          message: `Answer question_id ${invalidAnswer.question_id} is not in question_ids`,
        })
      }

      value.question_ids = normalizedQuestionIds
      value.unanswered_question_ids = normalizedQuestionIds.filter((id) => !answerIdSet.has(id))
    } else {
      value.question_ids = value.answers.map((item) => item.question_id)
      value.unanswered_question_ids = []
    }

    return value
  })

export default {
  createQuestionSchema,
  updateQuestionSchema,
  gradeExamSchema,
}
