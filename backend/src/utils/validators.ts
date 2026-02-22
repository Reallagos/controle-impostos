/**
 * Validators
 * Input validation functions for CNPJ, email, etc
 */

/**
 * Validate CNPJ format
 * Format: XX.XXX.XXX/XXXX-XX
 * Regex: 2 digits, dot, 3 digits, dot, 3 digits, slash, 4 digits, hyphen, 2 digits
 * Note: This is basic format validation, not digit verification
 * Digit verification can be added in future stories
 */
export function validateCNPJ(cnpj: string): boolean {
  // Check if empty
  if (!cnpj || typeof cnpj !== 'string') {
    return false;
  }

  // Regex: XX.XXX.XXX/XXXX-XX
  const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

  return cnpjRegex.test(cnpj.trim());
}

/**
 * Validate company name
 * Rules:
 * - Non-empty string
 * - Max 255 characters
 * - Trimmed (no leading/trailing spaces)
 */
export function validateNome(nome: string): boolean {
  // Check type
  if (!nome || typeof nome !== 'string') {
    return false;
  }

  // Trim and check length
  const trimmed = nome.trim();
  return trimmed.length > 0 && trimmed.length <= 255;
}

/**
 * Validate email format (for future use)
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
