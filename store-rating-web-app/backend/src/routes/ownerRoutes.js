import { createRouter } from '../utils/httpAdapter.js';
import { getOwnerDashboard, createOwnerStore } from '../controllers/ownerController.js';
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = createRouter();

router.use(authenticate, allowRoles('owner'));

router.get('/dashboard', getOwnerDashboard);
router.post('/stores', createOwnerStore);

export default router;
