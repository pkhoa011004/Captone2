// Logger utility

export const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString()
    console.log(`[INFO] ${timestamp} - ${message}`, data || '')
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString()
    console.error(`[ERROR] ${timestamp} - ${message}`, error ? error.message || error : '')
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString()
    console.warn(`[WARN] ${timestamp} - ${message}`, data || '')
  },
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString()
      console.log(`[DEBUG] ${timestamp} - ${message}`, data || '')
    }
  },
}

export default logger
