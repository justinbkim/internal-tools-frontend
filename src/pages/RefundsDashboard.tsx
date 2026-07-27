import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { Refund } from '../types';
import { DollarSign, CheckCircle, XCircle, Clock, AlertTriangle, Send } from 'lucide-react';

const RefundsDashboard: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRefund, setNewRefund] = useState({
    customer_name: '',
    original_txn_id: '',
    amount_cents: '',
    reason_code: '',
  });
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchRefunds();
  }, [filterStatus]);

  const fetchRefunds = async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      
      const response = await apiClient.getRefunds(params);
      setRefunds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
      setLoading(false);
    }
  };

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createRefund({
        ...newRefund,
        amount_cents: parseInt(newRefund.amount_cents),
      });
      setNewRefund({
        customer_name: '',
        original_txn_id: '',
        amount_cents: '',
        reason_code: '',
      });
      setShowCreateForm(false);
      fetchRefunds();
    } catch (error) {
      console.error('Failed to create refund:', error);
      alert('Failed to create refund');
    }
  };

  const handleRequestApproval = async (id: string) => {
    try {
      await apiClient.requestRefund(id);
      fetchRefunds();
    } catch (error) {
      console.error('Failed to request approval:', error);
      alert('Failed to request approval');
    }
  };

  const handleApprove = async (id: string, amountCents: number, requestedBy: string) => {
    // Check separation of duties
    if (amountCents > 50000 && requestedBy === user?.id) {
      alert('Separation of duties: You cannot approve refunds above $500 that you requested.');
      return;
    }

    try {
      await apiClient.approveRefund(id);
      fetchRefunds();
    } catch (error) {
      console.error('Failed to approve refund:', error);
      alert('Failed to approve refund. This may be a separation of duties violation.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'submitted':
        return <Send className="w-5 h-5 text-blue-500" />;
      case 'settled':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAmountColor = (amountCents: number) => {
    if (amountCents > 50000) return 'text-red-600 font-bold';
    if (amountCents > 10000) return 'text-orange-600 font-semibold';
    return 'text-gray-900';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xl">Loading refunds...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Refunds Dashboard</h1>
            <p className="text-sm text-gray-600">
              Logged in as: {user?.name} ({userRole?.replace('_', ' ')})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'New Refund'}
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
        {/* Create Refund Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Refund Request</h2>
            <form onSubmit={handleCreateRefund}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={newRefund.customer_name}
                    onChange={(e) => setNewRefund({ ...newRefund, customer_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Original Transaction ID</label>
                  <input
                    type="text"
                    value={newRefund.original_txn_id}
                    onChange={(e) => setNewRefund({ ...newRefund, original_txn_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (cents)</label>
                  <input
                    type="number"
                    value={newRefund.amount_cents}
                    onChange={(e) => setNewRefund({ ...newRefund, amount_cents: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reason Code</label>
                  <select
                    value={newRefund.reason_code}
                    onChange={(e) => setNewRefund({ ...newRefund, reason_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="service_not_received">Service Not Received</option>
                    <option value="quality_issue">Quality Issue</option>
                    <option value="wrong_item">Wrong Item</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Create Refund
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

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="settled">Settled</option>
            <option value="failed">Failed</option>
          </select>
          <div className="text-sm text-gray-600">
            {refunds.length} refunds
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transaction ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{refund.customer_name}</td>
                  <td className="px-4 py-3 text-sm font-mono">{refund.original_txn_id}</td>
                  <td className={`px-4 py-3 text-sm ${getAmountColor(refund.amount_cents)}`}>
                    ${(refund.amount_cents / 100).toFixed(2)}
                    {refund.amount_cents > 50000 && (
                      <AlertTriangle className="w-4 h-4 inline ml-1 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{refund.reason_code.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(refund.status)}
                      <span className="capitalize">{refund.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {refund.status === 'pending' && userRole === 'support_agent' && (
                        <button
                          onClick={() => handleRequestApproval(refund.id)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          Request
                        </button>
                      )}
                      {refund.status === 'pending' && userRole === 'support_manager' && (
                        <button
                          onClick={() => handleRequestApproval(refund.id)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          Request
                        </button>
                      )}
                      {refund.status === 'submitted' && userRole === 'support_manager' && (
                        <button
                          onClick={() => handleApprove(refund.id, refund.amount_cents, refund.requested_by)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {userRole === 'support_agent' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As a support agent, you can request refunds but cannot approve them.
              Support managers can approve refunds.
            </p>
          </div>
        )}

        {userRole === 'support_manager' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Separation of Duties:</strong> You cannot approve refunds above $500 that you
              requested yourself. Another support manager must approve those.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundsDashboard;
