// Unified API Service for Gatekeeper

const API_MANAGEMENT_URL = 'http://localhost:8081';
const SMART_GATEWAY_URL = 'http://localhost:8080';
const ANALYTICS_URL = 'http://localhost:8082';

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem('gatekeeper_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch wrapper
const request = async (baseUrl, path, options = {}) => {
  const url = `${baseUrl}${path}`;
  const headers = { ...getAuthHeaders(), ...options.headers };

  try {
    const response = await fetch(url, { ...options, headers });
    const contentType = response.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (data && data.message) || response.statusText || 'Request failed';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
};

export const api = {
  // Auth
  login: async (username, password) => {
    return request(API_MANAGEMENT_URL, '/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  getMe: async () => {
    return request(API_MANAGEMENT_URL, '/api/v1/auth/me');
  },

  registerUser: async (userData) => {
    return request(API_MANAGEMENT_URL, '/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Routes Management
  getRoutes: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(API_MANAGEMENT_URL, `/api/v1/routes${query}`);
  },

  getRouteById: async (id) => {
    return request(API_MANAGEMENT_URL, `/api/v1/routes/${id}`);
  },

  createRoute: async (routeData) => {
    return request(API_MANAGEMENT_URL, '/api/v1/routes', {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  },

  updateRoute: async (id, routeData) => {
    return request(API_MANAGEMENT_URL, `/api/v1/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(routeData)
    });
  },

  toggleRoute: async (id) => {
    return request(API_MANAGEMENT_URL, `/api/v1/routes/${id}/toggle`, {
      method: 'PATCH'
    });
  },

  deleteRoute: async (id) => {
    return request(API_MANAGEMENT_URL, `/api/v1/routes/${id}`, {
      method: 'DELETE'
    });
  },

  // Route Version History & Rollback
  getRouteVersions: async (routeId) => {
    return request(API_MANAGEMENT_URL, `/api/v1/routes/${routeId}/versions`);
  },

  rollbackRoute: async (routeId, targetVersion) => {
    return request(API_MANAGEMENT_URL, `/api/v1/routes/${routeId}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ targetVersion })
    });
  },

  // Organizations
  getOrganizations: async () => {
    return request(API_MANAGEMENT_URL, '/api/v1/organizations');
  },

  createOrganization: async (orgData) => {
    return request(API_MANAGEMENT_URL, '/api/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData)
    });
  },

  // Audit Records
  getAuditRecords: async () => {
    return request(API_MANAGEMENT_URL, '/api/v1/audit-records');
  },

  // Gateway Sync & Status
  syncGateway: async () => {
    return request(SMART_GATEWAY_URL, '/gateway/admin/sync', {
      method: 'POST'
    });
  },

  getGatewayStatus: async () => {
    return request(SMART_GATEWAY_URL, '/gateway/admin/status');
  },

  getGatewayRoutes: async () => {
    return request(SMART_GATEWAY_URL, '/gateway/admin/routes');
  },

  // Interactive Proxy Tester (Playground)
  testGatewayProxy: async (method, path, headers = {}, body = null) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${SMART_GATEWAY_URL}${cleanPath}`;
    const startTime = performance.now();

    const fetchHeaders = { ...headers };
    const options = {
      method,
      headers: fetchHeaders
    };

    if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!fetchHeaders['Content-Type']) {
        fetchHeaders['Content-Type'] = 'application/json';
      }
    }

    try {
      const response = await fetch(url, options);
      const latencyMs = Math.round(performance.now() - startTime);

      const respHeaders = {};
      response.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });

      const contentType = response.headers.get('content-type') || '';
      let respBody;
      if (contentType.includes('application/json')) {
        try {
          respBody = await response.json();
        } catch {
          respBody = await response.text();
        }
      } else {
        respBody = await response.text();
      }

      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        latencyMs,
        headers: respHeaders,
        body: respBody
      };
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        status: 0,
        statusText: 'Network / Connection Error',
        ok: false,
        latencyMs,
        headers: {},
        body: { error: error.message || 'Failed to connect to Smart Gateway' }
      };
    }
  },

  // Analytics
  getAnalyticsOverview: async (timeRange = '1h') => {
    return request(ANALYTICS_URL, `/api/v1/analytics/overview?timeRange=${timeRange}`);
  },

  getAnalyticsTimeseries: async (timeRange = '1h') => {
    return request(ANALYTICS_URL, `/api/v1/analytics/timeseries?timeRange=${timeRange}`);
  },

  getAnalyticsRoutes: async (timeRange = '1h') => {
    return request(ANALYTICS_URL, `/api/v1/analytics/routes?timeRange=${timeRange}`);
  },

  getAnalyticsStatusCodes: async (timeRange = '1h') => {
    return request(ANALYTICS_URL, `/api/v1/analytics/status-codes?timeRange=${timeRange}`);
  },

  getAnalyticsLogs: async (routeId = '', statusCode = '', limit = 100) => {
    const params = new URLSearchParams();
    if (routeId) params.append('routeId', routeId);
    if (statusCode) params.append('statusCode', statusCode);
    if (limit) params.append('limit', limit);
    return request(ANALYTICS_URL, `/api/v1/analytics/logs?${params.toString()}`);
  },

  seedSampleAnalytics: async () => {
    return request(ANALYTICS_URL, '/api/v1/analytics/seed-sample-data', {
      method: 'POST'
    });
  },

  // Service Health checks
  checkHealth: async (baseUrl) => {
    try {
      const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        return { status: 'UP', data: await res.json() };
      }
      return { status: 'DEGRADED', code: res.status };
    } catch (e) {
      return { status: 'DOWN', error: e.message };
    }
  }
};

