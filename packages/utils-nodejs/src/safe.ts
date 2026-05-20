import { timingSafeEqual } from 'crypto'

/**
 * Compares two strings using constant-time comparison
 * to reduce the risk of timing attacks.
 *
 * Unlike `===`, comparison time does not depend
 * on how many characters match before the first difference.
 *
 * Useful for comparing:
 * - webhook signatures
 * - HMAC values
 * - API secrets
 * - authentication tokens
 */
export const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, 'utf8')
  const rightBuffer = Buffer.from(right, 'utf8')

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}
