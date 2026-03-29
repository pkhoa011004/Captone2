import mysql from 'mysql2/promise';

async function getToken() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'drive_master'
    });

    const [users] = await connection.execute(
      'SELECT id, email, verification_token FROM users WHERE email_verified = 0 ORDER BY created_at DESC LIMIT 1'
    );

    connection.end();

    if (users.length > 0) {
      console.log('Email:', users[0].email);
      console.log('Token:', users[0].verification_token);
    } else {
      console.log('No unverified users found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getToken();
