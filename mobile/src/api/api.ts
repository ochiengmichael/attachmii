import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_PRODUCTION_URL = 'https://ais-dev-unq3prlqaklkjhsy4enlqw-529095381960.europe-west1.run.app';

// Token Storage Keys
const TOKEN_KEY = 'attachme_jwt_access_token';
const REFRESH_KEY = 'attachme_jwt_refresh_token';

export const storeTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  } catch (error) {
    console.error('Failed storing crypto tokens securely', error);
  }
};

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_KEY);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};

export const mobileApi = {
  // Master generic fetch client
  async request(path: string, options: RequestInit = {}) {
    const token = await getAccessToken();
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    };

    try {
      const res = await fetch(`${API_PRODUCTION_URL}${path}`, config);
      const data = await res.json();

      // If unauthorized, attempt jwt rotates token refreshment automatically
      if (res.status === 401 && path !== '/api/auth/login') {
        const isRefreshed = await this.refreshTokenFlow();
        if (isRefreshed) {
          // Retry original query
          const retriedToken = await getAccessToken();
          const retriedConfig = {
            ...config,
            headers: {
              ...config.headers,
              'Authorization': `Bearer ${retriedToken}`
            }
          };
          const retryRes = await fetch(`${API_PRODUCTION_URL}${path}`, retriedConfig);
          return await retryRes.json();
        } else {
          await clearTokens();
          throw new Error('Session expired. Please sign in directly.');
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred during operation.');
      }
      return data;
    } catch (err: any) {
      console.warn('Network transmission failing or offline mode triggered:', err.message);
      throw err;
    }
  },

  // JWT Token rotation refreshing service
  async refreshTokenFlow(): Promise<boolean> {
    const refresh = await getRefreshToken();
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_PRODUCTION_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refresh })
      });

      const data = await res.json();
      if (res.ok && data.token && data.refreshToken) {
        await storeTokens(data.token, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Authentication screens REST integrations
  async login(body: any) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    if (data.token) {
      await storeTokens(data.token, data.refreshToken || data.token);
    }
    return data;
  },

  async register(body: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  // Jobs catalog and offline fallback cache logic
  async getJobs(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.location) params.append('location', filters.location);
    if (filters.type) params.append('type', filters.type);

    try {
      const data = await this.request(`/api/jobs?${params.toString()}`);
      // Cache jobs list locally in AsyncStorage for offline resilience
      if (data && data.jobs) {
        await AsyncStorage.setItem('@offline_jobs_manifest', JSON.stringify(data.jobs));
      }
      return data.jobs || [];
    } catch (error) {
      console.log('Mobile is Offline. Retrieving listings from local storage...');
      const local = await AsyncStorage.getItem('@offline_jobs_manifest');
      return local ? JSON.parse(local) : [];
    }
  },

  // Applications matching logic
  async applyJob(jobId: string, coverLetter: string) {
    return this.request('/api/applications/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, coverLetter })
    });
  },

  async getApplications() {
    return this.request('/api/applications/my');
  },

  // Chat/Messages APIs
  async getMessages(peerUserId: string) {
    return this.request(`/api/messages?userId=${peerUserId}`);
  },

  async sendMessage(receiverId: string, receiverName: string, content: string) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, receiverName, content })
    });
  },

  // Support Tickets APIs
  async submitReport(subject: string, description: string) {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ subject, description })
    });
  }
};
