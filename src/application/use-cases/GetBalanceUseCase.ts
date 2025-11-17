import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';

export class GetBalanceUseCase {
  // Usamos 'private readonly' como atajo de TypeScript
  // para declarar e inicializar el repositorio
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute() {
    // La lógica del caso de uso:
    // 1. Llama al método del repositorio (el 'contrato')
    // 2. El repositorio (que será de Stripe) se encargará de los detalles.
    const balance = await this.paymentRepository.getBalance();

    // 3. Devuelve el balance.
    return balance;
  }
}