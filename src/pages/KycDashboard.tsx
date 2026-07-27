import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { KycCase } from '../types';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';

const KycDashboard: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [kycCases, setKycCases] = useState<KycCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<KycCase | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [reason, setReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchKycCases();
  }, [filterStatus]);

  const fetchKycCases = async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      
      const response = await apiClient.getKycCases(params);
      setKycCases(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch KYC cases:', error);
      setLoading(false);
    }
  };

  const handleDecide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await apiClient.decideKycCase(selectedCase.id, { decision, reason });
      setDecision('approved');
      setReason('');
      setSelectedCase(null);
      fetchKycCases();
    } catch (error) {
      console.error('Failed to decide KYC case:', error);
      alert('Failed to submit decision. Make sure to provide a reason for rejection.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_review':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'escalated':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xl">Loading KYC cases...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KYC Review Queue</h1>
            <p className="text-sm text-gray-600">
              Logged in as: {user?.name} ({userRole?.replace('_', ' ')})
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="pending_info">Pending Info</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
          </select>
          <div className="text-sm text-gray-600">
            {kycCases.length} cases
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cases List */}
          <div className="space-y-4">
            {kycCases.map((kycCase) => (
              <div
                key={kycCase.id}
                onClick={() => setSelectedCase(kycCase)}
                className={`bg-white p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCase?.id === kycCase.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(kycCase.status)}
                    <span className="font-semibold text-gray-900">{kycCase.applicant_name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(kycCase.risk_score)}`}>
                    Risk: {kycCase.risk_score}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Email:</span> {kycCase.email}
                  </div>
                  <div>
                    <span className="font-medium">Country:</span> {kycCase.country}
                  </div>
                  <div>
                    <span className="font-medium">DOB:</span> {kycCase.dob}
                  </div>
                  <div>
                    <span className="font-medium">Tax ID:</span> {kycCase.tax_id}
                  </div>
                </div>

                {kycCase.flag_reason && (
                  <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {kycCase.flag_reason}
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <span>Status: {kycCase.status.replace('_', ' ')}</span>
                  <span>{new Date(kycCase.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Decision Panel */}
          {selectedCase && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 h-fit sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6" />
                Case Decision
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-medium">Applicant:</span>
                  <span>{selectedCase.applicant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Risk Score:</span>
                  <span className={selectedCase.risk_score >= 70 ? 'text-red-600 font-bold' : ''}>
                    {selectedCase.risk_score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span>{selectedCase.status.replace('_', ' ')}</span>
                </div>
                {selectedCase.decision_reason && (
                  <div className="flex justify-between">
                    <span className="font-medium">Previous Decision:</span>
                    <span>{selectedCase.decision_reason}</span>
                  </div>
                )}
              </div>

              {selectedCase.status === 'new' || selectedCase.status === 'in_review' ? (
                <form onSubmit={handleDecide}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Decision</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="approved"
                          checked={decision === 'approved'}
                          onChange={(e) => setDecision(e.target.value as 'approved' | 'rejected')}
                          className="mr-2"
                        />
                        <span className="text-green-600">Approve</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="rejected"
                          checked={decision === 'rejected'}
                          onChange={(e) => setDecision(e.target.value as 'approved' | 'rejected')}
                          className="mr-2"
                        />
                        <span className="text-red-600">Reject</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Reason {decision === 'rejected' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={decision === 'rejected' ? 'Required for rejection' : 'Optional for approval'}
                      required={decision === 'rejected'}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Submit Decision
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCase(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  This case has already been decided.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycDashboard;
