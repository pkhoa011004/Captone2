import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function addEmailVerificationColumns() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('Adding email verification columns to users table...');
    
    // Check if columns already exist
    const [result] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME IN ('email_verified', 'verification_token', 'token_expires_at')"
    );
    
    if (result.length === 3) {
      console.log('✅ All email verification columns already exist!');
      return;
    }
    
    // Add email_verified column if not exists
    if (!result.some(col => col.COLUMN_NAME === 'email_verified')) {
      await connection.execute(
        "ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER updated_at"
      );
      console.log('✅ Added email_verified column');
    }
    
    // Add verification_token column if not exists
    if (!result.some(col => col.COLUMN_NAME === 'verification_token')) {
      await connection.execute(
        "ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL UNIQUE AFTER email_verified"
      );
      console.log('✅ Added verification_token column');
    }
    
    // Add token_expires_at column if not exists
    if (!result.some(col => col.COLUMN_NAME === 'token_expires_at')) {
      await connection.execute(
        "ALTER TABLE users ADD COLUMN token_expires_at DATETIME NULL AFTER verification_token"
      );
      console.log('✅ Added token_expires_at column');
    }
    
    console.log('✅ Email verification columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

addEmailVerificationColumns();
