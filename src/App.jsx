import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './lib/store';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NewObjective from './pages/NewObjective';
import ObjectiveDetail from './pages/ObjectiveDetail';
import History from './pages/History';
import Score from './pages/Score';
import Profile from './pages/Profile';
import { api } from './lib/api';

function AuthGuard({ children }) {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.token && !state.user) {
      api.me().then(res => {
        dispatch({ type: 'SET_USER', user: res.user });
      }).catch(() => {
        dispatch({ type: 'LOGOUT' });
      });
    }
  }, [state.token]);

  if (!state.token) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { state } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={state.token ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/objective/new" element={<NewObjective />} />
                  <Route path="/objective/:id" element={<ObjectiveDetail />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/score" element={<Score />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AppProvider>
  );
}
