import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { FeatureFlag } from '../types';
import { ToggleLeft, ToggleRight, Plus, Edit, Trash2, Server } from 'lucide-react';

const FeatureFlags: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [filterEnvironment, setFilterEnvironment] = useState<string>('');
  const [newFlag, setNewFlag] = useState({
    key: '',
    description: '',
    enabled: false,
    rollout_percentage: 0,
    environment: 'dev' as 'dev' | 'staging' | 'prod',
  });

  useEffect(() => {
    fetchFlags();
  }, [filterEnvironment]);

  const fetchFlags = async () => {
    try {
      const params: any = {};
      if (filterEnvironment) params.environment = filterEnvironment;
      
      const response = await apiClient.getFeatureFlags(params);
      setFlags(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      setLoading(false);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createFeatureFlag(newFlag);
      setNewFlag({
        key: '',
        description: '',
        enabled: false,
        rollout_percentage: 0,
        environment: 'dev',
      });
      setShowCreateForm(false);
      fetchFlags();
    } catch (error) {
      console.error('Failed to create feature flag:', error);
      alert('Failed to create feature flag');
    }
  };

  const handleToggle = async (key: string) => {
    try {
      await apiClient.toggleFeatureFlag(key);
      fetchFlags();
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
      alert('Failed to toggle feature flag');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlag) return;

    try {
      await apiClient.updateFeatureFlag(editingFlag.key, {
        description: editingFlag.description,
        enabled: editingFlag.enabled,
        rollout_percentage: editingFlag.rollout_percentage,
      });
      setEditingFlag(null);
      fetchFlags();
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      alert('Failed to update feature flag');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;

    try {
      await apiClient.deleteFeatureFlag(key);
      fetchFlags();
    } catch (error) {
      console.error('Failed to delete feature flag:', error);
      alert('Failed to delete feature flag');
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'prod':
        return 'bg-red-100 text-red-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xl">Loading feature flags...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feature Flags Admin</h1>
            <p className="text-sm text-gray-600">
              Logged in as: {user?.name} ({userRole?.replace('_', ' ')})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showCreateForm ? 'Cancel' : 'New Flag'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Flag Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Feature Flag</h2>
            <form onSubmit={handleCreateFlag}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Key</label>
                  <input
                    type="text"
                    value={newFlag.key}
                    onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="feature_name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Environment</label>
                  <select
                    value={newFlag.environment}
                    onChange={(e) => setNewFlag({ ...newFlag, environment: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="dev">Development</option>
                    <option value="staging">Staging</option>
                    <option value="prod">Production</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={newFlag.description}
                    onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rollout Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newFlag.rollout_percentage}
                    onChange={(e) => setNewFlag({ ...newFlag, rollout_percentage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newFlag.enabled}
                      onChange={(e) => setNewFlag({ ...newFlag, enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Enabled</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Create Flag
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Flag Form */}
        {editingFlag && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-4">Edit Feature Flag</h2>
            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Key</label>
                  <input
                    type="text"
                    value={editingFlag.key}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={editingFlag.description}
                    onChange={(e) => setEditingFlag({ ...editingFlag, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rollout Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingFlag.rollout_percentage}
                    onChange={(e) => setEditingFlag({ ...editingFlag, rollout_percentage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingFlag.enabled}
                      onChange={(e) => setEditingFlag({ ...editingFlag, enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Enabled</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Update Flag
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFlag(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <select
            value={filterEnvironment}
            onChange={(e) => setFilterEnvironment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Environments</option>
            <option value="dev">Development</option>
            <option value="staging">Staging</option>
            <option value="prod">Production</option>
          </select>
          <div className="text-sm text-gray-600">
            {flags.length} flags
          </div>
        </div>

        {/* Flags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flags.map((flag) => (
            <div key={flag.key} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">{flag.key}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(flag.environment)}`}>
                  {flag.environment}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{flag.description}</p>

              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {flag.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${flag.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{flag.rollout_percentage}% rollout</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(flag.key)}
                  className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  Toggle
                </button>
                <button
                  onClick={() => setEditingFlag(flag)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(flag.key)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Updated: {new Date(flag.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureFlags;
