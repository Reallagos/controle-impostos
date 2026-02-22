/**
 * Environment Variables Configuration
 * Validates required JWT_SECRET and other configuration
 */

// Validate JWT_SECRET length (minimum 32 characters for security)
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
if (jwtSecret.length < 32) {
  console.warn('⚠️ JWT_SECRET should be at least 32 characters for security');
}

// Export configuration
export const config = {
  // Database
  db: {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'controle_impostos_dev',
  },

  // JWT
  jwt: {
    secret: jwtSecret,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Server
  server: {
    port: parseInt(process.env.SERVER_PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
