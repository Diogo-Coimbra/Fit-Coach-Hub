import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { api } from './api';

// Configuração do comportamento das notificações quando a app está aberta no primeiro plano (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Pede permissões de notificação ao utilizador, obtém o Expo Push Token
 * e envia-o para o backend para ficar associado à conta do utilizador.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Notificações push nativas requerem dispositivo físico ou emulador compatível
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    if (!Device.isDevice) {
      console.log('[Push] A correr num simulador; notificações push nativas podem ter suporte limitado.');
    }

    // Verificar estado atual das permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Se ainda não foram concedidas, solicitar ao utilizador
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permissão de notificações não concedida pelo utilizador.');
      return null;
    }

    // Obter o Expo Push Token
    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = pushTokenData?.data;

    if (pushToken) {
      console.log('[Push] Token obtido:', pushToken.substring(0, 25) + '...');
      // Registar token no backend
      await api.post('/api/users/push-token', { pushToken });
    }

    // Configuração de canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Geral',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });
    }

    return pushToken;
  } catch (error: any) {
    console.warn('[Push] Aviso ao registar push token:', error?.message || error);
    return null;
  }
}
