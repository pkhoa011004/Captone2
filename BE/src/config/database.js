import mysql from 'mysql2/promise'

// Database configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'drive_master',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
}

// Create connection pool
export const pool = mysql.createPool(dbConfig)

// Test connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('MySQL database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error.message)
    return false
  }
}

export default dbConfig
