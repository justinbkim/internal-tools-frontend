import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { FeatureFlag } from '../types';
import { 
  User, 
  Settings, 
  Power, 
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Globe,
  Sliders
} from 'lucide-react';

const FeatureFlags: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [environmentFilter, setEnvironmentFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const params: any = {};
        if (environmentFilter) params.environment = environmentFilter;
        
        const response = await apiClient.getFeatureFlags(params);
        setFlags(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch feature flags:', error);
        setLoading(false);
      }
    };

    fetchFlags();
  }, [environmentFilter]);

  const handleToggle = async (key: string) => {
    try {
      await apiClient.toggleFeatureFlag(key);
      // Refresh flags
      const response = await apiClient.getFeatureFlags();
      setFlags(response.data);
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'dev': return 'bg-blue-100 text-blue-700';
      case 'staging': return 'bg-purple-100 text-purple-700';
      case 'prod': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRolloutColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-600 bg-gray-50';
    if (percentage === 100) return 'text-emerald-600 bg-emerald-50';
    if (percentage >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-amber-600 bg-amber-50';
  };

  const filteredFlags = flags.filter(flag => 
    flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading feature flags...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Settings className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Feature Flags</h1>
                <p className="text-sm text-gray-600">Engineering dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className="text-gray-400">•</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  {userRole?.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Flags</p>
                <p className="text-2xl font-bold text-gray-900">{flags.length}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enabled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {flags.filter(f => f.enabled).length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Power className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Rollout</p>
                <p className="text-2xl font-bold text-gray-900">
                  {flags.filter(f => f.enabled && f.rolloutPercentage > 0 && f.rolloutPercentage < 100).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Sliders className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Production</p>
                <p className="text-2xl font-bold text-gray-900">
                  {flags.filter(f => f.environment === 'prod').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Globe className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -trangray-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by key or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value)}
                className="select-field"
              >
                <option value="">All Environments</option>
                <option value="dev">Development</option>
                <option value="staging">Staging</option>
                <option value="prod">Production</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature Flags Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Key</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Rollout</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Environment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlags.map((flag) => (
                  <tr key={flag.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 font-mono">{flag.key}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{flag.description}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {flag.enabled ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${flag.enabled ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 bg-gray-50'}`}>
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-gray-400" />
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getRolloutColor(flag.rolloutPercentage)}`}>
                          {flag.rolloutPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(flag.environment)}`}>
                        <Globe className="w-3 h-3" />
                        {flag.environment}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(flag.key)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                            flag.enabled 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {flag.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredFlags.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No feature flags found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FeatureFlags;