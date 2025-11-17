import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Esta interfaz define cómo se ve tu "payload" de usuario
// Lo basé en los campos de tu archivo original [cite: 155-157]
interface UserPayload {
  userId: number;
  email: string;
  roles: string[];
  stateId?: number | null;
  municipalityId?: number | null;
  // Añade aquí cualquier otro campo que venga en tu JWT
}

// --- ESTO ES MAGIA DE TYPESCRIPT ---
// Le decimos a TypeScript que el objeto 'Request' de Express
// puede tener una propiedad 'user' que nosotros definimos.
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
// ----------------------------------

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res
      .status(401)
      .json({ success: false, message: 'Missing Authorization header' });
  }

  const token = header.replace('Bearer ', '');
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET no está definida en .env');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as UserPayload;

    // Adjuntamos el payload del usuario al objeto 'req'
    req.user = decoded;

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res
      .status(401)
      .json({ success: false, message: 'Invalid token', error: errorMessage });
  }
}