import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

// Build pool config
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  database: process.env.DB_NAME || 'evershop2',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
};

// Only add SSL config if not disabled
if (process.env.DB_SSLMODE && process.env.DB_SSLMODE !== 'disable') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

export async function seedTestAdmin() {
  const testAdminEmail = 'alanewiston2@gmail.com';
  const testAdminPassword = 'a12345678';
  const testAdminName = 'Admin User';

  try {
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(testAdminPassword, salt);

    // Check if admin user exists
    const checkResult = await pool.query(
      'SELECT * FROM admin_user WHERE email = $1',
      [testAdminEmail]
    );

    if (checkResult.rows.length > 0) {
      // User exists - update password to ensure it's properly hashed
      await pool.query(
        'UPDATE admin_user SET password = $1 WHERE email = $2',
        [hashedPassword, testAdminEmail]
      );
      console.log(`✓ Test admin user ${testAdminEmail} password updated with hash`);
      return { success: true, message: 'Admin user password updated' };
    }

    // Insert test admin user
    const result = await pool.query(
      `INSERT INTO admin_user (email, password, full_name, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING admin_user_id, email, full_name`,
      [testAdminEmail, hashedPassword, testAdminName, true]
    );

    console.log(`✓ Test admin user created: ${testAdminEmail}`);
    return { success: true, message: 'Admin user created', data: result.rows[0] };
  } catch (error) {
    console.error('✗ Error seeding test admin:', error.message);
    return { success: false, message: error.message };
  }
}

export async function cleanupTestAdmin() {
  const testAdminEmail = 'alanewiston2@gmail.com';

  try {
    await pool.query('DELETE FROM admin_user WHERE email = $1', [testAdminEmail]);
    console.log(`✓ Test admin user cleaned up`);
    return { success: true };
  } catch (error) {
    console.error('✗ Error cleanup test admin:', error.message);
    return { success: false, message: error.message };
  }
}

export async function closePool() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing pool:', error);
  }
}
