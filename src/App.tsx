import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import KycDashboard from './pages/KycDashboard';
import RefundsDashboard from './pages/RefundsDashboard';
import FeatureFlags from './pages/FeatureFlags';

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
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Unauthorized</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
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
