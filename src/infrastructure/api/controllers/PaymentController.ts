import { Request, Response } from 'express';
// Importamos los casos de uso listos para usarse desde nuestro archivo de dependencias
import {
  getBalanceUseCase,
  getTransactionHistoryUseCase,
} from '../dependencies/dependencies';

class PaymentController {
  /**
   * Maneja la solicitud para obtener el balance.
   */
  async getBalance(req: Request, res: Response) {
    try {
      // Llama al caso de uso
      const balance = await getBalanceUseCase.execute();
      // Responde con el balance en formato JSON
      res.status(200).json({ success: true, data: balance });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error al obtener el balance',
        error: errorMessage,
      });
    }
  }

  /**
   * Maneja la solicitud para obtener el historial de transacciones.
   */
  async getTransactionHistory(req: Request, res: Response) {
    try {
      // --- Manejo de Paginación (Query Params) ---
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const starting_after = req.query.starting_after as string | undefined;

      // --- INICIO DE LA CORRECCIÓN ---
      // Vamos a construir las opciones dinámicamente para
      // que TypeScript esté 100% seguro.

      // 1. Definimos el tipo de las opciones que espera el caso de uso
      type UseCaseOptions = {
        limit: number;
        starting_after?: string; // Nota el '?'
      };

      // 2. Creamos el objeto base
      const options: UseCaseOptions = {
        limit: limit,
      };

      // 3. SOLO si 'starting_after' existe, lo añadimos al objeto
      if (starting_after) {
        options.starting_after = starting_after;
      }
      // --- FIN DE LA CORRECCIÓN ---

      // Llama al caso de uso con las opciones de paginación
      // Ahora 'options' SÍ coincide con lo que el caso de uso espera
      const transactions = await getTransactionHistoryUseCase.execute(options);

      // Responde con las transacciones en formato JSON
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Error al obtener el historial de transacciones',
        error: errorMessage,
      });
    }
  }
} // <-- ESTA ES LA LLAVE QUE CIERRA la 'class PaymentController'.
  //     (Probablemente se borró en tu editor)

// Exportamos una única instancia del controlador
export default new PaymentController();