import { stripe } from '../config/stripe';
import {
  Balance,
  IPaymentRepository,
  Transaction,
} from '../../domain/repositories/IPaymentRepository';
import Stripe from 'stripe';

// Esta clase "implementa" el contrato de IPaymentRepository
export class StripePaymentRepository implements IPaymentRepository {
  /**
   * Mapea la respuesta de Stripe a nuestra entidad de Dominio 'Balance'.
   * Esto es igual que tu método _toDomain en SequelizeKitchenRepository.
   */
  private _toDomainBalance(stripeBalance: Stripe.Balance): Balance {
    // Stripe devuelve montos en centavos (ej. 12450)
    // Lo convertimos a pesos (ej. 124.50)
    const availableAmount = stripeBalance.available[0]
      ? stripeBalance.available[0].amount / 100
      : 0;
    const pendingAmount = stripeBalance.pending[0]
      ? stripeBalance.pending[0].amount / 100
      : 0;

    return {
      available: availableAmount,
      pending: pendingAmount,
      currency: stripeBalance.available[0]
        ? stripeBalance.available[0].currency
        : 'mxn',
    };
  }

  /**
   * Mapea una Transacción de Stripe a nuestra entidad 'Transaction'.
   */
  private _toDomainTransaction(
    tx: Stripe.BalanceTransaction
  ): Transaction {
    // Stripe devuelve montos en centavos (ej. -3550)
    // Lo convertimos a pesos (ej. -35.50)
    return {
      id: tx.id,
      amount: tx.amount / 100, // Convertir de centavos
      currency: tx.currency,
      description: tx.description,
      type: tx.type,
      status: tx.status,
      created: new Date(tx.created * 1000), // Convertir de timestamp de Unix
    };
  }

  // --- Implementación de los métodos del contrato ---

  async getBalance(): Promise<Balance> {
    try {
      // 1. Llamada real a la API de Stripe
      const stripeBalance = await stripe.balance.retrieve();
      // 2. Mapear la respuesta a nuestra entidad de Dominio
      return this._toDomainBalance(stripeBalance);
    } catch (error) {
      console.error('Error en Stripe getBalance:', error);
      throw new Error('No se pudo obtener el balance desde Stripe');
    }
  }

  async getTransactionHistory(options: {
  limit: number;
  starting_after?: string;
}): Promise<Transaction[]> {
  try {
    // --- INICIO DE LA CORRECCIÓN ---

    // 1. Preparamos los parámetros de forma segura para Stripe
    // Le decimos a TypeScript que este objeto será del tipo que Stripe espera
    const params: Stripe.BalanceTransactionListParams = {
      limit: options.limit,
    };

    // 2. SOLO añadimos 'starting_after' si realmente tiene un valor
    if (options.starting_after) {
      params.starting_after = options.starting_after;
    }

    // --- FIN DE LA CORRECCIÓN ---

    // 3. Llamada real a la API de Stripe con los parámetros correctos
    const transactions = await stripe.balanceTransactions.list(params);

    // 4. Mapear la lista de transacciones
    return transactions.data.map(this._toDomainTransaction);

  } catch (error) {
    console.error('Error en Stripe getTransactionHistory:', error);
    throw new Error('No se pudo obtener el historial desde Stripe');
  }
}
}