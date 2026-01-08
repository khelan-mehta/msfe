import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

const processQueue = () => {
  refreshQueue.forEach(cb => cb());
  refreshQueue = [];
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

  // ✅ Access token expired
  if (response.status === 401 || response.status === 403) {
    if (isRefreshing) {
      await new Promise<void>(resolve => refreshQueue.push(resolve));
    } else {
      isRefreshing = true;

      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        onLogout?.();
        throw new Error('No refresh token');
      }

      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshRes.ok) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
        ]);
        onLogout?.();
        throw new Error('Refresh token invalid');
      }

      const refreshJson = await refreshRes.json();
      const newAccessToken = refreshJson.data.accessToken;

      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      isRefreshing = false;
      processQueue();
    }

    // 🔁 Retry original request
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
