import { createRouter } from '../utils/httpAdapter.js';
import {
  getStores,
  getStoreById,
  submitOrUpdateRating
} from '../controllers/storeController.js';
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = createRouter();

router.use(authenticate);

// Both normal users and store owners can browse registered stores
router.get('/', allowRoles('user', 'owner'), getStores);
router.get('/:id', allowRoles('user', 'owner'), getStoreById);

// Submitting or updating a store rating
router.post('/:id/ratings', allowRoles('user', 'owner'), submitOrUpdateRating);
router.put('/:id/ratings', allowRoles('user', 'owner'), submitOrUpdateRating);

export default router;
