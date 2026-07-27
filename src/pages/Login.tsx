import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { User } from '../types';

const Login: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.getUsers();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Internal Tools Login</h1>
        <p className="text-gray-600 mb-4 text-center text-sm">
          Select a user to simulate authentication (stubbed auth)
        </p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <button
            type="submit"
            disabled={!selectedUser}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          <p className="font-semibold mb-2">Available Roles:</p>
          <ul className="space-y-1">
            <li>• compliance_analyst - KYC review (assigned cases only)</li>
            <li>• compliance_manager - KYC management (all cases)</li>
            <li>• support_agent - Refunds (request only)</li>
            <li>• support_manager - Refunds (approve)</li>
            <li>• engineer - Feature flags management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
