// Read base URL from Vite environment (use VITE_API_BASE_URL) or fall back to local backend
// Example: VITE_API_BASE_URL=http://api.example.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiService = {
  // Health check
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },
  // User operations
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  async getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    return response.json();
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  },

  async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    return response.ok;
  },
  // Request operations
  async getRequests(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/requests${qs ? '?' + qs : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  async createRequest(data) {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create request');
    return response.json();
  },

  async updateRequest(id, data) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update request');
    return response.json();
  },

  async deleteRequest(id) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete request');
    return response.json();
  },
};
