/**
 * Authentication Routes
 * POST /auth/login - User login
 * POST /auth/refresh - Refresh access token
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { LoginRequest, RefreshTokenRequest } from '../types/auth';
import pool from '../config/database';

const router = Router();
const authService = new AuthService(pool);

/**
 * POST /auth/login
 * Login with email and password
 * Returns access token, refresh token, and user data
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Authenticate user
    const response = await authService.login(email, password);

    // Return tokens and user data
    res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    if (message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 * Returns new access token and refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as RefreshTokenRequest;

    // Validate input
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    // Validate refresh token and generate new tokens
    const newTokens = authService.refreshAccessToken(refreshToken);

    // Return new tokens
    res.status(200).json(newTokens);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';

    if (message.includes('expired') || message.includes('Invalid')) {
      res.status(401).json({ error: message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
