// Esta interfaz define las reglas que CUALQUIER repositorio de pagos debe seguir.
// No importa si usamos Stripe, PayPal o Sequelize, debe implementar esto.

export interface IPaymentRepository {
  /**
   * Obtiene el balance disponible actual de la cuenta.
   */
  getBalance(): Promise<Balance>;

  /**
   * Obtiene una lista paginada del historial de transacciones.
   */
  getTransactionHistory(options: {
    limit: number;
    starting_after?: string; // ID para paginación de Stripe
  }): Promise<Transaction[]>;
}

// --- Interfaces del Dominio ---
// También definimos las "Entidades" (los tipos de datos) que usará nuestra app.

export interface Balance {
  available: number;
  pending: number;
  currency: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  type: string;
  status: string;
  created: Date;
}