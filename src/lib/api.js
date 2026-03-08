const BASE_URL = 'https://bonplan-app-production.up.railway.app/api';

function getToken() {
  return localStorage.getItem('bonplan_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!data.success && data.error) {
    const err = new Error(data.error);
    err.details = data.details;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePin: (body) => request('/auth/change-pin', { method: 'PUT', body: JSON.stringify(body) }),

  // Objectives
  getObjectives: () => request('/objectives'),
  getObjective: (id) => request(`/objectives/${id}`),
  createObjective: (body) => request('/objectives', { method: 'POST', body: JSON.stringify(body) }),
  deleteObjective: (id) => request(`/objectives/${id}`, { method: 'DELETE' }),

  // Payments (deposit via Mobile Money)
  initiatePayment: (body) => request('/payments/initiate', { method: 'POST', body: JSON.stringify(body) }),
  getPayments: () => request('/payments'),

  // Transactions
  getTransactions: (objective_id) =>
    request(`/transactions${objective_id ? `?objective_id=${objective_id}` : ''}`),

  // Score
  getScore: () => request('/score'),
  getPassport: () => request('/score/passport'),
};
