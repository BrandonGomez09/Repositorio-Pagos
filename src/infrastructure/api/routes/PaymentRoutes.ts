import { Router } from 'express';
import controller from '../controllers/PaymentController';

// --- INICIO DE LA MODIFICACIÓN ---
import { requireAuth } from '../../../middleware/require-auth';
import { requireRole } from '../../../middleware/require-role';
// --- FIN DE LA MODIFICACIÓN ---

const router = Router();

// El rol exacto que tu compañero mencionó
const ROLE_ADMIN_COCINA = 'admin de cocina';

/**
 * @route GET /payments/balance
 * @desc Obtiene el balance disponible y pendiente.
 * @access Private (Solo para 'admin de cocina')
 */
router.get(
  '/balance',
  requireRole(ROLE_ADMIN_COCINA), // Primero verifica el rol
  controller.getBalance
);

/**
 * @route GET /payments/history
 * @desc Obtiene el historial de movimientos.
 * @access Private (Solo para 'admin de cocina')
 */
router.get(
  '/history',
  requireRole(ROLE_ADMIN_COCINA), // Primero verifica el rol
  controller.getTransactionHistory
);

export default router;