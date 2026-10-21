import { hashPassword, verifyPassword, signToken } from '../utils/cryptoAuth.js';
import { validateRegistrationInput, isValidEmail } from '../utils/validators.js';
import {
  findUserByEmail,
  createUser,
  createStore
} from '../services/dataStore.js';

export async function registerUser(req, res) {
  try {
    const validation = validateRegistrationInput(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { name, email, address, password, role, storeName, storeAddress } = validation.data;
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email address is already registered.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      name,
      email,
      address,
      passwordHash,
      role
    });

    // If registering as a store owner, automatically create their initial store
    let createdStore = null;
    if (role === 'owner') {
      const initialStoreName = storeName || `${name.split(' ')[0]}'s Registered Store`;
      createdStore = await createStore({
        name: initialStoreName,
        category: req.body?.storeCategory || 'Retail & Essentials',
        address: storeAddress || address,
        ownerId: user._id
      });
    }

    const token = signToken({ id: String(user._id), role: user.role });
    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      },
      store: createdStore
        ? {
            id: String(createdStore._id),
            name: createdStore.name,
            address: createdStore.address
          }
        : null
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email address is already registered.' });
    }
    return res.status(500).json({ message: 'Could not complete registration. Please try again.' });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').toLowerCase().trim();

    if (!isValidEmail(cleanEmail) || !password) {
      return res.status(400).json({ message: 'Please enter a valid email address and password.' });
    }

    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const valid = await verifyPassword(String(password), user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken({ id: String(user._id), role: user.role });
    return res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch {
    return res.status(500).json({ message: 'Could not complete login. Please try again.' });
  }
}

export async function getCurrentUser(req, res) {
  return res.json({
    user: {
      id: String(req.user._id),
      name: req.user.name,
      email: req.user.email,
      address: req.user.address,
      role: req.user.role
    }
  });
}
