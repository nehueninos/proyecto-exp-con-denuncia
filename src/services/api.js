const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token') || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(path, options = {}) {
    const url = API_URL + path;
    const headers = options.headers || {};

    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const opts = {
      credentials: 'include',
      ...options,
      headers,
    };

    const res = await fetch(url, opts);
    const text = await res.text();
    let data = null;

    try {
      if (text) data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    if (!res.ok) {
      const message = (data && data.message) || res.statusText || 'Error en la petición';
      throw new Error(message);
    }

    return data;
  }

  // ✅ LOGIN
  async login({ username, password }) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.token) this.setToken(data.token);
    return data;
  }

  async register({ username, password, name, area }) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, area }),
    });

    if (data.token) this.setToken(data.token);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      this.clearToken();
    }
  }

  // ✅ EXPEDIENTES
  async getExpedientes(filters = {}) {
    let queryString = '';
    if (typeof filters === 'string') queryString = filters;
    else if (typeof filters === 'object' && Object.keys(filters).length)
      queryString = new URLSearchParams(filters).toString();

    if (queryString) queryString = '?' + queryString;

    return this.request(`/expedientes${queryString}`, { method: 'GET' });
  }

  async createExpediente(expediente) {
    return this.request('/expedientes', {
      method: 'POST',
      body: JSON.stringify(expediente),
    });
  }

  // ✅ NUEVO – MIS EXPEDIENTES
  async getMyExpedientes() {
    return this.request('/expedientes/mis-expedientes', {
      method: 'GET',
    });
  }

  // ✅ TRANSFERENCIAS
  async createTransferRequest(expedienteId, toUserId, message = '') {
    return this.request('/transfers/request', {
      method: 'POST',
      body: JSON.stringify({ expedienteId, toUserId, message }),
    });
  }

  async getTransferNotifications() {
    return this.request('/transfers/notifications', { method: 'GET' });
  }

  async acceptTransferRequest(notificationId) {
    return this.request(`/transfers/accept/${notificationId}`, { method: 'POST' });
  }

  async rejectTransferRequest(notificationId) {
    return this.request(`/transfers/reject/${notificationId}`, { method: 'POST' });
  }

  // ✅ NUEVO – PENDIENTES
  async getPendingTransfers() {
    return this.request('/transfers/pendientes', {
      method: 'GET',
    });
  }

  async getUsersByArea(area) {
    return this.request(`/auth/by-area/${area}`, { method: 'GET' });
  }

  async getExpedienteHistory(expedienteId) {
    return this.request(`/users/history/${expedienteId}`, { method: 'GET' });
  }
}

const apiService = new ApiService();
export default apiService;
