import React, { Suspense, lazy, ViewTransition } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { SkeletonBlock } from '@/components/ui/Primitives';

// Dynamic code-split page imports (Vercel bundle-dynamic-imports rule)
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const CreateAccountPage = lazy(() => import('@/pages/CreateAccountPage').then((m) => ({ default: m.CreateAccountPage })));

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const ApiKeysPage = lazy(() => import('@/pages/ApiKeysPage').then((m) => ({ default: m.ApiKeysPage })));
const WebhooksPage = lazy(() => import('@/pages/WebhooksPage').then((m) => ({ default: m.WebhooksPage })));
const RoutesPage = lazy(() => import('@/pages/RoutesPage').then((m) => ({ default: m.RoutesPage })));
const OrganizationsPage = lazy(() => import('@/pages/OrganizationsPage').then((m) => ({ default: m.OrganizationsPage })));
const AuditPage = lazy(() => import('@/pages/AuditPage').then((m) => ({ default: m.AuditPage })));

const PageFallback: React.FC = () => (
  <div className="space-y-6 max-w-7xl mx-auto p-4" aria-busy="true" aria-label="Loading page view">
    <SkeletonBlock className="h-20 w-full rounded-[16px]" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBlock key={i} className="h-32 rounded-[16px]" />
      ))}
    </div>
    <SkeletonBlock className="h-64 w-full rounded-[16px]" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user && !localStorage.getItem('pg_token')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense
              fallback={
                <ViewTransition exit="slide-down">
                  <PageFallback />
                </ViewTransition>
              }
            >
              <ViewTransition enter="slide-up" exit="fade-out" default="none">
                <Routes>
                  {/* Public Landing & Auth Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<CreateAccountPage />} />

                  {/* Protected Control Plane Routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/api-keys" element={<ApiKeysPage />} />
                    <Route path="/webhooks" element={<WebhooksPage />} />
                    <Route path="/routes" element={<RoutesPage />} />
                    <Route path="/organizations" element={<OrganizationsPage />} />
                    <Route path="/audit" element={<AuditPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ViewTransition>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
