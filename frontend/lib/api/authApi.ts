const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  tenant: {
    id: string;
    business_name: string;
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
  admin: AdminUser;
  detail?: string;
}

export const authApi = {
  // Request OTP
  async requestOTP(email: string): Promise<void> {
    const res = await fetch(`${API_BASE}/staff/request-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to send OTP');
    }
  },

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/staff/verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'OTP verification failed');
    }

    return data;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const res = await fetch(`${API_BASE}/staff/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    return await res.json();
  },

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_info');
  },

  // Get current user
  getCurrentUser(): AdminUser | null {
    const adminInfo = localStorage.getItem('admin_info');
    return adminInfo ? JSON.parse(adminInfo) : null;
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // Get auth headers for API calls
  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
};