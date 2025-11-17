import { IPaymentRepository } from '../../domain/repositories/IPaymentRepository';

// Definimos los parámetros que acepta este caso de uso
interface GetTransactionHistoryOptions {
  page?: number;
  limit?: number;
  starting_after?: string; // Para la paginación de Stripe
}

export class GetTransactionHistoryUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(options: GetTransactionHistoryOptions = {}) {
  // Lógica de negocio para la paginación
  const limit = options.limit || 10; // Valor por defecto

  // --- INICIO DE LA CORRECCIÓN ---
  // 1. Creamos un objeto de opciones para el repositorio
  const repoOptions: { limit: number; starting_after?: string } = {
    limit: limit,
  };

  // 2. Si 'starting_after' existe en las opciones, lo añadimos
  if (options.starting_after) {
    repoOptions.starting_after = options.starting_after;
  }
  // --- FIN DE LA CORRECCIÓN ---

  // Llamamos al repositorio con las opciones limpias y seguras
  const transactions = await this.paymentRepository.getTransactionHistory(
    repoOptions
  );

  return transactions;
}
}