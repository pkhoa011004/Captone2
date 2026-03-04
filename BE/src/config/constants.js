// Application constants

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}

export const API_PREFIX = process.env.API_PREFIX || '/api/v1'

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}

export default {
  HTTP_STATUS,
  API_PREFIX,
  JWT_CONFIG,
}
