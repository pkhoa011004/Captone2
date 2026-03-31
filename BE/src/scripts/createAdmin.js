import { pool } from '../config/database.js'
import bcrypt from 'bcryptjs'

const createAdminAccount = async () => {
  let connection
  try {
    connection = await pool.getConnection()
    
    // Tạo role admin nếu chưa có
    const [existingRole] = await connection.execute(
      `SELECT id FROM roles WHERE name = 'admin' LIMIT 1`
    )
    
    let adminRoleId
    if (existingRole.length === 0) {
      await connection.execute(
        `INSERT INTO roles (name, description, created_at, updated_at) 
         VALUES ('admin', 'Administrator', NOW(), NOW())`
      )
      const [newRole] = await connection.execute(
        `SELECT id FROM roles WHERE name = 'admin' LIMIT 1`
      )
      adminRoleId = newRole[0].id
      console.log('✅ Role admin created')
    } else {
      adminRoleId = existingRole[0].id
      console.log('✅ Role admin already exists')
    }
    
    // Tạo tài khoản admin
    const email = 'admin@drivemaster.com'
    const password = 'admin'
    const passwordHash = await bcrypt.hash(password, 10)
    
    const [existing] = await connection.execute(
      `SELECT id FROM users WHERE email = ?`, [email]
    )
    
    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO users (email, password_hash, name, phone, license_type, role_id, email_verified, created_at, updated_at)
         VALUES (?, ?, 'Admin', '', 'A1', ?, 1, NOW(), NOW())`,
        [email, passwordHash, adminRoleId]
      )
      console.log(`✅ Admin account created successfully!`)
      console.log(`📧 Email: ${email}`)
      console.log(`🔐 Password: ${password}`)
    } else {
      console.log(`ℹ️ Admin account already exists with email: ${email}`)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) connection.release()
    process.exit(0)
  }
}

createAdminAccount()
