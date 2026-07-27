import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { Refund, User } from '../types';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Send,
  Search,
  Filter,
  CreditCard,
  User as UserIcon
} from 'lucide-react';

const RefundsDashboard: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        if (userRole === 'support_agent') {
          params.requestedBy = user?.id;
        }
        
        console.log('Fetching refunds with params:', params);
        const response = await apiClient.getRefunds(params);
        console.log('Refunds fetched:', response.data);
        setRefunds(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch refunds:', error);
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [statusFilter, userRole, user?.id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.getUsers();
        // Filter to only support roles
        const supportUsers = response.data.filter(u => 
          u.role === 'support_agent' || u.role === 'support_manager'
        );
        setAllUsers(supportUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAllUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const getUserNameById = (userId: string | undefined): string => {
    if (!userId) return 'Unknown';
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  const handleApprove = async (refundId: string) => {
    try {
      await apiClient.approveRefund(refundId);
      // Refresh refunds
      const response = await apiClient.getRefunds();
      setRefunds(response.data);
    } catch (error) {
      console.error('Failed to approve refund:', error);
      alert('Failed to approve refund. You may not have permission or the refund amount requires separation of duties.');
    }
  };

  const handleSubmit = async (refundId: string) => {
    try {
      await apiClient.requestRefund(refundId);
      // Refresh refunds
      const response = await apiClient.getRefunds();
      setRefunds(response.data);
    } catch (error) {
      console.error('Failed to submit refund:', error);
      alert('Failed to submit refund. Check console for details.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'denied': return 'bg-red-100 text-red-700';
      case 'submitted': return 'bg-purple-100 text-purple-700';
      case 'settled': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'denied': return <XCircle className="w-4 h-4" />;
      case 'settled': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAmountColor = (amountCents: number) => {
    if (amountCents >= 50000) return 'text-red-600 bg-red-50';
    if (amountCents >= 10000) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const filteredRefunds = refunds.filter(refund => 
    (refund.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (refund.originalTxnId?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading refunds...</div>
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
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Refunds Management</h1>
                <p className="text-sm text-gray-600">Support dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className="text-gray-400">•</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
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
                <p className="text-sm text-gray-600 mb-1">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{refunds.length}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {refunds.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {refunds.filter(r => r.status === 'approved').length}
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
                <p className="text-sm text-gray-600 mb-1">High Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {refunds.filter(r => r.amountCents >= 50000).length}
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
              <Search className="absolute left-3 top-1/2 -trangray-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name or transaction ID..."
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
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="settled">Settled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Requested By</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{refund.customerName || 'Unknown'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getAmountColor(refund.amountCents || 0)}`}>
                          ${((refund.amountCents || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        {refund.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{refund.reasonCode || 'Unknown'}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-mono">{refund.originalTxnId || 'Unknown'}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {getUserNameById(refund.requestedBy)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {refund.status === 'submitted' && userRole === 'support_manager' && (
                          <button
                            onClick={() => handleApprove(refund.id)}
                            className="btn-success text-xs px-3 py-1"
                          >
                            Approve
                          </button>
                        )}
                        {refund.status === 'pending' && userRole === 'support_agent' && (
                          <button 
                            onClick={() => handleSubmit(refund.id)}
                            className="btn-primary text-xs px-3 py-1"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRefunds.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No refunds found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RefundsDashboard;