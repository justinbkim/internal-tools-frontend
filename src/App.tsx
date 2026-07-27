import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import KycDashboard from './pages/KycDashboard';
import RefundsDashboard from './pages/RefundsDashboard';
import FeatureFlags from './pages/FeatureFlags';
import { Shield } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const Unauthorized: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="card max-w-md text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
      <p className="text-gray-600 mb-6">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="btn-primary w-full"
      >
        Return to Login
      </button>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/kyc"
        element={
          <ProtectedRoute
            allowedRoles={['compliance_analyst', 'compliance_manager']}
          >
            <KycDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/refunds"
        element={
          <ProtectedRoute
            allowedRoles={['support_agent', 'support_manager']}
          >
            <RefundsDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/flags"
        element={
          <ProtectedRoute allowedRoles={['engineer']}>
            <FeatureFlags />
          </ProtectedRoute>
        }
      />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
