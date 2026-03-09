import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './lib/store';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/Layout';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NewObjective from './pages/NewObjective';
import ObjectiveDetail from './pages/ObjectiveDetail';
import History from './pages/History';
import Score from './pages/Score';
import Profile from './pages/Profile';
import Cercles from './pages/Cercles';
import CercleDetail from './pages/CercleDetail';
import { api } from './lib/api';
import { initOneSignal } from './lib/oneSignal';

function HomeRoute() {
  const { state } = useApp();
  if (state.token) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

function OnboardingRoute() {
  const { state } = useApp();
  const onboarded = localStorage.getItem('bonplan_onboarded');
  if (state.token) return <Navigate to="/dashboard" replace />;
  if (onboarded) return <Navigate to="/auth" replace />;
  return <OnboardingPage />;
}

function AuthRoute() {
  const { state } = useApp();
  const onboarded = localStorage.getItem('bonplan_onboarded');
  if (state.token) return <Navigate to="/" replace />;
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <AuthPage />;
}

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

  if (!state.token) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/objective/new" element={<NewObjective />} />
                  <Route path="/objective/:id" element={<ObjectiveDetail />} />
                  <Route path="/cercles" element={<Cercles />} />
                  <Route path="/cercle/:id" element={<CercleDetail />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/score" element={<Score />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
  useEffect(() => {
    initOneSignal(import.meta.env.VITE_ONESIGNAL_APP_ID);
  }, []);

  return (
    <AppProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AppProvider>
  );
}
