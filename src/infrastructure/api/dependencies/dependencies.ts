import { StripePaymentRepository } from '../../services/StripePaymentRepository';
import { GetBalanceUseCase } from '../../../application/use-cases/GetBalanceUseCase';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/GetTransactionHistoryUseCase';
import { CreatePaymentUseCase } from '../../../application/use-cases/CreatePaymentUseCase';
import { PaymentController } from '../controllers/PaymentController'; 


const paymentRepository = new StripePaymentRepository();

const getBalanceUseCase = new GetBalanceUseCase(paymentRepository);
const getTransactionHistoryUseCase = new GetTransactionHistoryUseCase(paymentRepository);
const createPaymentUseCase = new CreatePaymentUseCase(paymentRepository);

const paymentController = new PaymentController(
  getBalanceUseCase,
  getTransactionHistoryUseCase,
  createPaymentUseCase
);

export { paymentController };