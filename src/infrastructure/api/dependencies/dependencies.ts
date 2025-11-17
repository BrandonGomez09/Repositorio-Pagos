import { StripePaymentRepository } from '../../services/StripePaymentRepository';
import { GetBalanceUseCase } from '../../../application/use-cases/GetBalanceUseCase';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/GetTransactionHistoryUseCase';

// --- 1. Creamos la Instancia de la Infraestructura ---
// Esta es la única instancia de nuestro repositorio de Stripe.
const paymentRepository = new StripePaymentRepository();

// --- 2. Creamos las Instancias de los Casos de Uso ---
// "Inyectamos" el repositorio en los constructores de los casos de uso.

const getBalanceUseCase = new GetBalanceUseCase(paymentRepository);

const getTransactionHistoryUseCase = new GetTransactionHistoryUseCase(
  paymentRepository
);

// --- 3. Exportamos los Casos de Uso listos para usarse ---
export { getBalanceUseCase, getTransactionHistoryUseCase };