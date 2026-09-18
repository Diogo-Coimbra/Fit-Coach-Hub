import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fit-ai-tracker-jwt-secret-key-2026-super-secure';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Gera um token JWT com 30 dias de validade para o utilizador
 */
export function generateToken(user: { id: string; email: string; role: Role | string; name?: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Middleware que valida o JWT no cabeçalho Authorization: Bearer <token>
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado: token JWT em falta.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

/**
 * Middleware que garante que o utilizador autenticado tem a role COACH (Personal Trainer)
 */
export function requireCoach(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'COACH') {
    return res.status(403).json({ error: 'Acesso reservado exclusivamente a Personal Trainers (COACH).' });
  }
  next();
}
