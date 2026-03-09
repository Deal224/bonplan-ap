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

  const url = `${BASE_URL}${path}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body) : '');

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  console.log(`[API] Response ${res.status}:`, data);

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

  // Transactions — routes réelles dans transactions.js, monté sur /api/transactions
  // POST /api/transactions/:id/deposit  → { amount: int (min 1000), note?: string }
  // POST /api/transactions/:id/withdraw → { amount: int, note?: string }
  deposit: (objectiveId, amount, note) => request(`/transactions/${objectiveId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({
      amount: parseInt(amount, 10),
      ...(note ? { note: String(note) } : {}),
    }),
  }),

  withdraw: (objectiveId, amount, note) => request(`/transactions/${objectiveId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({
      amount: parseInt(amount, 10),
      ...(note ? { note: String(note) } : {}),
    }),
  }),

  getTransactions: (objective_id) =>
    request(`/transactions${objective_id ? `?objective_id=${objective_id}` : ''}`),

  // Payments (Mobile Money via Moneroo — nécessite APP_BASE_URL côté backend)
  initiatePayment: (body) => request('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({
      objective_id: body.objective_id,
      amount: parseInt(body.amount, 10),
      ...(body.phone ? { phone: String(body.phone) } : {}),
    }),
  }),
  getPayments: () => request('/payments'),

  // Score
  getScore: () => request('/score'),
  getPassport: () => request('/score/passport'),

  // Cercles d'épargne (Tontines)
  getTontines: () => request('/tontines'),
  getTontine: (id) => request(`/tontines/${id}`),
  createTontine: (body) => request('/tontines', { method: 'POST', body: JSON.stringify(body) }),
  inviteMember: (id, body) => request(`/tontines/${id}/invite`, { method: 'POST', body: JSON.stringify(body) }),
  tontineDeposit: (id, amount, note) => request(`/tontines/${id}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount: parseInt(amount, 10), ...(note ? { note: String(note) } : {}) }),
  }),
  closeTontine: (id) => request(`/tontines/${id}`, { method: 'DELETE' }),
  leaveTontine: (id) => request(`/tontines/${id}/leave`, { method: 'POST' }),
  approveLeave: (id, body) => request(`/tontines/${id}/approve-leave`, { method: 'POST', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),
};
