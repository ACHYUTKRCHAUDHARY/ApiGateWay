// ═══════════════════════════════════════════════════════════════
// PayGate API Service — real endpoints + typed mock fallbacks
// ═══════════════════════════════════════════════════════════════
import type {
  ApiResponse, AuthResponse, LoginRequest, UserProfile,
  Route, CreateRouteRequest, RouteVersion,
  Organization, AuditRecord,
  AnalyticsOverview, TimeseriesPoint, RouteMetrics, StatusCodeCount, AccessLog,
  GatewayStatus, Transaction, ApiKey, Webhook, WebhookDelivery,
} from '@/types';

const BASE = '';

// In-memory storage cache to prevent expensive synchronous localStorage I/O on every request (Vercel js-cache-storage)
let cachedToken: string | null = null;
let tokenLoaded = false;

export function getToken(): string | null {
  if (!tokenLoaded) {
    cachedToken = localStorage.getItem('pg_token');
    tokenLoaded = true;
  }
  return cachedToken;
}

export function setToken(token: string | null): void {
  cachedToken = token;
  tokenLoaded = true;
  if (token) {
    localStorage.setItem('pg_token', token);
  } else {
    localStorage.removeItem('pg_token');
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function request<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${url}`, { ...opts, headers: { ...authHeaders(), ...opts.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ──
export const authApi = {
  login: (data: LoginRequest) =>
    request<ApiResponse<AuthResponse>>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () =>
    request<ApiResponse<UserProfile>>('/api/v1/auth/me'),
};

// ── Routes (Control Plane) ──
export const routesApi = {
  list: (search?: string) =>
    request<ApiResponse<Route[]>>(`/api/v1/routes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: number) =>
    request<ApiResponse<Route>>(`/api/v1/routes/${id}`),
  create: (data: CreateRouteRequest) =>
    request<ApiResponse<Route>>('/api/v1/routes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CreateRouteRequest>) =>
    request<ApiResponse<Route>>(`/api/v1/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id: number) =>
    request<ApiResponse<Route>>(`/api/v1/routes/${id}/toggle`, { method: 'PATCH' }),
  delete: (id: number) =>
    request<ApiResponse<void>>(`/api/v1/routes/${id}`, { method: 'DELETE' }),
  versions: (routeId: string) =>
    request<ApiResponse<RouteVersion[]>>(`/api/v1/routes/${routeId}/versions`),
  rollback: (routeId: string, targetVersion: number) =>
    request<ApiResponse<Route>>(`/api/v1/routes/${routeId}/rollback`, { method: 'POST', body: JSON.stringify({ targetVersion }) }),
};

// ── Organizations ──
export const orgsApi = {
  list: () => request<ApiResponse<Organization[]>>('/api/v1/organizations'),
  get: (id: number) => request<ApiResponse<Organization>>(`/api/v1/organizations/${id}`),
};

// ── Audit ──
export const auditApi = {
  list: () => request<ApiResponse<AuditRecord[]>>('/api/v1/audit-records'),
};

// ── Analytics ──
export const analyticsApi = {
  overview: (timeRange = '1h') =>
    request<AnalyticsOverview>(`/api/v1/analytics/overview?timeRange=${timeRange}`),
  timeseries: (timeRange = '1h') =>
    request<TimeseriesPoint[]>(`/api/v1/analytics/timeseries?timeRange=${timeRange}`),
  routeMetrics: (timeRange = '1h') =>
    request<RouteMetrics[]>(`/api/v1/analytics/routes?timeRange=${timeRange}`),
  statusCodes: (timeRange = '1h') =>
    request<StatusCodeCount[]>(`/api/v1/analytics/status-codes?timeRange=${timeRange}`),
  logs: (limit = 100) =>
    request<AccessLog[]>(`/api/v1/analytics/logs?limit=${limit}`),
  seed: () =>
    request<{ message: string }>('/api/v1/analytics/seed-sample-data', { method: 'POST' }),
};

// ── Gateway ──
export const gatewayApi = {
  status: () => request<GatewayStatus>('/gateway/admin/status'),
  sync: () => request<{ success: boolean }>('/gateway/admin/sync', { method: 'POST' }),
};

// ═══════════════════════════════════════════════════════════════
// Mock data layer — typed stubs for PayGate-specific features
// that aren't in the backend yet (Transactions, API Keys, Webhooks)
// ═══════════════════════════════════════════════════════════════

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'pay_9xKm2nR4', orderId: 'ORD-2024-8841', amount: 4999_00, currency: 'INR', status: 'CAPTURED', method: 'UPI', customerEmail: 'riya@acme.in', customerName: 'Riya Sharma', timestamp: '2024-11-16T14:32:18+05:30', gatewayRequestId: 'gw_a1b2c3d4', rawJson: { upi_id: 'riya@okaxis', rrn: '432918273645', approval_code: 'A7X92K' } },
  { id: 'pay_7pLq5vT8', orderId: 'ORD-2024-8842', amount: 12500_00, currency: 'INR', status: 'CAPTURED', method: 'Card', customerEmail: 'dev@startup.io', customerName: 'Arjun Mehta', timestamp: '2024-11-16T14:28:05+05:30', gatewayRequestId: 'gw_e5f6g7h8', rawJson: { card_network: 'Visa', last4: '4242', auth_type: 'pin' } },
  { id: 'pay_3mNw8kJ1', orderId: 'ORD-2024-8843', amount: 799_00, currency: 'INR', status: 'DECLINED', declineCode: '05', method: 'Card', customerEmail: 'test@example.com', customerName: 'Kiran Patel', timestamp: '2024-11-16T14:25:41+05:30', gatewayRequestId: 'gw_i9j0k1l2', rawJson: { card_network: 'Mastercard', last4: '5105', decline_reason: 'Do not honor' } },
  { id: 'pay_6dRt9wF2', orderId: 'ORD-2024-8844', amount: 24999_00, currency: 'INR', status: '3DS_REQUIRED', method: 'Card', customerEmail: 'finance@corp.in', customerName: 'Priya Nair', timestamp: '2024-11-16T14:22:33+05:30', gatewayRequestId: 'gw_m3n4o5p6', rawJson: { card_network: 'Visa', last4: '1881', threeds_version: '2.1.0' } },
  { id: 'pay_2bHn4sA5', orderId: 'ORD-2024-8845', amount: 3200_00, currency: 'INR', status: 'REFUNDED', method: 'Netbanking', customerEmail: 'user@mail.com', customerName: 'Sanjay Gupta', timestamp: '2024-11-16T14:18:12+05:30', gatewayRequestId: 'gw_q7r8s9t0', rawJson: { bank: 'HDFC', refund_id: 'rfnd_x1y2z3', refund_amount: 3200_00 } },
  { id: 'pay_1aGm3rE7', orderId: 'ORD-2024-8846', amount: 15000_00, currency: 'INR', status: 'PENDING', method: 'UPI', customerEmail: 'buyer@shop.in', customerName: 'Neha Reddy', timestamp: '2024-11-16T14:15:08+05:30', gatewayRequestId: 'gw_u1v2w3x4', rawJson: { upi_id: 'neha@ybl', status: 'VBV_INITIATED' } },
  { id: 'pay_8xYk1qD9', orderId: 'ORD-2024-8847', amount: 67500_00, currency: 'INR', status: 'CAPTURED', method: 'Card', customerEmail: 'enterprise@big.co', customerName: 'Vikram Singh', timestamp: '2024-11-16T14:10:55+05:30', gatewayRequestId: 'gw_y5z6a7b8', rawJson: { card_network: 'RuPay', last4: '6521', auth_type: 'otp' } },
  { id: 'pay_5wXj0pC6', orderId: 'ORD-2024-8848', amount: 999_00, currency: 'INR', status: 'FAILED', method: 'Wallet', customerEmail: 'mobile@test.in', customerName: 'Anil Kumar', timestamp: '2024-11-16T14:05:22+05:30', gatewayRequestId: 'gw_c9d0e1f2', rawJson: { wallet: 'Paytm', error: 'INSUFFICIENT_BALANCE' } },
];

const MOCK_API_KEYS: ApiKey[] = [
  { id: 'key_live_01', label: 'Production Server', prefix: 'pk_live_', maskedKey: 'pk_live_••••••••••••4xKm', environment: 'live', createdAt: '2024-09-15T10:00:00+05:30', lastUsed: '2024-11-16T14:30:00+05:30', active: true },
  { id: 'key_live_02', label: 'Mobile SDK', prefix: 'pk_live_', maskedKey: 'pk_live_••••••••••••7pLq', environment: 'live', createdAt: '2024-10-01T10:00:00+05:30', lastUsed: '2024-11-15T09:12:00+05:30', active: true },
  { id: 'key_test_01', label: 'Staging Server', prefix: 'pk_test_', maskedKey: 'pk_test_••••••••••••3mNw', environment: 'test', createdAt: '2024-08-20T10:00:00+05:30', lastUsed: '2024-11-16T12:00:00+05:30', active: true },
  { id: 'key_test_02', label: 'CI Pipeline', prefix: 'pk_test_', maskedKey: 'pk_test_••••••••••••9dRt', environment: 'test', createdAt: '2024-11-01T10:00:00+05:30', lastUsed: null, active: false },
];

const MOCK_WEBHOOKS: Webhook[] = [
  { id: 'wh_01', url: 'https://api.acme.in/webhooks/paygate', events: ['payment.captured', 'payment.failed', 'refund.created'], active: true, secret: 'whsec_••••••••NxR4', createdAt: '2024-09-20T10:00:00+05:30' },
  { id: 'wh_02', url: 'https://staging.acme.in/hooks/pay', events: ['payment.captured'], active: false, secret: 'whsec_••••••••Tq8K', createdAt: '2024-10-15T10:00:00+05:30' },
];

const MOCK_DELIVERIES: WebhookDelivery[] = [
  { id: 'del_01', webhookId: 'wh_01', event: 'payment.captured', statusCode: 200, responseTimeMs: 142, success: true, timestamp: '2024-11-16T14:32:19+05:30', payload: { event: 'payment.captured', payment_id: 'pay_9xKm2nR4' } },
  { id: 'del_02', webhookId: 'wh_01', event: 'payment.captured', statusCode: 200, responseTimeMs: 88, success: true, timestamp: '2024-11-16T14:28:06+05:30', payload: { event: 'payment.captured', payment_id: 'pay_7pLq5vT8' } },
  { id: 'del_03', webhookId: 'wh_01', event: 'payment.failed', statusCode: 500, responseTimeMs: 3012, success: false, timestamp: '2024-11-16T14:25:42+05:30', payload: { event: 'payment.failed', payment_id: 'pay_3mNw8kJ1' } },
  { id: 'del_04', webhookId: 'wh_01', event: 'payment.captured', statusCode: 200, responseTimeMs: 95, success: true, timestamp: '2024-11-16T14:10:56+05:30', payload: { event: 'payment.captured', payment_id: 'pay_8xYk1qD9' } },
];

// Simulated async to match real API pattern
function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
}

export const transactionsApi = {
  list: () => mockDelay(MOCK_TRANSACTIONS),
  get: (id: string) => mockDelay(MOCK_TRANSACTIONS.find(t => t.id === id) ?? null),
};

export const apiKeysApi = {
  list: () => mockDelay(MOCK_API_KEYS),
  rotate: (id: string) => mockDelay({ ...MOCK_API_KEYS[0], id, maskedKey: `pk_live_••••••••••••${Math.random().toString(36).slice(2, 6)}` } as ApiKey, 800),
};

export const webhooksApi = {
  list: () => mockDelay(MOCK_WEBHOOKS),
  deliveries: (webhookId: string) => mockDelay(MOCK_DELIVERIES.filter(d => d.webhookId === webhookId)),
  resend: (deliveryId: string) => mockDelay({ success: true, deliveryId }, 600),
};
