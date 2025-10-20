import * as SecureStore from 'expo-secure-store';

const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface AuthToken {
  token: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
  };
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message: string;
  data?: T;
}

class AuthService {
  private readonly TOKEN_KEY = 'authToken';

  /**
   * Store authentication token securely
   */
  async storeToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  /**
   * Remove authentication token
   */
  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  /**
   * Check if user has a valid token
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Make authenticated API request
   */
  async authenticatedRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message: string; status: number }> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          status: 401
        };
      }

      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${EXPO_API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const result = await response.json();

      return {
        success: response.ok,
        data: result,
        message: result.message || (response.ok ? 'Request successful' : 'Request failed'),
        status: response.status
      };
    } catch (error) {
      console.error('Authenticated request error:', error);
      return {
        success: false,
        message: `Failed to connect to server at ${EXPO_API_URL}`,
        status: 0
      };
    }
  }

  /**
   * Check user profile status
   */
  async getProfileStatus(): Promise<{ success: boolean; user?: any; message: string }> {
    const response = await this.authenticatedRequest('/onboarding/profile-status', {
      method: 'POST'
    });

    return {
      success: response.success,
      user: response.data?.user,
      message: response.message
    };
  }

  /**
   * Select user role
   */
  async selectRole(role: 'student' | 'sponsor'): Promise<{ success: boolean; message: string; currentRole?: string }> {
    const response = await this.authenticatedRequest('/onboarding/select-role', {
      method: 'POST',
      body: JSON.stringify({ role })
    });

    return {
      success: response.success,
      message: response.message,
      currentRole: response.data?.user?.role
    };
  }
}

export const authService = new AuthService();
