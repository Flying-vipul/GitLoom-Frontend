import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './context/ThemeProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';

// Pages — lazy-loaded for performance
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/app/DashboardPage';
import ChatPage from './pages/app/ChatPage';
import DocumentsPage from './pages/app/DocumentsPage';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';
import RepositoriesPage from './pages/app/RepositoriesPage';
import RepositoryDetailPage from './pages/app/RepositoryDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected app routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="repositories" element={<RepositoriesPage />} />
                <Route path="repositories/:id" element={<RepositoryDetailPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster
              position="bottom-right"
              theme="dark"
              richColors
              toastOptions={{
                style: {
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-base)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
