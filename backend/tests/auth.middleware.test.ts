/**
 * Auth Middleware Tests
 * Tests JWT validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, optionalAuthMiddleware } from '../src/middleware/authMiddleware';
import { config } from '../src/config/env';

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should pass for valid token in Authorization header', () => {
    const token = jwt.sign(
      {
        userId: 1,
        email: 'test@example.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      config.jwt.secret
    );

    (req as any).headers.authorization = `Bearer ${token}`;

    authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeDefined();
    expect((req as any).user.email).toBe('test@example.com');
  });

  it('should reject request without Authorization header', () => {
    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request without Bearer prefix', () => {
    const token = jwt.sign(
      {
        userId: 1,
        email: 'test@example.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      config.jwt.secret
    );

    (req as any).headers.authorization = token; // Missing "Bearer " prefix

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', () => {
    (req as any).headers.authorization = 'Bearer invalid.token.here';

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });

  it('should reject expired token', () => {
    const expiredToken = jwt.sign(
      {
        userId: 1,
        email: 'test@example.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000) - 3600,
        exp: Math.floor(Date.now() / 1000) - 1800, // Expired 30 minutes ago
      },
      config.jwt.secret
    );

    (req as any).headers.authorization = `Bearer ${expiredToken}`;

    authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
  });
});

describe('optionalAuthMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should pass for valid token', () => {
    const token = jwt.sign(
      {
        userId: 1,
        email: 'test@example.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      config.jwt.secret
    );

    (req as any).headers.authorization = `Bearer ${token}`;

    optionalAuthMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeDefined();
  });

  it('should pass without token', () => {
    optionalAuthMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeUndefined();
  });

  it('should pass with invalid token (optional)', () => {
    (req as any).headers.authorization = 'Bearer invalid.token.here';

    optionalAuthMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeUndefined();
  });
});
