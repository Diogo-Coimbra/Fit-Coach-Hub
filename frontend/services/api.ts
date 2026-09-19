import { useAuthStore } from '../store/useAuthStore';

// URL base única para todo o frontend. Lê do ficheiro .env através de EXPO_PUBLIC_API_URL.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.80:3000';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Obter o token JWT diretamente do store global
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (options.data !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.data);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  // Se o token for inválido ou expirado (401), podemos limpar a sessão
  if (response.status === 401 && token) {
    console.warn('⚠️ Sessão expirada ou não autorizada. A efetuar logout.');
    useAuthStore.getState().logout();
  }

  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  // Se a subscrição estiver expirada (403 com subscriptionRequired), atualizar estado local de trial
  if (response.status === 403 && responseData?.subscriptionRequired) {
    const currentTrial = useAuthStore.getState().trial;
    if (currentTrial) {
      useAuthStore.getState().setTrial({
        ...currentTrial,
        isExpired: true,
        isSubscribed: false,
        status: 'expired',
      });
    }
  }

  if (!response.ok) {
    const errorMessage = responseData?.error || responseData?.message || `Erro HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseData as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', data }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', data }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', data }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

