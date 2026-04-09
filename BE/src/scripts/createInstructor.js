import { pool } from '../config/database.js'
import bcrypt from 'bcryptjs'

const createInstructorAccount = async () => {
  let connection
  try {
    connection = await pool.getConnection()
    
    // Tạo role instructor nếu chưa có
    const [existingRole] = await connection.execute(
      `SELECT id FROM roles WHERE name = 'instructor' LIMIT 1`
    )
    
    let instructorRoleId
    if (existingRole.length === 0) {
      await connection.execute(
        `INSERT INTO roles (name, description, created_at, updated_at) 
         VALUES ('instructor', 'Instructor', NOW(), NOW())`
      )
      const [newRole] = await connection.execute(
        `SELECT id FROM roles WHERE name = 'instructor' LIMIT 1`
      )
      instructorRoleId = newRole[0].id
      console.log('✅ Role instructor created')
    } else {
      instructorRoleId = existingRole[0].id
      console.log('✅ Role instructor already exists')
    }
    
    // Tạo tài khoản instructor
    const email = 'maiphuockhoa@dtu.edu.vn'
    const password = 'Phuockhoa@0909'
    const passwordHash = await bcrypt.hash(password, 10)
    
    const [existing] = await connection.execute(
      `SELECT id FROM users WHERE email = ?`, [email]
    )
    
    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO users (email, password_hash, name, phone, license_type, role_id, email_verified, created_at, updated_at)
         VALUES (?, ?, 'Instructor', '', 'A1', ?, 1, NOW(), NOW())`,
        [email, passwordHash, instructorRoleId]
      )
      console.log(`✅ Instructor account created successfully!`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔐 Password: ${password}`)
    } else {
      console.log(`ℹ️ Instructor account already exists with email: ${email}`)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) connection.release()
    process.exit(0)
  }
}

createInstructorAccount()
