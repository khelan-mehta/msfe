import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS, REFRESH_TOKEN_MAX_AGE_MS } from '../constants';
import { authEvents } from './authEvents';

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

const processQueue = () => {
  refreshQueue.forEach(cb => cb());
  refreshQueue = [];
};

const isRefreshTokenExpired = async (): Promise<boolean> => {
  const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN_TIMESTAMP);
  if (!timestamp) return true;
  const elapsed = Date.now() - parseInt(timestamp, 10);
  return elapsed > REFRESH_TOKEN_MAX_AGE_MS;
};

const forceLogout = async (reason?: string) => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN_TIMESTAMP,
  ]);
  isRefreshing = false;
  refreshQueue = [];
  authEvents.emitLogout(reason);
};

export const authorizedFetch = async (
  url: string,
  options: RequestInit = {},
  onLogout?: () => void
): Promise<Response> => {
  const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Access token expired
  if (response.status === 401 || response.status === 403) {
    // Check for inactive account response
    try {
      const clonedRes = response.clone();
      const errorBody = await clonedRes.json();
      if (
        errorBody?.code === 'ACCOUNT_INACTIVE' ||
        errorBody?.message?.toLowerCase().includes('inactive')
      ) {
        await forceLogout('inactive');
        onLogout?.();
        throw new Error('Account is inactive. Please contact admin.');
      }
    } catch (e: any) {
      if (e.message === 'Account is inactive. Please contact admin.') throw e;
      // Ignore JSON parse errors
    }

    // Check if refresh token has expired (> 30 days)
    const expired = await isRefreshTokenExpired();
    if (expired) {
      await forceLogout('refresh_token_expired');
      onLogout?.();
      throw new Error('Session expired. Please login again.');
    }

    if (isRefreshing) {
      await new Promise<void>(resolve => refreshQueue.push(resolve));
    } else {
      isRefreshing = true;

      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        await forceLogout('no_refresh_token');
        onLogout?.();
        throw new Error('No refresh token');
      }

      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshRes.ok) {
        // Check if the refresh failure is due to inactive account
        try {
          const refreshError = await refreshRes.json();
          if (
            refreshError?.code === 'ACCOUNT_INACTIVE' ||
            refreshError?.message?.toLowerCase().includes('inactive')
          ) {
            await forceLogout('inactive');
            onLogout?.();
            throw new Error('Account is inactive. Please contact admin.');
          }
        } catch (e: any) {
          if (e.message === 'Account is inactive. Please contact admin.') throw e;
        }

        await forceLogout('refresh_failed');
        onLogout?.();
        throw new Error('Refresh token invalid');
      }

      const refreshJson = await refreshRes.json();
      const newAccessToken = refreshJson.data.accessToken;

      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      isRefreshing = false;
      processQueue();
    }

    // Retry original request
    const newToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  return response;
};
