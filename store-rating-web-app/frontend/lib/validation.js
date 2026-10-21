export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function getPasswordChecks(password = '') {
  const str = String(password || '');
  return {
    length: str.length >= 8 && str.length <= 16,
    uppercase: /[A-Z]/.test(str),
    special: /[^A-Za-z0-9]/.test(str)
  };
}

export function isPasswordValid(password = '') {
  const checks = getPasswordChecks(password);
  return checks.length && checks.uppercase && checks.special;
}
