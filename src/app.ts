import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import paymentRoutes from './infrastructure/api/routes/PaymentRoutes';

const app: Express = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- INICIO DE LA MODIFICACIÓN ---
// Aquí irán nuestras rutas de pagos (AHORA EN INGLÉS)
app.use('/api/v1/payments', paymentRoutes);
// --- FIN DE LA MODIFICACIÓN ---

app.get('/', (_req: Request, res: Response) => {
  res.send('API de Pagos (Stripe) funcionando');
});

export default app;