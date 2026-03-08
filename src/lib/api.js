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

  // BUG 1 FIX: deposit via POST /api/objectives/:id/deposit
  // amount must be integer (parseInt), phone as string
  deposit: (objectiveId, amount, phone) => {
    const body = { amount: parseInt(amount, 10) };
    if (phone) body.phone = String(phone);
    console.log('[API] Deposit payload:', body);
    return request(`/objectives/${objectiveId}/deposit`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Fallback: initiate via Moneroo payment gateway
  initiatePayment: (body) => {
    const payload = {
      objective_id: body.objective_id,
      amount: parseInt(body.amount, 10),
    };
    if (body.phone) payload.phone = String(body.phone);
    console.log('[API] InitiatePayment payload:', payload);
    return request('/payments/initiate', { method: 'POST', body: JSON.stringify(payload) });
  },

  getPayments: () => request('/payments'),

  // Transactions
  getTransactions: (objective_id) =>
    request(`/transactions${objective_id ? `?objective_id=${objective_id}` : ''}`),

  // Score
  getScore: () => request('/score'),
  getPassport: () => request('/score/passport'),
};
