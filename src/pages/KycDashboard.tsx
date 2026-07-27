import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { KycCase, User } from '../types';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowUpRight,
  Search,
  Filter,
  FileText,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';

const KycDashboard: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  console.log('KycDashboard rendering, user:', user, 'userRole:', userRole);
  const [kycCases, setKycCases] = useState<KycCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCaseForAssign, setSelectedCaseForAssign] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  useEffect(() => {
    const fetchKycCases = async () => {
      try {
        console.log('Fetching KYC cases with params:', { statusFilter, userRole, userId: user?.id });
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        if (userRole === 'compliance_analyst') {
          params.assignedTo = user?.id;
        }
        
        const response = await apiClient.getKycCases(params);
        console.log('KYC cases fetched:', response.data);
        setKycCases(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch KYC cases:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchKycCases();
    } else {
      console.log('No user, skipping fetch');
      setLoading(false);
    }
  }, [statusFilter, userRole, user?.id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users for manager...');
        const response = await apiClient.getUsers();
        console.log('Users fetched:', response.data);
        // Filter to only compliance roles
        const complianceUsers = response.data.filter(u => 
          u.role === 'compliance_analyst' || u.role === 'compliance_manager'
        );
        console.log('Compliance users:', complianceUsers);
        setAllUsers(complianceUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Don't break the whole dashboard if user fetch fails
        setAllUsers([]);
      }
    };

    if (userRole === 'compliance_manager') {
      fetchUsers();
    }
  }, [userRole]);

  const handleDecision = async (caseId: string, decision: 'approved' | 'rejected') => {
    const reason = prompt(`Enter reason for ${decision}:`);
    if (reason) {
      try {
        await apiClient.decideKycCase(caseId, { decision, reason });
        // Refresh cases
        const response = await apiClient.getKycCases();
        setKycCases(response.data);
      } catch (error) {
        console.error('Failed to decide case:', error);
      }
    }
  };

  const handleAssign = async (caseId: string) => {
    setSelectedCaseForAssign(caseId);
    setSelectedAssignee('');
    setAssignModalOpen(true);
  };

  const confirmAssign = async () => {
    if (!selectedCaseForAssign || !selectedAssignee) return;

    try {
      await apiClient.updateKycCase(selectedCaseForAssign, { 
        status: 'in_review',
        assignedTo: selectedAssignee 
      });
      // Refresh cases
      const response = await apiClient.getKycCases();
      setKycCases(response.data);
      setAssignModalOpen(false);
      setSelectedCaseForAssign(null);
      setSelectedAssignee('');
    } catch (error) {
      console.error('Failed to assign case:', error);
      alert('Failed to assign case. Check console for details.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-700';
      case 'in_review': return 'bg-blue-100 text-blue-700';
      case 'pending_info': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'escalated': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'in_review': return <Search className="w-4 h-4" />;
      case 'pending_info': return <AlertTriangle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'escalated': return <ArrowUpRight className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'text-red-600 bg-red-50';
    if (riskScore >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const filteredCases = kycCases.filter(kycCase => 
    (kycCase.applicantName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (kycCase.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading KYC cases...</div>
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
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">KYC Review</h1>
                <p className="text-sm text-gray-600">Compliance dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className="text-gray-400">•</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
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
                <p className="text-sm text-gray-600 mb-1">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{kycCases.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kycCases.filter(c => c.status === 'in_review').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kycCases.filter(c => c.status === 'approved').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kycCases.filter(c => c.riskScore >= 70).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select-field"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="pending_info">Pending Info</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
          </div>
        </div>

        {/* KYC Cases Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Applicant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Risk Score</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Country</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Assigned To</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((kycCase) => (
                  <tr key={kycCase.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{kycCase.applicantName || 'Unknown'}</div>
                        <div className="text-sm text-gray-600">{kycCase.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(kycCase.status)}`}>
                        {getStatusIcon(kycCase.status)}
                        {kycCase.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getRiskColor(kycCase.riskScore || 0)}`}>
                          {kycCase.riskScore || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{kycCase.country || 'Unknown'}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {kycCase.assignedTo || 'Unassigned'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {kycCase.status === 'in_review' && (
                          <>
                            <button
                              onClick={() => handleDecision(kycCase.id, 'approved')}
                              className="btn-success text-xs px-3 py-1"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecision(kycCase.id, 'rejected')}
                              className="btn-danger text-xs px-3 py-1"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {kycCase.status === 'new' && userRole === 'compliance_manager' && (
                          <button 
                            onClick={() => handleAssign(kycCase.id)}
                            className="btn-primary text-xs px-3 py-1"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No KYC cases found</p>
            </div>
          )}
        </div>

        {/* Assign Modal */}
        {assignModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign KYC Case</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Assignee
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Choose a compliance user...</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssign}
                  disabled={!selectedAssignee}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KycDashboard;