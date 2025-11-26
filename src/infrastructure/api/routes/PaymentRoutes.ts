import { Router } from 'express';
import { paymentController } from '../dependencies/dependencies';
import { requireAuth } from '../../../middleware/require-auth';
import { requireRole } from '../../../middleware/require-role';

const router = Router();
const ROLE_ADMIN_COCINA = 'admin de cocina';

router.get(
  '/balance',
  requireRole(ROLE_ADMIN_COCINA),
  paymentController.getBalance 
);

router.get(
  '/history',
  requireRole(ROLE_ADMIN_COCINA),
  paymentController.getTransactionHistory
);

router.post(
  '/create-intent',
  requireAuth,
  paymentController.createPayment
);

export default router;