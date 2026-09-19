import { PrismaClient } from '@prisma/client';

export interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Valida e envia uma notificação push via serviço oficial da Expo
 */
export async function sendExpoPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  const token = payload.to?.trim();
  if (!token) return false;

  // Verifica se é um token Expo válido
  const isExpoToken = token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
  if (!isExpoToken) {
    console.warn(`[Push] Token inválido ou ignorado: ${token.substring(0, 15)}...`);
    return false;
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound !== undefined ? payload.sound : 'default',
        priority: payload.priority || 'high',
      }),
    });

    const result: any = await response.json();
    if (result?.data?.status === 'ok') {
      console.log(`[Push] Notificação entregue com sucesso a ${token.substring(0, 20)}...`);
      return true;
    } else {
      console.warn('[Push] Resposta da Expo:', JSON.stringify(result));
      return false;
    }
  } catch (err: any) {
    console.error('[Push] Erro ao enviar notificação push Expo:', err.message);
    return false;
  }
}

/**
 * Envia notificação para um utilizador específico (se tiver pushToken registado)
 */
export async function notifyUser(
  prisma: PrismaClient,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true, name: true },
    });

    if (!user || !user.pushToken) {
      return false;
    }

    return await sendExpoPushNotification({
      to: user.pushToken,
      title,
      body,
      data,
    });
  } catch (error) {
    console.error(`[Push] Erro ao notificar utilizador ${userId}:`, error);
    return false;
  }
}

/**
 * Notifica todos os Personal Trainers associados a um determinado aluno
 */
export async function notifyCoachesOfClient(
  prisma: PrismaClient,
  clientId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const coachClients = await prisma.coachClient.findMany({
      where: { clientId },
      include: {
        coach: {
          select: { id: true, name: true, pushToken: true },
        },
      },
    });

    for (const rel of coachClients) {
      if (rel.coach.pushToken) {
        await sendExpoPushNotification({
          to: rel.coach.pushToken,
          title,
          body,
          data,
        });
      }
    }
  } catch (error) {
    console.error(`[Push] Erro ao notificar treinadores do aluno ${clientId}:`, error);
  }
}
