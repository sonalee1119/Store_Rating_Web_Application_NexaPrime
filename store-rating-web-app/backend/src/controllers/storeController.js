import { isValidRating } from '../utils/validators.js';
import {
  listStoresWithRatings,
  getStoreDetailsById,
  upsertStoreRating
} from '../services/dataStore.js';

export async function getStores(req, res) {
  try {
    const { search = '', category = '', sort = 'name' } = req.query || {};
    const stores = await listStoresWithRatings({
      search,
      category,
      sort,
      userId: req.user?._id
    });
    return res.json(stores);
  } catch {
    return res.status(500).json({ message: 'Could not load registered stores.' });
  }
}

export async function getStoreById(req, res) {
  try {
    const store = await getStoreDetailsById(req.params.id, req.user?._id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }
    return res.json(store);
  } catch {
    return res.status(500).json({ message: 'Could not load store details.' });
  }
}

export async function submitOrUpdateRating(req, res) {
  try {
    const { rating, comment = '' } = req.body || {};
    const numRating = Number(rating);

    if (!isValidRating(numRating)) {
      return res.status(400).json({
        message: 'Rating must be a whole number from 1 to 5.'
      });
    }

    const result = await upsertStoreRating({
      storeId: req.params.id,
      userId: req.user._id,
      rating: numRating,
      comment
    });

    if (result.notFound) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    return res.json({
      message: result.isUpdate
        ? 'Your store rating has been updated.'
        : 'Your store rating has been submitted.',
      rating: result.rating,
      comment: result.comment,
      isUpdate: result.isUpdate,
      store: result.store
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Rating conflict detected. Please retry.' });
    }
    return res.status(500).json({ message: 'Could not save rating.' });
  }
}
