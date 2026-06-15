/**
 * Validates that a string is a well-formed http/https URL.
 * Returns true/false.
 */
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

/**
 * Validates a custom alias: 3-20 chars, letters/numbers/hyphens/underscores only.
 */
const isValidAlias = (alias) => {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(alias);
};

// Reserved words that cannot be used as short codes / aliases
// because they collide with API routes.
const RESERVED_CODES = ['api', 'auth', 'login', 'signup', 'dashboard', 'admin', 'static'];

module.exports = { isValidUrl, isValidAlias, RESERVED_CODES };
