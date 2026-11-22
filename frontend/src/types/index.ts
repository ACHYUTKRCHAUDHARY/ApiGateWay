// ═══════════════════════════════════════════════════════════════
// PayGate TypeScript Types
// ═══════════════════════════════════════════════════════════════

// ── Auth ──
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
  organizationName?: string;
  organizationId?: number;
  contactEmail?: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  username: string;
  role: string;
  organizationId: number;
  organizationName: string;
}

export interface UserProfile {
  id: number;
  username: string;
  role: string;
  organizationId: number;
  organizationName: string;
  createdAt: string;
}

// ── API wrapper ──
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ── Routes ──
export interface HeaderRule {
  action: 'ADD' | 'SET' | 'REMOVE';
  headerName: string;
  headerValue?: string;
  applyTo: 'REQUEST' | 'RESPONSE';
}

export interface Route {
  id: number;
  routeId: string;
  organizationId: number;
  organizationName: string;
  name: string;
  pathPattern: string;
  targetBaseUrl: string;
  targetPathPrefix: string;
  requestsPerMinute: number;
  responseTimeoutMs: number;
  idempotencyEnabled: boolean;
  active: boolean;
  configurationVersion: number;
  createdAt: string;
  updatedAt: string;
  allowedMethods: string[];
  headerRules: HeaderRule[];
}

export interface CreateRouteRequest {
  name: string;
  pathPattern: string;
  targetBaseUrl: string;
  targetPathPrefix?: string;
  requestsPerMinute?: number;
  responseTimeoutMs?: number;
  idempotencyEnabled?: boolean;
  allowedMethods?: string[];
  headerRules?: HeaderRule[];
}

export interface RouteVersion {
  id: number;
  routeId: string;
  versionNumber: number;
  changeType: string;
  changedBy: string;
  snapshotJson: string;
  createdAt: string;
}

// ── Organizations ──
export interface Organization {
  id: number;
  name: string;
  displayName: string;
  contactEmail: string;
  tier: string;
  maxRoutesAllowed: number;
  maxRpmPerRoute: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Audit ──
export interface AuditRecord {
  id: number;
  organizationId: number;
  organizationName: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  correlationId: string;
  durationMs: number;
  result: string;
  details: string;
  createdAt: string;
}

// ── Analytics ──
export interface AnalyticsOverview {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  errorRatePercentage: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  activeRoutesCount: number;
}

export interface TimeseriesPoint {
  timestamp: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
}

export interface RouteMetrics {
  routeId: string;
  totalRequests: number;
  errorCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
}

export interface StatusCodeCount {
  statusCode: number;
  count: number;
}

export interface AccessLog {
  id: string;
  requestId: string;
  timestamp: string;
  routeId: string;
  organizationId: number;
  clientIp: string;
  httpMethod: string;
  requestPath: string;
  targetUrl: string;
  statusCode: number;
  latencyMs: number;
  userAgent: string;
  errorMessage: string | null;
}

// ── Gateway ──
export interface GatewayStatus {
  service: string;
  status: string;
  uptimeMs: number;
  activeRoutesCount: number;
  lastSyncTimestamp: number;
}

// ── Transactions (PayGate-specific, mock layer) ──
export type TransactionStatus =
  | 'CAPTURED'
  | 'DECLINED'
  | '3DS_REQUIRED'
  | 'REFUNDED'
  | 'PENDING'
  | 'FAILED';

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  method: string;
  customerEmail: string;
  customerName: string;
  declineCode?: string;
  timestamp: string;
  gatewayRequestId: string;
  rawJson: Record<string, unknown>;
}

// ── API Keys (PayGate-specific, mock layer) ──
export interface ApiKey {
  id: string;
  label: string;
  prefix: string;
  maskedKey: string;
  environment: 'live' | 'test';
  createdAt: string;
  lastUsed: string | null;
  active: boolean;
}

// ── Webhooks (PayGate-specific, mock layer) ──
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  statusCode: number;
  responseTimeMs: number;
  success: boolean;
  timestamp: string;
  payload: Record<string, unknown>;
}

// ── Sidebar ──
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}
