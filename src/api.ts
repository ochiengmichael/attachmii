/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('attachme_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  setToken(token: string) {
    localStorage.setItem('attachme_jwt_token', token);
  },

  clearToken() {
    localStorage.removeItem('attachme_jwt_token');
  },

  getToken() {
    return localStorage.getItem('attachme_jwt_token');
  },

  async request(path: string, options: RequestInit = {}) {
    const headers = getAuthHeaders();
    const config = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    };

    const res = await fetch(path, config);
    const data = await res.json();
    if (res.status === 401 && !path.includes('/api/auth/login')) {
      localStorage.removeItem('attachme_jwt_token');
      window.dispatchEvent(new Event('attachme_unauthorized'));
    }
    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong with the request.');
    }
    return data;
  },

  // Auth APIs
  async register(body: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async login(body: any) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  async updateProfile(profileData: any) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async uploadDocs(formData: FormData) {
    const token = this.getToken();
    const res = await fetch('/api/auth/upload', {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed uploading files.');
    }
    return data;
  },

  // Jobs APIs
  async getJobs(filters: { query?: string; location?: string; type?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.location) params.append('location', filters.location);
    if (filters.type) params.append('type', filters.type);
    
    return this.request(`/api/jobs?${params.toString()}`);
  },

  async getJobDetails(id: string) {
    return this.request(`/api/jobs/${id}`);
  },

  async postJob(body: any) {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async updateJob(id: string, body: any) {
    return this.request(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async deleteJob(id: string) {
    return this.request(`/api/jobs/${id}`, {
      method: 'DELETE'
    });
  },

  // Applications APIs
  async applyJob(jobId: string, coverLetter: string) {
    return this.request('/api/applications/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, coverLetter })
    });
  },

  async getApplications() {
    return this.request('/api/applications/my');
  },

  async updateApplicationStatus(id: string, status: string) {
    return this.request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Saved Jobs APIs
  async toggleSaveJob(jobId: string) {
    return this.request('/api/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId })
    });
  },

  async getSavedJobs() {
    return this.request('/api/saved-jobs');
  },

  // Notifications APIs
  async getNotifications() {
    return this.request('/api/notifications');
  },

  async markNotificationsRead() {
    return this.request('/api/notifications/read', {
      method: 'POST'
    });
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

  // Support Reports APIs
  async submitReport(subject: string, description: string) {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ subject, description })
    });
  },

  async resolveReport(id: string) {
    return this.request(`/api/reports/${id}/resolve`, {
      method: 'PUT'
    });
  },

  // Admin exclusive APIs
  async getAdminStats() {
    return this.request('/api/admin/stats');
  },

  async getAdminUsers() {
    return this.request('/api/admin/users');
  },

  async toggleUserSuspend(id: string) {
    return this.request(`/api/admin/users/${id}/suspend`, {
      method: 'PUT'
    });
  },

  async approveEmployer(id: string) {
    return this.request(`/api/admin/users/${id}/approve`, {
      method: 'PUT'
    });
  },

  // Forgot Password & Reset Password APIs
  async forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(payload: any) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Delete Account
  async deleteAccount() {
    return this.request('/api/auth/account', {
      method: 'DELETE'
    });
  }
};
