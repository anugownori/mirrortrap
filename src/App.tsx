import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@/lib/store';
import { Toaster } from '@/components/ui/Toaster';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardShell } from '@/components/DashboardShell';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { DashboardHome } from '@/pages/DashboardHome';
import { ScanPage } from '@/pages/ScanPage';
import { HackersViewPage } from '@/pages/HackersViewPage';
import { PhantomShieldPage } from '@/pages/PhantomShieldPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProtectPage } from '@/pages/ProtectPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardShell />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/hackers-eye" element={<HackersViewPage />} />
              <Route path="/phantomshield" element={<PhantomShieldPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/protect" element={<ProtectPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
