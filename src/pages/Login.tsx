import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicUsers } from '../lib/api';
import type { User } from '../types';
import { Shield, Lock, User as UserIcon } from 'lucide-react';

const Login: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getPublicUsers();
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUser);
    if (user) {
      login(user);
      // Navigate based on role
      switch (user.role) {
        case 'compliance_analyst':
        case 'compliance_manager':
          navigate('/kyc');
          break;
        case 'support_agent':
        case 'support_manager':
          navigate('/refunds');
          break;
        case 'engineer':
          navigate('/flags');
          break;
        default:
          navigate('/');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Internal Tools</h1>
          <p className="text-gray-600">Secure platform for operations management</p>
        </div>

        {/* Login Card */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
              <p className="text-sm text-gray-600">Select your user to continue</p>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -trangray-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="select-field pl-10"
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedUser}
              className="btn-primary w-full"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Role Information */}
        <div className="card bg-gray-50 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Roles</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></div>
              <div>
                <span className="font-medium text-gray-900">compliance_analyst</span>
                <span className="text-gray-600"> - KYC review (assigned cases only)</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></div>
              <div>
                <span className="font-medium text-gray-900">compliance_manager</span>
                <span className="text-gray-600"> - KYC management (all cases)</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
              <div>
                <span className="font-medium text-gray-900">support_agent</span>
                <span className="text-gray-600"> - Refunds (request only)</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
              <div>
                <span className="font-medium text-gray-900">support_manager</span>
                <span className="text-gray-600"> - Refunds (approve)</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
              <div>
                <span className="font-medium text-gray-900">engineer</span>
                <span className="text-gray-600"> - Feature flags management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>🔒 Authentication stubbed for demo purposes</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
