import { Request, Response } from 'express';
import { GetBalanceUseCase } from '../../../application/use-cases/GetBalanceUseCase';
import { GetTransactionHistoryUseCase } from '../../../application/use-cases/GetTransactionHistoryUseCase';
import { CreatePaymentUseCase } from '../../../application/use-cases/CreatePaymentUseCase';
import { AuthServiceAdapter } from '../../adapters/AuthServiceAdapter';
// 1. Importamos el nuevo adaptador
import { KitchenServiceAdapter } from '../../adapters/KitchenServiceAdapter';

export class PaymentController {
  private authAdapter: AuthServiceAdapter;
  private kitchenAdapter: KitchenServiceAdapter; // Propiedad nueva

  constructor(
    private readonly getBalanceUseCase: GetBalanceUseCase,
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
    private readonly createPaymentUseCase: CreatePaymentUseCase
  ) {
    this.authAdapter = new AuthServiceAdapter();
    this.kitchenAdapter = new KitchenServiceAdapter(); // Inicializamos
  }

  private formatTransaction(tx: any) {
    const statusMap: Record<string, string> = {
      'succeeded': 'Exitoso ✅',
      'requires_payment_method': 'Pendiente ⏳',
      'canceled': 'Cancelado ❌',
      'processing': 'Procesando 🔄'
    };

    return {
      id: tx.id,
      monto: `$${tx.amount.toFixed(2)} ${tx.currency.toUpperCase()}`,
      
      donador: {
        names: tx.donorNames || 'Anónimo',
        firstLastName: tx.donorFirstLastName || '',
        secondLastName: tx.donorSecondLastName || '',
        email: tx.donorEmail || '',
        phoneNumber: tx.donorPhone || ''
      },
      
      concepto: "Donación Voluntaria",
      estado: statusMap[tx.status] || tx.status,
      fecha: tx.created.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
      tipo: 'Donación'
    };
  }

  // --- HELPER PARA OBTENER KITCHEN ID ---
  private async resolveKitchenId(user: any, token: string): Promise<string | undefined> {
    // 1. Si el token ya lo trae (futuro), úsalo
    if (user?.kitchenId) return user.kitchenId;

    // 2. Si es Admin de Cocina, preguntar a Kitchen Service
    if (user?.roles?.includes('Admin_cocina')) {
      console.log('🔍 Buscando ID de cocina en microservicio Kitchen...');
      const remoteId = await this.kitchenAdapter.getMyKitchenId(token);
      if (remoteId) {
        console.log(`✅ Cocina encontrada: ID ${remoteId}`);
        return remoteId;
      }
    }

    // 3. Si es Super Admin, devuelve undefined (para ver todo)
    return undefined;
  }

  getBalance = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const token = req.headers.authorization || '';

      // Usamos la lógica inteligente para obtener el ID
      const kitchenId = await this.resolveKitchenId(user, token);

      const balance = await this.getBalanceUseCase.execute(kitchenId);
      
      res.status(200).json({ 
        success: true, 
        mensaje: kitchenId ? `Balance calculado para cocina ID: ${kitchenId}` : 'Balance Global (SuperAdmin)',
        data: balance 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: 'Error al obtener el balance', error: errorMessage });
    }
  };

  getTransactionHistory = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const starting_after = req.query.starting_after as string | undefined;
      
      const user = req.user;
      const token = req.headers.authorization || '';
      
      // Usamos la lógica inteligente para obtener el ID
      const kitchenId = await this.resolveKitchenId(user, token);

      const options: any = { limit, kitchenId: kitchenId };
      if (starting_after) options.starting_after = starting_after;

      const transactions = await this.getTransactionHistoryUseCase.execute(options);
      const datosBonitos = transactions.map(this.formatTransaction);

      res.status(200).json({ 
        success: true, 
        mensaje: kitchenId ? `Historial filtrado para cocina ID: ${kitchenId}` : 'Historial Global (SuperAdmin)',
        data: datosBonitos 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: 'Error historial', error: errorMessage });
    }
  };

  createPayment = async (req: Request, res: Response) => {
    try {
      const { amount, currency, description } = req.body;
      const { kitchenId } = req.params;
      const user = req.user;
      const rawToken = req.headers.authorization?.replace('Bearer ', '') || '';

      if (!user) return res.status(401).json({ success: false, message: 'No identificado.' });
      if (!kitchenId) return res.status(400).json({ success: false, message: 'Falta ID cocina.' });

      const userData = await this.authAdapter.getUserData(user.userId.toString(), rawToken);

      const result = await this.createPaymentUseCase.execute({
        amount: Number(amount),
        currency: currency || 'mxn',
        userId: user.userId.toString(),
        kitchenId: kitchenId.toString(),
        
        donorNames: userData?.names || 'Anónimo',
        donorFirstLastName: userData?.firstLastName || '',
        donorSecondLastName: userData?.secondLastName || '',
        donorEmail: userData?.email || user.email,
        donorPhone: userData?.phoneNumber || '',
        
        userEmail: user.email,
        userName: userData ? `${userData.names} ${userData.firstLastName}` : 'Voluntario',
        
        description: description,
        successUrl: 'https://google.com?status=success',
        cancelUrl: 'https://google.com?status=cancel'
      });

      res.status(201).json({ success: true, data: result });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: 'Error creando pago', error: errorMessage });
    }
  };
}