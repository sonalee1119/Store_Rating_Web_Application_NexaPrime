import { getOwnerDashboardData, createStore } from '../services/dataStore.js';

export async function getOwnerDashboard(req, res) {
  try {
    const data = await getOwnerDashboardData(req.user._id);
    return res.json(data);
  } catch {
    return res.status(500).json({ message: 'Could not load store owner dashboard.' });
  }
}

export async function createOwnerStore(req, res) {
  try {
    const { name, category = 'Retail & Essentials', address } = req.body || {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanAddress = typeof address === 'string' ? address.trim() : '';

    if (cleanName.length < 3 || cleanName.length > 100) {
      return res.status(400).json({ message: 'Store name must be between 3 and 100 characters.' });
    }
    if (!cleanAddress || cleanAddress.length > 400) {
      return res.status(400).json({ message: 'Store address is required and must be under 400 characters.' });
    }

    const created = await createStore({
      name: cleanName,
      category: String(category || 'Retail & Essentials').trim(),
      address: cleanAddress,
      ownerId: req.user._id
    });

    return res.status(201).json({
      message: 'Store registered successfully.',
      store: {
        id: String(created._id),
        name: created.name,
        category: created.category,
        address: created.address
      }
    });
  } catch {
    return res.status(500).json({ message: 'Could not register new store.' });
  }
}
