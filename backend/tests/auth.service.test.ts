/**
 * AuthService Unit Tests
 * Tests login, token generation, and token validation
 */

import { AuthService } from '../src/services/AuthService';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let pool: Pool;

  // Mock database connection
  beforeAll(() => {
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'controle_impostos_dev',
    });
    authService = new AuthService(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      // Use seed data from STORY-1.2
      const response = await authService.login('admin@controle-impostos.dev', 'admin123');

      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('refreshToken');
      expect(response.user.email).toBe('admin@controle-impostos.dev');
      expect(response.user.role).toBe('admin');
    });

    it('should reject invalid password', async () => {
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
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', () => {
      const { accessToken, refreshToken } = authService.generateTokens(1, 'test@example.com', 'admin');

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(accessToken).not.toBe(refreshToken);
    });

    it('access token should be decodable', () => {
      const { accessToken } = authService.generateTokens(1, 'test@example.com', 'admin');
      const payload = authService.validateToken(accessToken);

      expect(payload.userId).toBe(1);
      expect(payload.email).toBe('test@example.com');
      expect(payload.role).toBe('admin');
    });
  });

  describe('validateToken', () => {
    it('should validate correct token', () => {
      const { accessToken } = authService.generateTokens(1, 'test@example.com', 'contador');
      const payload = authService.validateToken(accessToken);

      expect(payload.userId).toBe(1);
      expect(payload.email).toBe('test@example.com');
      expect(payload.role).toBe('contador');
    });

    it('should reject invalid token', () => {
      expect(() => {
        authService.validateToken('invalid.token.here');
      }).toThrow('Invalid token');
    });

    it('should reject malformed token', () => {
      expect(() => {
        authService.validateToken('not-a-jwt-token');
      }).toThrow();
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate correct refresh token', () => {
      const { refreshToken } = authService.generateTokens(1, 'test@example.com', 'gerente');
      const payload = authService.validateRefreshToken(refreshToken);

      expect(payload.userId).toBe(1);
      expect(payload.role).toBe('gerente');
    });

    it('should reject invalid refresh token', () => {
      expect(() => {
        authService.validateRefreshToken('invalid.refresh.token');
      }).toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new tokens from refresh token', () => {
      const { refreshToken } = authService.generateTokens(1, 'test@example.com', 'visualizador');
      const newTokens = authService.refreshAccessToken(refreshToken);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();

      const payload = authService.validateToken(newTokens.accessToken);
      expect(payload.userId).toBe(1);
      expect(payload.email).toBe('test@example.com');
      expect(payload.role).toBe('visualizador');
    });
  });
});
