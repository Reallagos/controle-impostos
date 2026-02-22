/**
 * Auth Endpoints Integration Tests
 * Tests /auth/login, /auth/refresh, and protected routes
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/env';
import { AuthService } from '../src/services/AuthService';

describe('Authentication Endpoints', () => {
  let pool: Pool;
  let authService: AuthService;
  let validAccessToken: string;
  let validRefreshToken: string;

  beforeAll(() => {
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'controle_impostos_dev',
    });
    authService = new AuthService(pool);

    // Generate tokens for testing
    const tokens = authService.generateTokens(1, 'test@example.com', 'admin');
    validAccessToken = tokens.accessToken;
    validRefreshToken = tokens.refreshToken;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials (seed data)', async () => {
      const response = await authService.login('admin@controle-impostos.dev', 'admin123');

      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('refreshToken');
      expect(response.user).toHaveProperty('id');
      expect(response.user).toHaveProperty('email');
      expect(response.user).toHaveProperty('role');
      expect(response.user.email).toBe('admin@controle-impostos.dev');
      expect(response.user.role).toBe('admin');
    });

    it('should reject invalid credentials (wrong password)', async () => {
      expect(async () => {
        await authService.login('admin@controle-impostos.dev', 'wrongpassword');
      }).rejects.toThrow('Invalid credentials');
    });

    it('should reject non-existent email', async () => {
      expect(async () => {
        await authService.login('nonexistent@example.com', 'password');
      }).rejects.toThrow('Invalid credentials');
    });

    it('should reject missing email', async () => {
      expect(async () => {
        await authService.login('', 'password');
      }).rejects.toThrow();
    });

    it('should reject missing password', async () => {
      expect(async () => {
        await authService.login('test@example.com', '');
      }).rejects.toThrow();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', () => {
      const newTokens = authService.refreshAccessToken(validRefreshToken);

      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
      expect(newTokens.accessToken).not.toBe(validAccessToken);
      expect(newTokens.refreshToken).not.toBe(validRefreshToken);
    });

    it('should reject invalid refresh token', () => {
      expect(() => {
        authService.refreshAccessToken('invalid.refresh.token');
      }).toThrow();
    });

    it('should reject expired refresh token', () => {
      const expiredToken = jwt.sign(
        {
          userId: 1,
          email: 'test@example.com',
          role: 'admin',
          iat: Math.floor(Date.now() / 1000) - 3600,
          exp: Math.floor(Date.now() / 1000) - 1800,
        },
        config.jwt.secret
      );

      expect(() => {
        authService.refreshAccessToken(expiredToken);
      }).toThrow();
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate correct access token', () => {
      const payload = authService.validateToken(validAccessToken);

      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('role');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
    });

    it('should reject invalid token format', () => {
      expect(() => {
        authService.validateToken('not.a.valid.token');
      }).toThrow();
    });

    it('should reject malformed token', () => {
      expect(() => {
        authService.validateToken('malformed-token');
      }).toThrow();
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        {
          userId: 1,
          email: 'test@example.com',
          role: 'admin',
          iat: Math.floor(Date.now() / 1000) - 3600,
          exp: Math.floor(Date.now() / 1000) - 1800,
        },
        config.jwt.secret
      );

      expect(() => {
        authService.validateToken(expiredToken);
      }).toThrow('Token expired');
    });
  });

  describe('Protected Routes', () => {
    it('should allow access with valid token', () => {
      const payload = authService.validateToken(validAccessToken);
      expect(payload.userId).toBe(1);
      expect(payload.email).toBe('test@example.com');
    });

    it('should extract user role from token', () => {
      const payload = authService.validateToken(validAccessToken);
      expect(payload.role).toBe('admin');
    });

    it('should track token expiration time', () => {
      const payload = authService.validateToken(validAccessToken);
      expect(payload.exp).toBeGreaterThan(payload.iat);
      expect(payload.exp - payload.iat).toBeLessThanOrEqual(15 * 60 + 1); // 15 minutes + 1s buffer
    });
  });
});
