import Stripe from 'stripe';
import dotenv from 'dotenv';

// Cargamos las variables de entorno (necesario si este archivo
// se importa antes que server.ts en algún contexto de prueba)
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY no está definida en .env');
  throw new Error('STRIPE_SECRET_KEY no está configurada');
}

// Inicializamos el cliente de Stripe
// Usamos la versión de API más reciente (o la que prefieras)
export const stripe = new Stripe(stripeSecretKey, {
  // --- CORRECCIÓN AQUÍ ---
  // Tu versión de la librería de Stripe espera esta versión de API exacta
  apiVersion: '2025-10-29.clover',
  // ---------------------
  typescript: true,
});

console.log('✅ Cliente de Stripe inicializado (en modo simulación).');