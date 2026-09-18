import 'dotenv/config'; 
import express, { Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  authenticateToken,
  requireCoach,
  generateToken,
  AuthenticatedRequest,
} from './auth';
import { saveUploadedImage, uploadsDir } from './storage';
import { extractAndParseJson } from './aiUtils';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(
  express.json({
    limit: '50mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Diretório estático para servir ficheiros e imagens públicas (fotos de perfil, refeições)
app.use('/uploads', express.static(uploadsDir));

// Registo de pedidos para auditoria e depuração
app.use((req, res, next) => {
  console.log(`\n[${req.method}] ${req.url}`);
  next();
});

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const googleClient = new OAuth2Client();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

console.log("Base de dados conectada:", process.env.DATABASE_URL ? "Sim" : "Não");
console.log("Stripe integrado:", stripe ? "Sim (Live/Test Key)" : "Não (Modo Simulação Dev)");

// Helper para gerar código de convite seguro (ex: PT-7K2X)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PT-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper para extrair string limpa de req.params ou req.query no Express 5
function toStr(val: any): string {
  if (Array.isArray(val)) return val[0] || '';
  return typeof val === 'string' ? val : (val ? String(val) : '');
}

// Helper para calcular info do período de testes e subscrição (PT SaaS)
function getTrialInfo(user: { role: Role; trialEndsAt: Date | null; subscriptionStatus: string | null }) {
  if (user.role !== 'COACH') return null;
  const now = new Date();
  const endsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const daysLeft = endsAt ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const isSubscribed = user.subscriptionStatus === 'active';
  const isExpired = isSubscribed ? false : (endsAt ? now > endsAt : true);
  return {
    trialEndsAt: endsAt,
    daysLeft,
    isExpired,
    isSubscribed,
    status: user.subscriptionStatus || (isExpired ? 'expired' : 'trialing'),
  };
}

// Helper para verificar se um PT tem subscrição/trial ativo
async function hasActiveCoachAccess(userId: string): Promise<boolean> {
  const coach = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true, subscriptionStatus: true },
  });
  if (!coach) return false;
  const now = new Date();
  const isTrialActive = coach.trialEndsAt ? new Date(coach.trialEndsAt) > now : false;
  const isSubscribed = coach.subscriptionStatus === 'active';
  return isTrialActive || isSubscribed;
}

// Helper para verificar se um PT é treinador de um cliente
async function isCoachOfClient(coachId: string, clientId: string): Promise<boolean> {
  const relation = await prisma.coachClient.findUnique({
    where: {
      coachId_clientId: { coachId, clientId },
    },
  });
  return !!relation;
}

// Middleware: Garante que o treinador tem perfil ativo e subscrição/trial válidos
async function requireActiveCoach(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'COACH') {
    return res.status(403).json({ error: 'Acesso reservado exclusivamente a Personal Trainers.' });
  }

  try {
    const isAllowed = await hasActiveCoachAccess(req.user.id);
    if (!isAllowed) {
      return res.status(403).json({
        error: 'O seu período de avaliação terminou. Por favor regularize a sua subscrição para continuar a utilizar as funcionalidades de Personal Trainer.',
        isExpired: true,
        subscriptionRequired: true,
      });
    }

    next();
  } catch (error) {
    console.error('Erro na validação da subscrição de treinador:', error);
    res.status(500).json({ error: 'Erro interno ao validar subscrição.' });
  }
}

// Helper para validar permissão sobre um treino (Dono ou o seu Treinador)
async function canAccessWorkout(callerId: string, callerRole: Role, workoutId: string): Promise<boolean> {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    select: { userId: true, assignedById: true },
  });
  if (!workout) return false;
  if (workout.userId === callerId) return true;
  if (callerRole === 'COACH' && (await isCoachOfClient(callerId, workout.userId))) return true;
  return false;
}

// Helper para validar permissão sobre um exercício (Dono do treino ou o seu Treinador)
async function canAccessExercise(callerId: string, callerRole: Role, exerciseId: string): Promise<{ allowed: boolean; workoutId?: string }> {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { workoutId: true, workout: { select: { userId: true } } },
  });
  if (!exercise) return { allowed: false };
  if (exercise.workout.userId === callerId) return { allowed: true, workoutId: exercise.workoutId };
  if (callerRole === 'COACH' && (await isCoachOfClient(callerId, exercise.workout.userId))) {
    return { allowed: true, workoutId: exercise.workoutId };
  }
  return { allowed: false };
}

// Endpoint para upload seguro de imagens (fotos de perfil, refeições, etc.)
app.post('/api/uploads', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Dados da imagem em base64 não fornecidos.' });
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol || 'http';

    const result = await saveUploadedImage(imageBase64, host, protocol);
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro no upload de ficheiro:', error);
    res.status(500).json({ error: 'Não foi possível guardar a imagem.' });
  }
});

// ==========================================
// ROTAS DE AUTENTICAÇÃO (AUTH & JWT)
// ==========================================

// Autenticação Google com devolução de JWT { user, token }
app.post('/api/auth/google', async (req, res) => {
  console.log("📦 Body Recebido do Frontend:", req.body);
  const { token, role } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Nenhum token fornecido!' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: 'Erro Google' });

    const selectedRole: Role = role === 'COACH' ? 'COACH' : 'CLIENT';
    const trialEndsAt = selectedRole === 'COACH' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;

    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {},
      create: {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        role: selectedRole,
        trialEndsAt: trialEndsAt,
      },
    });

    const jwtToken = generateToken(user);

    console.log(`✅ Utilizador autenticado: ${user.name} (${user.role})`);
    res.status(200).json({
      message: 'Sucesso!',
      user,
      token: jwtToken,
      trial: getTrialInfo(user),
    });

  } catch (error) {
    console.error("Erro na autenticação:", error);
    res.status(401).json({ error: 'Token inválido!' });
  }
});

// Login de Desenvolvimento (Dev Login) para testes rápidos sem depender de Google OAuth
app.post('/api/auth/dev-login', async (req, res) => {
  try {
    const { role = 'COACH' } = req.body;
    const targetRole: Role = role === 'CLIENT' ? 'CLIENT' : 'COACH';
    const email = targetRole === 'COACH' ? 'coach.demo@fit.ai' : 'client.demo@fit.ai';
    const name = targetRole === 'COACH' ? 'Treinador Demo' : 'Cliente Demo';

    const trialEndsAt = targetRole === 'COACH' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;

    const user = await prisma.user.upsert({
      where: { email },
      update: { role: targetRole },
      create: {
        email,
        name,
        role: targetRole,
        trialEndsAt,
        weeklyGoal: 4,
      },
    });

    const jwtToken = generateToken(user);
    console.log(`🧪 Dev Login realizado: ${user.name} (${user.role})`);

    res.status(200).json({
      message: 'Dev login com sucesso!',
      user,
      token: jwtToken,
      trial: getTrialInfo(user),
    });
  } catch (error) {
    console.error('❌ Erro no dev-login:', error);
    res.status(500).json({ error: 'Erro no dev login.' });
  }
});

// Obter dados da sessão atual do utilizador autenticado
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        coaches: {
          include: {
            coach: {
              select: { id: true, name: true, email: true, picture: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const assignedCoach = user.coaches.length > 0 ? user.coaches[0].coach : null;

    res.status(200).json({
      user,
      coach: assignedCoach,
      trial: getTrialInfo(user),
    });
  } catch (error) {
    console.error('❌ Erro no /api/auth/me:', error);
    res.status(500).json({ error: 'Erro ao obter dados do utilizador.' });
  }
});

// Alternar papel entre COACH e CLIENT (restrito a ambiente de desenvolvimento para segurança do SaaS)
app.post('/api/auth/switch-role', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'A alteração para o perfil de Personal Trainer requer ativação de subscrição comercial.',
      });
    }

    const userId = req.user!.id;
    const { targetRole } = req.body;

    const newRole: Role = targetRole === 'COACH' ? 'COACH' : 'CLIENT';
    const trialEndsAt = newRole === 'COACH' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        ...(trialEndsAt ? { trialEndsAt } : {}),
      },
    });

    const newToken = generateToken(updatedUser);

    console.log(`Utilizador ${updatedUser.name} mudou para o papel: ${newRole}`);
    res.status(200).json({
      message: 'Papel atualizado com sucesso.',
      user: updatedUser,
      token: newToken,
      trial: getTrialInfo(updatedUser),
    });
  } catch (error) {
    console.error('Erro ao alternar papel:', error);
    res.status(500).json({ error: 'Erro ao alternar papel do utilizador.' });
  }
});

// ==========================================
// ROTAS DE PERSONAL TRAINER (COACH API)
// ==========================================

// Criar convite de cliente (PT gera código seguro com validade)
app.post('/api/coach/invites', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;
    const { clientEmail } = req.body;

    // Gerar código único
    let code = generateInviteCode();
    let existing = await prisma.coachInvite.findUnique({ where: { code } });
    while (existing) {
      code = generateInviteCode();
      existing = await prisma.coachInvite.findUnique({ where: { code } });
    }

    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dias de validade

    const invite = await prisma.coachInvite.create({
      data: {
        code,
        coachId,
        clientEmail: clientEmail || null,
        expiresAt,
      },
      include: {
        coach: { select: { id: true, name: true } },
      },
    });

    console.log(`Convite gerado por ${req.user!.name || coachId}: Código ${code}`);
    res.status(201).json(invite);
  } catch (error) {
    console.error('Erro ao criar convite:', error);
    res.status(500).json({ error: 'Erro ao criar convite.' });
  }
});

// Cliente aceita convite usando o código do PT
app.post('/api/coach/accept-invite', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientId = req.user!.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'O código do convite é obrigatório.' });
    }

    const invite = await prisma.coachInvite.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { coach: true },
    });

    if (!invite) {
      return res.status(404).json({ error: 'Código de convite inválido ou inexistente.' });
    }

    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ error: 'Este código de convite já expirou.' });
    }

    if (invite.coachId === clientId) {
      return res.status(400).json({ error: 'Não te podes convidar a ti próprio!' });
    }

    // Associar Cliente ao PT
    const coachClient = await prisma.coachClient.upsert({
      where: {
        coachId_clientId: {
          coachId: invite.coachId,
          clientId: clientId,
        },
      },
      update: {},
      create: {
        coachId: invite.coachId,
        clientId: clientId,
      },
    });

    // Atualizar status do convite
    await prisma.coachInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    });

    console.log(`🤝 Cliente ${clientId} associado com sucesso ao PT ${invite.coach.name}!`);
    res.status(200).json({
      message: `Associado com sucesso ao treinador ${invite.coach.name}!`,
      coach: {
        id: invite.coach.id,
        name: invite.coach.name,
        email: invite.coach.email,
        picture: invite.coach.picture,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao aceitar convite:', error);
    res.status(500).json({ error: 'Erro ao aceitar convite.' });
  }
});

// Listar todos os clientes de um Personal Trainer
app.get('/api/coach/clients', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;

    // Obter os clientes do PT
    const relations = await prisma.coachClient.findMany({
      where: { coachId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            weeklyGoal: true,
            currentStreak: true,
            createdAt: true,
            workouts: {
              where: { assignedById: coachId },
              select: { id: true, name: true },
            },
            logs: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: { id: true, createdAt: true, durationMinutes: true },
            },
            bodyMetrics: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { weight: true, createdAt: true },
            },
            meals: {
              where: {
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              select: { id: true, name: true, calories: true, imageUri: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular estatísticas da semana e alertas de retenção para cada cliente
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const clientsWithStats = relations.map((r) => {
      const c = r.client;
      const weeklyLogs = c.logs.filter((l) => new Date(l.createdAt) >= monday).length;
      const lastWorkout = c.logs[0] ? new Date(c.logs[0].createdAt) : null;
      let daysSinceLastWorkout: number | null = null;
      let retentionStatus: 'active' | 'warning' | 'at_risk' = 'at_risk';

      if (lastWorkout) {
        daysSinceLastWorkout = Math.max(0, Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)));
        if (daysSinceLastWorkout <= 3) {
          retentionStatus = 'active';
        } else if (daysSinceLastWorkout <= 6) {
          retentionStatus = 'warning';
        } else {
          retentionStatus = 'at_risk';
        }
      }

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        picture: c.picture,
        weeklyGoal: c.weeklyGoal,
        currentStreak: c.currentStreak,
        joinedAt: r.createdAt,
        assignedWorkoutsCount: c.workouts.length,
        weeklyWorkoutsCount: weeklyLogs,
        latestWeight: c.bodyMetrics[0]?.weight || null,
        lastWorkoutDate: lastWorkout ? lastWorkout.toISOString() : null,
        daysSinceLastWorkout,
        retentionStatus,
        weeklyGoalMet: weeklyLogs >= c.weeklyGoal,
        todayMealsCount: c.meals.length,
      };
    });

    res.status(200).json(clientsWithStats);
  } catch (error) {
    console.error('Erro ao listar clientes do PT:', error);
    res.status(500).json({ error: 'Erro ao listar clientes.' });
  }
});

// Atualizar metas do aluno pelo Treinador (Nutrição & Frequência de Treino)
app.put('/api/coach/clients/:clientId/goals', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;
    const clientId = toStr(req.params.clientId);
    const { dailyCalories, dailyProtein, dailyCarbs, dailyFat, weeklyGoal } = req.body;

    const isAuthorized = await isCoachOfClient(coachId, clientId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Este aluno não está associado à sua conta de treinador.' });
    }

    const updated = await prisma.user.update({
      where: { id: clientId },
      data: {
        ...(dailyCalories !== undefined ? { dailyCalories: Number(dailyCalories) } : {}),
        ...(dailyProtein !== undefined ? { dailyProtein: Number(dailyProtein) } : {}),
        ...(dailyCarbs !== undefined ? { dailyCarbs: Number(dailyCarbs) } : {}),
        ...(dailyFat !== undefined ? { dailyFat: Number(dailyFat) } : {}),
        ...(weeklyGoal !== undefined ? { weeklyGoal: Math.max(1, Number(weeklyGoal)) } : {}),
      },
      select: {
        id: true,
        name: true,
        dailyCalories: true,
        dailyProtein: true,
        dailyCarbs: true,
        dailyFat: true,
        weeklyGoal: true,
      },
    });

    console.log(`Metas do aluno ${clientId} atualizadas pelo treinador ${coachId}`);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Erro ao atualizar metas do aluno:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar metas do aluno.' });
  }
});

// Listar templates de treino do Personal Trainer
app.get('/api/coach/templates', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;

    const templates = await prisma.workout.findMany({
      where: {
        userId: coachId,
        isTemplate: true,
      },
      include: {
        exercises: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(templates);
  } catch (error) {
    console.error('Erro ao obter templates do treinador:', error);
    res.status(500).json({ error: 'Erro interno ao obter templates.' });
  }
});

// Criar um novo template de treino reutilizável
app.post('/api/coach/templates', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;
    const { name, description, category, exercises } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'O nome do modelo de treino é obrigatório.' });
    }

    const template = await prisma.workout.create({
      data: {
        name,
        description: description || null,
        category: category || null,
        userId: coachId,
        isTemplate: true,
        exercises: exercises && exercises.length > 0 ? {
          create: exercises.map((ex: any) => ({
            name: ex.name,
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 10,
            weight: ex.weight ? Number(ex.weight) : null,
            restSeconds: Number(ex.restSeconds) || 90,
            notes: ex.notes ? String(ex.notes).trim() : null,
          })),
        } : undefined,
      },
      include: { exercises: true },
    });

    console.log(`Template de treino "${name}" criado pelo treinador ${coachId}`);
    res.status(201).json(template);
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({ error: 'Erro interno ao criar modelo de treino.' });
  }
});

// Eliminar um template de treino
app.delete('/api/coach/templates/:templateId', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;
    const templateId = toStr(req.params.templateId);

    const template = await prisma.workout.findUnique({ where: { id: templateId } });
    if (!template || template.userId !== coachId || !template.isTemplate) {
      return res.status(404).json({ error: 'Modelo de treino não encontrado ou sem permissão.' });
    }

    await prisma.exercise.deleteMany({ where: { workoutId: templateId } });
    await prisma.workout.delete({ where: { id: templateId } });

    console.log(`Template ${templateId} eliminado pelo treinador ${coachId}`);
    res.status(200).json({ message: 'Modelo de treino eliminado com sucesso.' });
  } catch (error) {
    console.error('Erro ao apagar template:', error);
    res.status(500).json({ error: 'Erro ao eliminar modelo de treino.' });
  }
});

// Obter dados detalhados de um cliente específico para o PT
app.get('/api/coach/clients/:clientId', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;
    const clientId = toStr(req.params.clientId);

    const isAuthorized = await isCoachOfClient(coachId, clientId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Este cliente não está associado à tua conta de PT.' });
    }

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        weeklyGoal: true,
        currentStreak: true,
        dailyCalories: true,
        dailyProtein: true,
        dailyCarbs: true,
        dailyFat: true,
        createdAt: true,
        workouts: {
          include: { exercises: { orderBy: { createdAt: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        },
        logs: {
          include: {
            workout: true,
            setLogs: { orderBy: { setNumber: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        bodyMetrics: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        meals: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error('Erro ao obter detalhe do cliente:', error);
    res.status(500).json({ error: 'Erro ao obter dados do cliente.' });
  }
});

// Atribuir um treino a um cliente (clona ou cria novo treino associado)
app.post('/api/coach/assign-workout', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;
    const { clientId, workoutId, name, description, exercises } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'O ID do cliente é obrigatório.' });
    }

    const isAuthorized = await isCoachOfClient(coachId, clientId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Este cliente não está associado ao teu perfil de PT.' });
    }

    let assignedWorkout;

    // Caso 1: Atribuir a partir de um treino/template existente
    if (workoutId) {
      const source = await prisma.workout.findUnique({
        where: { id: workoutId },
        include: { exercises: true },
      });

      if (!source) {
        return res.status(404).json({ error: 'Treino de origem não encontrado.' });
      }

      // Validação de segurança: apenas treinos do próprio PT ou templates podem ser atribuídos
      if (source.userId !== coachId && source.assignedById !== coachId && !source.isTemplate) {
        return res.status(403).json({ error: 'Não tens permissão para usar este plano como base.' });
      }

      assignedWorkout = await prisma.workout.create({
        data: {
          name: source.name,
          description: source.description,
          userId: clientId, // Dono do treino passa a ser o cliente
          assignedById: coachId,
          exercises: {
            create: source.exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              restSeconds: ex.restSeconds || 90,
              notes: ex.notes || null,
            })),
          },
        },
        include: { exercises: true },
      });
    } 
    // Caso 2: Criar novo treino diretamente para o cliente
    else if (name) {
      assignedWorkout = await prisma.workout.create({
        data: {
          name,
          description: description || null,
          userId: clientId,
          assignedById: coachId,
          exercises: exercises && exercises.length > 0 ? {
            create: exercises.map((ex: any) => ({
              name: ex.name,
              sets: ex.sets || 3,
              reps: ex.reps || 10,
              weight: ex.weight || null,
              restSeconds: ex.restSeconds || 90,
              notes: ex.notes || null,
            })),
          } : undefined,
        },
        include: { exercises: true },
      });
    } else {
      return res.status(400).json({ error: 'Fornece um workoutId existente ou nome para criar novo treino.' });
    }

    console.log(`Treino "${assignedWorkout.name}" atribuído ao cliente ${clientId} pelo PT ${coachId}`);
    res.status(201).json(assignedWorkout);
  } catch (error) {
    console.error('Erro ao atribuir treino ao cliente:', error);
    res.status(500).json({ error: 'Erro ao atribuir treino.' });
  }
});

// Remover cliente da lista do PT
app.delete('/api/coach/clients/:clientId', authenticateToken, requireActiveCoach, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.user!.id;
    const clientId = toStr(req.params.clientId);

    await prisma.coachClient.deleteMany({
      where: { coachId, clientId },
    });

    console.log(`Cliente ${clientId} desassociado do PT ${coachId}`);
    res.status(200).json({ message: 'Cliente desassociado com sucesso.' });
  } catch (error) {
    console.error('Erro ao desassociar cliente:', error);
    res.status(500).json({ error: 'Erro ao desassociar cliente.' });
  }
});

// ==========================================
// ROTAS DE TREINOS (WORKOUTS)
// ==========================================

// Criar um novo treino (POST) - Autenticado
app.post('/api/workouts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const { name, description, targetClientId, isTemplate } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'O nome do treino é obrigatório!' });
    }

    if (callerRole === 'COACH') {
      const isAllowed = await hasActiveCoachAccess(callerId);
      if (!isAllowed) {
        return res.status(403).json({
          error: 'Subscrição inativa. Regularize a sua mensalidade de Personal Trainer para criar ou prescrever treinos.',
          isExpired: true,
          subscriptionRequired: true,
        });
      }
    }

    let targetUserId = callerId;
    let assignedById: string | null = null;

    // Se um PT estiver a criar para um cliente específico:
    if (callerRole === 'COACH' && targetClientId) {
      const isCoach = await isCoachOfClient(callerId, targetClientId);
      if (!isCoach) {
        return res.status(403).json({ error: 'Não podes criar treinos para clientes que não são teus.' });
      }
      targetUserId = targetClientId;
      assignedById = callerId;
    }

    const newWorkout = await prisma.workout.create({
      data: {
        name,
        description,
        userId: targetUserId,
        assignedById,
        isTemplate: callerRole === 'COACH' && !targetClientId ? !!isTemplate : false,
      },
      include: {
        exercises: true,
        assignedBy: { select: { id: true, name: true } },
      },
    });

    console.log(`✅ Treino "${name}" criado com sucesso para o utilizador ${targetUserId}!`);
    res.status(201).json(newWorkout);
  } catch (error) {
    console.error('❌ Erro ao criar treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar o treino.' });
  }
});

// Buscar todos os treinos (GET) - Autenticado e com proteção de dados
// Clientes vêem apenas os seus treinos (atribuídos). PTs vêem os seus templates ou treinos do cliente especificado.
app.get('/api/workouts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const clientId = req.query.clientId ? toStr(req.query.clientId) : undefined;

    let targetUserId = callerId;

    if (callerRole === 'COACH' && clientId) {
      const isCoach = await isCoachOfClient(callerId, clientId);
      if (!isCoach) {
        return res.status(403).json({ error: 'Não tens permissão para aceder aos treinos deste cliente.' });
      }
      targetUserId = clientId;
    }

    const userWorkouts = await prisma.workout.findMany({
      where: {
        userId: targetUserId,
      },
      include: {
        exercises: { orderBy: { createdAt: 'asc' } },
        assignedBy: { select: { id: true, name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(userWorkouts);
  } catch (error) {
    console.error('❌ Erro ao buscar treinos:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar os treinos.' });
  }
});

// Buscar todos os treinos de um utilizador específico (compatibilidade retroativa protegida)
app.get('/api/workouts/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const userId = toStr(req.params.userId);

    // Regra de Isolamento: Apenas o próprio ou o seu PT podem ver
    if (callerId !== userId) {
      if (callerRole !== 'COACH' || !(await isCoachOfClient(callerId, userId))) {
        return res.status(403).json({ error: 'Acesso negado aos dados deste utilizador.' });
      }
    }

    const userWorkouts = await prisma.workout.findMany({
      where: {
        userId: userId,
      },
      include: {
        exercises: { orderBy: { createdAt: 'asc' } },
        assignedBy: { select: { id: true, name: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(userWorkouts);
  } catch (error) {
    console.error('❌ Erro ao buscar treinos:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar os treinos.' });
  }
});

// Buscar um treino específico e todos os seus exercícios (GET) - Protegido
app.get('/api/workouts/detail/:workoutId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const workoutId = toStr(req.params.workoutId);

    const workoutDetails = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          orderBy: { createdAt: 'asc' },
        },
        assignedBy: { select: { id: true, name: true } },
      },
    });

    if (!workoutDetails) {
      return res.status(404).json({ error: 'Treino não encontrado.' });
    }

    // Validação de acesso
    if (workoutDetails.userId !== callerId) {
      const isCoach = callerRole === 'COACH' && (await isCoachOfClient(callerId, workoutDetails.userId));
      if (!isCoach) {
        return res.status(403).json({ error: 'Não tens permissão para aceder a este treino.' });
      }
    }

    res.status(200).json(workoutDetails);
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar os detalhes.' });
  }
});

// Clonar um treino existente e os seus exercícios (POST) - Protegido
app.post('/api/workouts/:workoutId/clone', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const workoutId = toStr(req.params.workoutId);

    const hasAccess = await canAccessWorkout(callerId, callerRole, workoutId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Não tens permissão para aceder ou duplicar este treino.' });
    }

    const originalWorkout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: { exercises: true },
    });

    if (!originalWorkout) {
      return res.status(404).json({ error: 'Treino original não encontrado.' });
    }

    const clonedWorkout = await prisma.workout.create({
      data: {
        name: `${originalWorkout.name} (Cópia)`,
        description: originalWorkout.description,
        userId: callerId,
        exercises: {
          create: originalWorkout.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restSeconds: ex.restSeconds || 90,
            notes: ex.notes || null,
          })),
        },
      },
      include: { exercises: true },
    });

    console.log(`Treino "${originalWorkout.name}" duplicado por ${callerId}`);
    res.status(201).json(clonedWorkout);
  } catch (error) {
    console.error('Erro ao clonar treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao clonar o treino.' });
  }
});

// Apagar um treino inteiro e os seus exercícios (DELETE) - Protegido
app.delete('/api/workouts/:workoutId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const workoutId = toStr(req.params.workoutId);

    const workout = await prisma.workout.findUnique({ where: { id: workoutId } });
    if (!workout) {
      return res.status(404).json({ error: 'Treino não encontrado.' });
    }

    if (workout.userId !== callerId) {
      const isCoach = callerRole === 'COACH' && (await isCoachOfClient(callerId, workout.userId));
      if (!isCoach) {
        return res.status(403).json({ error: 'Não tens permissão para apagar este treino.' });
      }
    }

    await prisma.exercise.deleteMany({ where: { workoutId } });
    await prisma.workout.delete({ where: { id: workoutId } });

    console.log(`Treino ${workoutId} e exercícios eliminados`);
    res.status(200).json({ message: 'Treino apagado com sucesso.' });
  } catch (error) {
    console.error('Erro ao apagar treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao apagar o treino.' });
  }
});

// ==========================================
// ROTAS DE EXERCÍCIOS (EXERCISES)
// ==========================================

// Criar um novo exercício num treino (POST) - Protegido
app.post('/api/exercises', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const { name, sets, reps, weight, restSeconds, notes, workoutId } = req.body;

    if (!name || !workoutId) {
      return res.status(400).json({ error: 'O nome do exercício e o ID do treino são obrigatórios.' });
    }

    const hasAccess = await canAccessWorkout(callerId, callerRole, workoutId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Não tens permissão para adicionar exercícios a este treino.' });
    }

    const newExercise = await prisma.exercise.create({
      data: {
        name,
        sets: sets ? Number(sets) : 3,
        reps: reps ? Number(reps) : 10,
        weight: weight !== undefined && weight !== null ? Number(weight) : null,
        restSeconds: restSeconds ? Number(restSeconds) : 90,
        notes: notes ? String(notes).trim() : null,
        workoutId,
      },
    });

    console.log(`Exercício "${name}" adicionado ao treino ${workoutId}`);
    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao criar o exercício.' });
  }
});

// Atualizar um exercício específico (PUT) - Protegido
app.put('/api/exercises/:exerciseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const exerciseId = toStr(req.params.exerciseId);
    const { name, sets, reps, weight, restSeconds, notes } = req.body;

    const accessCheck = await canAccessExercise(callerId, callerRole, exerciseId);
    if (!accessCheck.allowed) {
      return res.status(403).json({ error: 'Não tens permissão para atualizar este exercício.' });
    }

    const updatedExercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(sets !== undefined ? { sets: Number(sets) } : {}),
        ...(reps !== undefined ? { reps: Number(reps) } : {}),
        ...(weight !== undefined ? { weight: weight !== null ? Number(weight) : null } : {}),
        ...(restSeconds !== undefined ? { restSeconds: Number(restSeconds) } : {}),
        ...(notes !== undefined ? { notes: notes ? String(notes).trim() : null } : {}),
      },
    });

    console.log(`Exercício ${exerciseId} atualizado`);
    res.status(200).json(updatedExercise);
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar o exercício.' });
  }
});

// Apagar um exercício específico (DELETE) - Protegido
app.delete('/api/exercises/:exerciseId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const exerciseId = toStr(req.params.exerciseId);

    const accessCheck = await canAccessExercise(callerId, callerRole, exerciseId);
    if (!accessCheck.allowed) {
      return res.status(403).json({ error: 'Não tens permissão para eliminar este exercício.' });
    }

    await prisma.exercise.delete({ where: { id: exerciseId } });

    console.log(`Exercício ${exerciseId} eliminado`);
    res.status(200).json({ message: 'Exercício apagado com sucesso.' });
  } catch (error) {
    console.error('Erro ao apagar exercício:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao apagar o exercício.' });
  }
});

// Obter Recorde Pessoal (PR) de um exercício específico (GET) - Protegido
app.get('/api/exercises/:userId/pr/:exerciseName', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const userId = toStr(req.params.userId);
    const exerciseName = decodeURIComponent(toStr(req.params.exerciseName));

    if (callerId !== userId) {
      if (callerRole !== 'COACH' || !(await isCoachOfClient(callerId, userId))) {
        return res.status(403).json({ error: 'Acesso negado aos registos deste utilizador.' });
      }
    }

    // 1. Procurar nas séries reais concluídas nos treinos executados
    const bestSetLog = await prisma.workoutSetLog.findFirst({
      where: {
        exerciseName: { equals: exerciseName, mode: 'insensitive' },
        workoutLog: { userId },
        completed: true,
        weight: { gt: 0 },
      },
      orderBy: { weight: 'desc' },
      select: { weight: true, reps: true, createdAt: true },
    });

    if (bestSetLog && bestSetLog.weight) {
      return res.status(200).json({
        pr: bestSetLog.weight,
        reps: bestSetLog.reps,
        date: bestSetLog.createdAt,
      });
    }

    // 2. Fallback para planos cadastrados
    const prExercise = await prisma.exercise.findFirst({
      where: {
        name: { equals: exerciseName, mode: 'insensitive' },
        workout: { userId },
        weight: { not: null, gt: 0 },
      },
      orderBy: { weight: 'desc' },
      select: { weight: true, reps: true },
    });

    res.status(200).json({
      pr: prExercise?.weight || 0,
      reps: prExercise?.reps || 0,
    });
  } catch (error) {
    console.error('Erro ao buscar PR do exercício:', error);
    res.status(500).json({ error: 'Erro ao obter o recorde pessoal.' });
  }
});

// Obter histórico de desempenho anterior para múltiplos exercícios (POST) - Protegido
app.post('/api/exercises/previous-performance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const { exerciseNames, targetUserId } = req.body;
    const userId = targetUserId || callerId;

    if (!Array.isArray(exerciseNames) || exerciseNames.length === 0) {
      return res.status(200).json({});
    }

    const result: Record<string, { date: string; sets: Array<{ setNumber: number; weight: number | null; reps: number; setType: string }> }> = {};

    await Promise.all(
      exerciseNames.map(async (rawName) => {
        const name = String(rawName).trim();
        if (!name) return;

        // Encontrar a sessão mais recente que tenha séries concluídas deste exercício para este utilizador
        const lastSetLog = await prisma.workoutSetLog.findFirst({
          where: {
            exerciseName: { equals: name, mode: 'insensitive' },
            workoutLog: { userId },
            completed: true,
          },
          orderBy: { createdAt: 'desc' },
          select: { workoutLogId: true, createdAt: true },
        });

        if (!lastSetLog) return;

        // Buscar todas as séries desse mesmo treino para manter a ordem
        const sessionSets = await prisma.workoutSetLog.findMany({
          where: {
            workoutLogId: lastSetLog.workoutLogId,
            exerciseName: { equals: name, mode: 'insensitive' },
            completed: true,
          },
          orderBy: { setNumber: 'asc' },
          select: { setNumber: true, weight: true, reps: true, setType: true },
        });

        if (sessionSets.length > 0) {
          result[name] = {
            date: lastSetLog.createdAt.toISOString(),
            sets: sessionSets.map((s) => ({
              setNumber: s.setNumber,
              weight: s.weight,
              reps: s.reps,
              setType: s.setType || 'NORMAL',
            })),
          };
        }
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao buscar desempenho anterior dos exercícios:', error);
    res.status(500).json({ error: 'Erro ao obter histórico de desempenho anterior.' });
  }
});

// ==========================================
// ROTAS DE HISTÓRICO DE TREINOS (LOGS)
// ==========================================

// Registar um treino concluído com detalhe de séries (POST) - Protegido
app.post('/api/logs', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { workoutId, durationMinutes, notes, rating, sets } = req.body;

    if (!workoutId) {
      return res.status(400).json({ error: 'O identificador do treino é obrigatório.' });
    }

    const newLog = await prisma.workoutLog.create({
      data: {
        userId,
        workoutId,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
        notes: notes ? String(notes).trim() : null,
        rating: rating ? Number(rating) : null,
        setLogs: Array.isArray(sets) && sets.length > 0 ? {
          create: sets.map((s: any, idx: number) => ({
            exerciseId: s.exerciseId || null,
            exerciseName: s.exerciseName || 'Exercício',
            setNumber: s.setNumber ? Number(s.setNumber) : idx + 1,
            reps: Number(s.reps) || 0,
            weight: s.weight !== undefined && s.weight !== null ? Number(s.weight) : null,
            completed: s.completed !== false,
            rpe: s.rpe ? Number(s.rpe) : null,
            setType: s.setType || 'NORMAL',
          })),
        } : undefined,
      },
      include: {
        workout: true,
        setLogs: { orderBy: { setNumber: 'asc' } },
      },
    });

    // Atualização de Streak Semanal
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const now = new Date();
      const dayOfWeek = now.getDay() || 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const weeklyLogsCount = await prisma.workoutLog.count({
        where: {
          userId: userId,
          createdAt: { gte: monday, lte: sunday },
        },
      });

      if (weeklyLogsCount === user.weeklyGoal) {
        await prisma.user.update({
          where: { id: userId },
          data: { currentStreak: user.currentStreak + 1 },
        });
      }
    }

    console.log(`Treino ${workoutId} concluído por ${userId} (${durationMinutes} min)`);
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Erro ao registar sessão de treino:', error);
    res.status(500).json({ error: 'Erro ao registar o treino concluído.' });
  }
});

// Obter o histórico de treinos de um utilizador com séries (GET) - Protegido
app.get('/api/logs/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const userId = toStr(req.params.userId);

    // Regra de segurança: Apenas o próprio ou o seu PT
    if (callerId !== userId) {
      if (callerRole !== 'COACH' || !(await isCoachOfClient(callerId, userId))) {
        return res.status(403).json({ error: 'Acesso negado aos registos deste utilizador.' });
      }
    }

    const historyLogs = await prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        workout: true,
        setLogs: { orderBy: { setNumber: 'asc' } },
      },
    });

    res.status(200).json(historyLogs);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno ao obter o histórico.' });
  }
});

// ==========================================
// ROTAS DE MÉTRICAS CORPORAIS (PESO)
// ==========================================

// Registar peso (POST) - Protegido
app.post('/api/metrics/weight', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { weight } = req.body;

    if (!weight) {
      return res.status(400).json({ error: 'O valor do peso é obrigatório.' });
    }

    const newMetric = await prisma.bodyMetric.create({
      data: {
        userId,
        weight: parseFloat(weight),
      },
    });

    console.log(`⚖️ Peso registado para ${userId}: ${weight}kg`);
    res.status(201).json(newMetric);
  } catch (error) {
    console.error('❌ Erro ao registar peso:', error);
    res.status(500).json({ error: 'Erro ao registar a métrica corporal.' });
  }
});

// Obter histórico de peso (GET) - Protegido
app.get('/api/metrics/weight/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const userId = toStr(req.params.userId);

    if (callerId !== userId) {
      if (callerRole !== 'COACH' || !(await isCoachOfClient(callerId, userId))) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    }

    const metrics = await prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao obter as métricas.' });
  }
});

// Registar avaliação física completa (peso, perímetros corporais e fotos de evolução)
app.post('/api/metrics/assessment', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const { targetUserId, weight, chest, waist, arms, thighs, bodyFat, photoUrl, notes } = req.body;

    let userId = callerId;
    if (callerRole === 'COACH' && targetUserId) {
      const isAllowed = await hasActiveCoachAccess(callerId);
      if (!isAllowed) {
        return res.status(403).json({
          error: 'Subscrição inativa. Regularize a sua mensalidade de Personal Trainer para registar avaliações físicas.',
          isExpired: true,
          subscriptionRequired: true,
        });
      }

      const isCoach = await isCoachOfClient(callerId, targetUserId);
      if (!isCoach) {
        return res.status(403).json({ error: 'Não tens autorização para registar avaliações deste aluno.' });
      }
      userId = targetUserId;
    }

    if (!weight) {
      return res.status(400).json({ error: 'O peso corporal é obrigatório para registar a avaliação.' });
    }

    const assessment = await prisma.bodyMetric.create({
      data: {
        userId,
        weight: Number(weight),
        chest: chest !== undefined && chest !== '' ? Number(chest) : null,
        waist: waist !== undefined && waist !== '' ? Number(waist) : null,
        arms: arms !== undefined && arms !== '' ? Number(arms) : null,
        thighs: thighs !== undefined && thighs !== '' ? Number(thighs) : null,
        bodyFat: bodyFat !== undefined && bodyFat !== '' ? Number(bodyFat) : null,
        photoUrl: photoUrl ? String(photoUrl) : null,
        notes: notes ? String(notes).trim() : null,
      },
    });

    console.log(`Avaliação física registada para ${userId}: ${weight}kg`);
    res.status(201).json(assessment);
  } catch (error) {
    console.error('Erro ao registar avaliação física:', error);
    res.status(500).json({ error: 'Erro interno ao registar a avaliação física.' });
  }
});

// Obter histórico de avaliações físicas e evolução corporal
app.get('/api/metrics/assessment/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const userId = toStr(req.params.userId);

    if (callerId !== userId) {
      if (callerRole !== 'COACH' || !(await isCoachOfClient(callerId, userId))) {
        return res.status(403).json({ error: 'Acesso negado às avaliações deste utilizador.' });
      }
    }

    const assessments = await prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(assessments);
  } catch (error) {
    console.error('Erro ao obter avaliações físicas:', error);
    res.status(500).json({ error: 'Erro interno ao obter histórico de avaliações.' });
  }
});

// ==========================================
// ROTAS DE NUTRIÇÃO E CALORIAS 🍎
// ==========================================

// Registar uma refeição (POST) - Protegido
app.post('/api/nutrition/meals', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, calories, protein, carbs, fat, imageUri } = req.body;

    if (!name || calories === undefined) {
      return res.status(400).json({ error: 'Faltam dados obrigatórios (nome, calorias).' });
    }

    const newMeal = await prisma.mealLog.create({
      data: {
        userId,
        name,
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        imageUri: imageUri || null,
      },
    });

    console.log(`🍎 Refeição "${name}" registada para ${userId} (${calories} kcal).`);
    res.status(201).json(newMeal);
  } catch (error) {
    console.error('❌ Erro ao registar refeição:', error);
    res.status(500).json({ error: 'Erro ao guardar a refeição.' });
  }
});

// Obter refeições de HOJE do utilizador (GET) - Protegido
app.get('/api/nutrition/meals/:userId/today', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const userId = toStr(req.params.userId);

    if (callerId !== userId) {
      if (callerRole !== 'COACH' || !(await isCoachOfClient(callerId, userId))) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const todayMeals = await prisma.mealLog.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(todayMeals);
  } catch (error) {
    console.error('❌ Erro ao buscar refeições de hoje:', error);
    res.status(500).json({ error: 'Erro ao obter as refeições.' });
  }
});

// Obter todas as refeições do utilizador (para histórico e fotos) - Protegido
app.get('/api/nutrition/meals/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const callerRole = req.user!.role;
    const userId = toStr(req.params.userId);

    if (callerId !== userId) {
      if (callerRole !== 'COACH' || !(await isCoachOfClient(callerId, userId))) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
    }

    const meals = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json(meals);
  } catch (error) {
    console.error('❌ Erro ao buscar histórico de refeições:', error);
    res.status(500).json({ error: 'Erro ao obter histórico de refeições.' });
  }
});

// Analisar imagem de comida com IA (POST) - Protegido
app.post('/api/nutrition/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Falta a imagem em Base64 para analisar.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'A GEMINI_API_KEY não está configurada no servidor.' });
    }

    console.log('🤖 A enviar imagem para o modelo Gemini...');
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a nutrition expert. Analyze this food photo.
    Estimate visible portions and return ONLY a valid JSON object.
    No extra text and no markdown fences.
    Use English for the meal name.
    Use exactly this structure:
    {
      "name": "Descriptive meal name (e.g. Chicken steak with rice)",
      "calories": estimated_integer,
      "protein": estimated_protein_grams,
      "carbs": estimated_carbs_grams,
      "fat": estimated_fat_grams
    }`;

    const imageParts = [
      {
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/jpeg',
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    const nutritionData = extractAndParseJson(text);
    const sanitizedNutrition = {
      name: String(nutritionData.name || 'Refeição').trim(),
      calories: Math.max(0, Math.round(Number(nutritionData.calories) || 0)),
      protein: Math.max(0, Math.round(Number(nutritionData.protein) || 0)),
      carbs: Math.max(0, Math.round(Number(nutritionData.carbs) || 0)),
      fat: Math.max(0, Math.round(Number(nutritionData.fat) || 0)),
    };

    console.log(`🍔 Análise concluída: ${sanitizedNutrition.name} (${sanitizedNutrition.calories} kcal)`);
    res.status(200).json(sanitizedNutrition);
  } catch (error: any) {
    console.error('❌ Erro na análise de IA:', error);
    res.status(500).json({ error: error.message || 'Não foi possível analisar a fotografia com precisão.' });
  }
});

// ==========================================
// ROTAS DE IA - GERADOR DE TREINOS
// ==========================================

app.post('/api/ai/generate-workout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'O prompt é obrigatório!' });
    }

    if (req.user?.role === 'COACH') {
      const isAllowed = await hasActiveCoachAccess(req.user.id);
      if (!isAllowed) {
        return res.status(403).json({
          error: 'Subscrição inativa. Regularize a sua mensalidade de Personal Trainer para utilizar o gerador de treinos com IA.',
          isExpired: true,
          subscriptionRequired: true,
        });
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Chave da API Gemini não configurada.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemInstruction = `
      You are an elite personal trainer. The user will request a workout.
      Reply STRICTLY with valid JSON, no extra text and no markdown fences.
      All names and descriptions must be in English.
      Use exactly this structure:
      {
        "name": "Workout name (e.g. Strength - Chest)",
        "description": "A short objective for the session",
        "exercises": [
          {
            "name": "Exercise name",
            "sets": 4,
            "reps": 10,
            "weight": 0
          }
        ]
      }
    `;

    const fullPrompt = `${systemInstruction}\n\nUser request: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    const workoutData = extractAndParseJson(responseText);
    const sanitizedWorkout = {
      name: String(workoutData.name || 'Custom AI Workout').trim(),
      description: String(workoutData.description || '').trim(),
      exercises: Array.isArray(workoutData.exercises)
        ? workoutData.exercises.map((ex: any) => ({
            name: String(ex.name || 'Exercise').trim(),
            sets: Math.max(1, Math.min(10, Math.round(Number(ex.sets) || 3))),
            reps: Math.max(1, Math.min(100, Math.round(Number(ex.reps) || 10))),
            weight: ex.weight !== null && ex.weight !== undefined ? Number(ex.weight) || 0 : 0,
          }))
        : [],
    };

    console.log(`🧠 IA gerou o treino: ${sanitizedWorkout.name} (${sanitizedWorkout.exercises.length} exercícios)`);
    res.status(200).json(sanitizedWorkout);
  } catch (error: any) {
    console.error('❌ Erro na IA:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar treino com a IA.' });
  }
});

// ==========================================
// ROTAS DE PERFIL DE UTILIZADOR
// ==========================================

// Atualizar o perfil do utilizador (PUT) - Protegido
app.put('/api/users/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const callerId = req.user!.id;
    const userId = toStr(req.params.userId);
    const { name, picture, weeklyGoal, dailyCalories, dailyProtein, dailyCarbs, dailyFat } = req.body;

    if (callerId !== userId) {
      return res.status(403).json({ error: 'Apenas podes atualizar o teu próprio perfil.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        picture,
        weeklyGoal,
        dailyCalories,
        dailyProtein,
        dailyCarbs,
        dailyFat,
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        weeklyGoal: true,
        currentStreak: true,
        dailyCalories: true,
        dailyProtein: true,
        dailyCarbs: true,
        dailyFat: true,
        createdAt: true,
      },
    });

    console.log(`👤 Perfil de ${updatedUser.name} atualizado!`);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar o perfil.' });
  }
});

// ==========================================
// ROTAS DE MONETIZAÇÃO & SUBSCRIÇÕES (STRIPE SAAS)
// ==========================================

// Obter estado atual da subscrição do treinador
app.get('/api/subscription/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const trial = getTrialInfo(user);
    res.status(200).json({
      user,
      trial,
      stripeEnabled: !!stripe,
    });
  } catch (error) {
    console.error('Erro ao verificar estado da subscrição:', error);
    res.status(500).json({ error: 'Erro ao obter dados de subscrição.' });
  }
});

// Criar sessão de checkout no Stripe para ativar a mensalidade do PT
app.post('/api/subscription/create-checkout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    if (user.role !== 'COACH') {
      return res.status(403).json({ error: 'Apenas contas de Personal Trainer podem subscrever o plano profissional.' });
    }

    if (!stripe) {
      console.warn('⚠️ Stripe API Secret Key não configurada. A disponibilizar modo de simulação.');
      return res.status(200).json({
        simulated: true,
        message: 'A chave do Stripe não se encontra configurada neste ambiente. Pode utilizar a ativação por simulação de testes.',
      });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY;
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: 'Fit Coach Pro - Mensalidade de Treinador',
                  description: 'Acesso completo ao painel de Personal Trainer, gestão ilimitada de alunos, biblioteca de modelos e IA.',
                },
                unit_amount: 2990, // 29.90 EUR / mês
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
      success_url: `${frontendBaseUrl}?checkout=success`,
      cancel_url: `${frontendBaseUrl}?checkout=cancel`,
      metadata: { userId: user.id },
    });

    console.log(`Sessão Stripe Checkout criada com sucesso para ${user.name}: ${session.url}`);
    res.status(200).json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Erro ao gerar Stripe Checkout:', error);
    res.status(500).json({ error: error.message || 'Erro ao inicializar pagamento no Stripe.' });
  }
});

// Aceder ao portal de faturação do Stripe (Customer Portal para gerir cartões/cancelar)
app.post('/api/subscription/portal', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: 'Nenhum registo de cliente de faturação associado a este utilizador.' });
    }

    if (!stripe) {
      return res.status(400).json({ error: 'Portal Stripe indisponível sem chave de API configurada.' });
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: frontendBaseUrl,
    });

    res.status(200).json({ portalUrl: portalSession.url });
  } catch (error: any) {
    console.error('Erro ao aceder ao portal Stripe:', error);
    res.status(500).json({ error: error.message || 'Erro ao aceder ao portal de faturação.' });
  }
});

// Webhook do Stripe para sincronização automática de pagamentos e renovações
app.post('/api/subscription/webhook', async (req: any, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (stripe && webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('❌ Falha na assinatura do Stripe Webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    event = req.body;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              stripeCustomerId: customerId || undefined,
              stripeSubscriptionId: subscriptionId || undefined,
            },
          });
          console.log(`✅ Subscrição ativada com sucesso para o utilizador ${userId}!`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

        if (customerId) {
          const status = sub.status === 'active' ? 'active' : sub.status;
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              subscriptionStatus: status,
              stripeSubscriptionId: sub.id,
            },
          });
          console.log(`Subscrição do cliente ${customerId} atualizada para ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

        if (customerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              subscriptionStatus: 'canceled',
            },
          });
          console.log(`Subscrição do cliente ${customerId} cancelada.`);
        }
        break;
      }

      default:
        console.log(`Evento Stripe recebido: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook do Stripe:', error);
    res.status(500).json({ error: 'Erro ao processar evento webhook.' });
  }
});

// Endpoint de Teste/Dev: Simular pagamento e ativação da subscrição
app.post('/api/subscription/dev-simulate-payment', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
        trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      },
    });

    console.log(`Simulação de pagamento ativada para ${updated.name}`);
    res.status(200).json({
      message: 'Subscrição profissional ativada em modo de demonstração com sucesso.',
      user: updated,
      trial: getTrialInfo(updated),
    });
  } catch (error) {
    console.error('Erro ao simular pagamento:', error);
    res.status(500).json({ error: 'Erro ao simular ativação de pagamento.' });
  }
});

// Endpoint de Teste/Dev: Simular expiração do trial para testar bloqueio/paywall
app.post('/api/subscription/dev-simulate-expiry', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'expired',
        trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // ontem
      },
    });

    console.log(`Simulação de expiração de trial ativada para ${updated.name}`);
    res.status(200).json({
      message: 'Período de avaliação expirado em modo de teste.',
      user: updated,
      trial: getTrialInfo(updated),
    });
  } catch (error) {
    console.error('Erro ao simular expiração:', error);
    res.status(500).json({ error: 'Erro ao simular expiração de teste.' });
  }
});

// ==========================================
// ARRANQUE DO SERVIDOR
// ==========================================

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ERRO: A porta ${PORT} já está a ser usada por outro processo!`);
  } else {
    console.error('❌ ERRO no servidor:', err);
  }
});

process.on('uncaughtException', (err) => {
  console.error("❌ ERRO CRÍTICO (Não apanhado):", err);
});

process.stdin.resume();