/**
 * Authentication Types
 * Defines JWT payload structure and auth request types
 */

export type UserRole = 'admin' | 'contador' | 'gerente' | 'visualizador';

/**
 * JWT Payload Structure
 * Contains claims issued by the auth service
 */
export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat: number; // Issued At
  exp: number; // Expiration Time
}

/**
 * Extended Express Request with user data
 * Used in protected routes
 */
export interface AuthRequest {
  user?: JWTPayload;
  token?: string;
}

/**
 * Login Request Payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nome: string;
    role: UserRole;
  };
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh Token Response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Error Response
 */
export interface ErrorResponse {
  error: string;
  statusCode: number;
}
