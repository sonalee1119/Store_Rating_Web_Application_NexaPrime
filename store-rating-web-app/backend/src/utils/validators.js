/**
 * Validation utilities for User Registration, Login, Store Creation, and Ratings.
 * Follows the NexaPrime Coding Challenge validation rules while providing
 * clear, actionable error messages.
 */

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  return (
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function validateRegistrationInput({ name, email, address, password, role, storeName, storeAddress, strictNameLength = false }) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanAddress = typeof address === 'string' ? address.trim() : '';
  const cleanRole = role === 'owner' ? 'owner' : 'user';

  const minNameLen = strictNameLength ? 20 : 3;
  if (!cleanName || cleanName.length < minNameLen || cleanName.length > 60) {
    return {
      valid: false,
      message: strictNameLength
        ? 'Full name must be between 20 and 60 characters.'
        : 'Full name must be between 3 and 60 characters (20–60 characters recommended).'
    };
  }

  if (!isValidEmail(cleanEmail)) {
    return {
      valid: false,
      message: 'Please enter a valid email address (for example, name@domain.com).'
    };
  }

  if (!cleanAddress || cleanAddress.length > 400) {
    return {
      valid: false,
      message: 'Address is required and must be at most 400 characters.'
    };
  }

  if (!isValidPassword(password)) {
    return {
      valid: false,
      message: 'Password must be 8–16 characters and include at least one uppercase letter and one special character.'
    };
  }

  if (cleanRole === 'owner' && storeName !== undefined && String(storeName).trim().length > 0) {
    if (String(storeName).trim().length < 3 || String(storeName).trim().length > 100) {
      return {
        valid: false,
        message: 'Store name must be between 3 and 100 characters.'
      };
    }
    if (storeAddress && String(storeAddress).trim().length > 400) {
      return {
        valid: false,
        message: 'Store address must be at most 400 characters.'
      };
    }
  }

  return {
    valid: true,
    data: {
      name: cleanName,
      email: cleanEmail,
      address: cleanAddress,
      password,
      role: cleanRole,
      storeName: storeName ? String(storeName).trim() : '',
      storeAddress: storeAddress ? String(storeAddress).trim() : cleanAddress
    }
  };
}

export function isValidRating(rating) {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}
