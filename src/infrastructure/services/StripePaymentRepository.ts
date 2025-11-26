import { stripe } from '../config/stripe';
import { IPaymentRepository, CreatePaymentDTO } from '../../domain/repositories/IPaymentRepository';
import { AccountBalance } from '../../domain/entities/AccountBalance';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';
import Stripe from 'stripe';

export class StripePaymentRepository implements IPaymentRepository {
  
  private _toDomainBalance(stripeBalance: Stripe.Balance): AccountBalance {
    const availableAmount = stripeBalance.available[0]
      ? stripeBalance.available[0].amount / 100
      : 0;
    const pendingAmount = stripeBalance.pending[0]
      ? stripeBalance.pending[0].amount / 100
      : 0;
    const currency = stripeBalance.available[0]
      ? stripeBalance.available[0].currency
      : 'mxn';

    return new AccountBalance(availableAmount, pendingAmount, currency);
  }

  private _toDomainTransaction(tx: Stripe.BalanceTransaction): PaymentTransaction {
    return new PaymentTransaction(
      tx.id,
      tx.amount / 100,
      tx.currency,
      tx.description,
      tx.type,
      tx.status,
      new Date(tx.created * 1000)
    );
  }

  async getBalance(): Promise<AccountBalance> {
    try {
      const stripeBalance = await stripe.balance.retrieve();
      return this._toDomainBalance(stripeBalance);
    } catch (error) {
      console.error('Error en Stripe getBalance:', error);
      throw new Error('No se pudo obtener el balance desde Stripe');
    }
  }

  async getTransactionHistory(options: {
    limit: number;
    starting_after?: string;
  }): Promise<PaymentTransaction[]> {
    try {
      const params: Stripe.BalanceTransactionListParams = {
        limit: options.limit,
      };
      if (options.starting_after) {
        params.starting_after = options.starting_after;
      }
      const transactions = await stripe.balanceTransactions.list(params);
      
      // Mapeamos cada resultado a una instancia de nuestra Entidad
      return transactions.data.map((tx) => this._toDomainTransaction(tx));

    } catch (error) {
      console.error('Error en Stripe getTransactionHistory:', error);
      throw new Error('No se pudo obtener el historial desde Stripe');
    }
  }

  async createCheckoutSession(data: CreatePaymentDTO): Promise<{ url: string }> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: data.userEmail,
        line_items: [
          {
            price_data: {
              currency: data.currency,
              product_data: {
                name: 'Donación Voluntaria',
                description: data.description || 'Gracias por tu apoyo',
              },
              unit_amount: Math.round(data.amount * 100),
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          description: `Donación de ${data.userName}`,
          metadata: {
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail
          }
        },
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
      });

      if (!session.url) {
        throw new Error('Stripe no devolvió la URL de la sesión');
      }

      return { url: session.url };

    } catch (error) {
      console.error('Error creando Checkout Session:', error);
      throw new Error('No se pudo generar el link de pago');
    }
  }
}