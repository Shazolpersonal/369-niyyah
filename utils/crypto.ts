/**
 * Cryptographically secure random number generator.
 * Returns a random float between 0 (inclusive) and 1 (exclusive).
 *
 * This is a secure alternative to Math.random().
 */
export const secureRandom = (): number => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // Divide by 2^32 to get a value between 0 and 1
    return array[0] / 0x100000000;
  }

  // Fallback to Math.random() only if crypto is not available.
  // In a production React Native environment (0.72+), crypto.getRandomValues should be available.
  return Math.random();
};

/**
 * Returns a random integer between min (inclusive) and max (exclusive).
 */
export const getSecureRandomInt = (min: number, max: number): number => {
  const range = max - min;
  return Math.floor(secureRandom() * range) + min;
};
