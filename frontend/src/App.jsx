import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Emergencies from './pages/Emergencies';
import EmergencyDetail from './pages/EmergencyDetail';
import EmergencyTypes from './pages/EmergencyTypes';
import ResetPassword from './pages/ResetPassword';
import MapView from './pages/MapView';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Pages publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin + Agent */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['ADMIN', 'AGENT']}>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/emergencies" element={
            <PrivateRoute roles={['ADMIN', 'AGENT']}>
              <Emergencies />
            </PrivateRoute>
          } />

          <Route path="/emergencies/:id" element={
            <PrivateRoute roles={['ADMIN', 'AGENT']}>
              <EmergencyDetail />
            </PrivateRoute>
          } />

          <Route path="/map" element={
            <PrivateRoute roles={['ADMIN', 'AGENT']}>
              <MapView />
            </PrivateRoute>
          } />

          {/* Admin uniquement */}
          <Route path="/types" element={
            <PrivateRoute roles={['ADMIN']}>
              <EmergencyTypes />
            </PrivateRoute>
          } />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}