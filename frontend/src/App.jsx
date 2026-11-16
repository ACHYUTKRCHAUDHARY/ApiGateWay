import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoutesPage } from './pages/RoutesPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { VersionsPage } from './pages/VersionsPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

  const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedRouteForTest, setSelectedRouteForTest] = useState(null);

            if (loading) {
    return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Initializing Gatekeeper Console...</span>
              </div>
          </div>
          );
  }

          if (!isAuthenticated) {
    return <LoginPage />;
  }

          return (
          <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
              <main className="flex-1 overflow-y-auto bg-slate-950/95">
                {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
                {activeTab === 'routes' && (
                  <RoutesPage
                    setActiveTab={setActiveTab}
                    setSelectedRouteForTest={setSelectedRouteForTest}
                  />
                )}
                {activeTab === 'playground' && (
                  <PlaygroundPage selectedRouteForTest={selectedRouteForTest} />
                )}
                {activeTab === 'analytics' && <AnalyticsPage />}
                {activeTab === 'versions' && <VersionsPage />}
                {activeTab === 'organizations' && <OrganizationsPage />}
                {activeTab === 'audit' && <AuditLogsPage />}
              </main>
            </div>
          </div>
          );
};

        export default function App() {
  return (
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        );
}
