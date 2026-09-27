import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, fullName, role) =>
    api.post('/auth/register', { email, password, full_name: fullName, role }),
  getMe: () => api.get('/auth/me'),
};
