import dotenv from 'dotenv';
dotenv.config(); // Carga las variables de .env al inicio

import app from './app';

const PORT = process.env.PORT || 3005; // Usamos un puerto diferente (ej. 3005)

async function startServer() {
  try {
    console.log('🚀 Iniciando Servidor de Pagos...');

    // --- Conexión a Servicios Externos ---
    // A diferencia de 'Kitchens', no nos conectamos a PostgreSQL[cite: 24].
    // Nos conectaremos a Stripe, pero lo haremos "bajo demanda"
    // en nuestro repositorio, no aquí.

    app.listen(PORT, () => {
      console.log(`🌐 Servidor corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();