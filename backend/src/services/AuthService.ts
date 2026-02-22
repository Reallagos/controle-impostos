/**
 * Authentication Service
 * Handles JWT token generation, validation, and user authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { config } from '../config/env';
import { JWTPayload, LoginResponse, UserRole } from '../types/auth';

export class AuthService {
  constructor(private pool: Pool) {}

  /**
   * Login with email and password
   * Validates credentials and returns tokens
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const result = await this.pool.query(
      'SELECT id, email, senha_hash, nome, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Return response with user data
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role as UserRole,
      },
    };
  }

  /**
   * Generate access and refresh tokens
   * Access token: 15 minutes (for security)
   * Refresh token: 7 days (for convenience)
   */
  generateTokens(userId: number, email: string, role: string): { accessToken: string; refreshToken: string } {
    const now = Math.floor(Date.now() / 1000);

    // Access Token Payload
    const accessPayload: JWTPayload = {
      userId,
      email,
      role: role as UserRole,
      iat: now,
      exp: now + 15 * 60, // 15 minutes
    };

    // Refresh Token Payload (longer expiry)
    const refreshPayload: JWTPayload = {
      userId,
      email,
      role: role as UserRole,
      iat: now,
      exp: now + 7 * 24 * 60 * 60, // 7 days
    };

    // Sign tokens
    const accessToken = jwt.sign(accessPayload, config.jwt.secret);
    const refreshToken = jwt.sign(refreshPayload, config.jwt.secret);

    return { accessToken, refreshToken };
  }

  /**
   * Validate access token
   * Returns payload if valid, throws error if invalid/expired
   */
  validateToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Validate refresh token and generate new tokens
   * Used when access token expires
   */
  validateRefreshToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Refresh tokens using a valid refresh token
   * Returns new access and refresh tokens
   */
  refreshAccessToken(refreshToken: string): { accessToken: string; refreshToken: string } {
    const payload = this.validateRefreshToken(refreshToken);

    // Generate new tokens using user info from refresh token
    return this.generateTokens(payload.userId, payload.email, payload.role);
  }
}
