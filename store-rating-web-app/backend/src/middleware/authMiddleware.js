import { verifyToken } from '../utils/cryptoAuth.js';
import { findUserById } from '../services/dataStore.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }
    const payload = verifyToken(token);
    const user = await findUserById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Account session not found. Please log in again.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session token. Please log in again.' });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}.`
      });
    }
    next();
  };
}
