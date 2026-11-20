import { useEffect, useState } from 'react';
import { axiosPrivate } from '../api/axios';
import ConfirmActionGroup from '../components/ConfirmActionGroup';
import StatusBadge from '../components/StatusBadge';

interface ReviewUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  date_joined: string;
}

type ConfirmAction = {
  userId: number;
  action: 'approve' | 'reject';
} | null;

export default function AdminDashboard() {
  const [users, setUsers] = useState<ReviewUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    'Pending' | 'Approved' | 'Rejected' | 'All'
  >('Pending');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUsers = async (filter = statusFilter) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosPrivate.get('auth/admin/users/', {
        params: { status: filter },
      });
      setUsers(res.data);
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          'Failed to load users for review.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(statusFilter);
  }, [statusFilter]);

  const handleReviewDecision = async (
    userId: number,
    action: 'approve' | 'reject'
  ) => {
    setProcessingId(userId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axiosPrivate.post(
        `auth/admin/users/${userId}/review/`,
        { action }
      );

      const updated: ReviewUser = res.data;
      setUsers((prev) =>
        statusFilter === 'All'
          ? prev.map((u) => (u.id === userId ? updated : u))
          : prev.filter((u) => u.id !== userId)
      );

      setSuccessMsg(
        action === 'approve'
          ? `User "${updated.username}" approved. Activation email queued via Celery.`
          : `User "${updated.username}" rejected.`
      );
      setConfirmAction(null);
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          'Failed to process review action.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            User Approval Queue
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Review new registrations and activate approved user accounts.
          </p>
        </div>

        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200">
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setConfirmAction(null);
                setStatusFilter(tab);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading user accounts...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
          No {statusFilter.toLowerCase()} users found.
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {u.username}
                  </h3>
                  <StatusBadge status={u.approval_status} />
                </div>
                <p className="text-sm text-gray-600 mt-1">{u.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Registered: {new Date(u.date_joined).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {u.approval_status !== 'Approved' && (
                  <ConfirmActionGroup
                    isConfirming={
                      confirmAction?.userId === u.id &&
                      confirmAction.action === 'approve'
                    }
                    isProcessing={processingId === u.id}
                    triggerLabel="Approve"
                    confirmLabel="Confirm Approve"
                    processingLabel="Approving..."
                    variant="emerald"
                    onStartConfirm={() =>
                      setConfirmAction({ userId: u.id, action: 'approve' })
                    }
                    onConfirm={() => handleReviewDecision(u.id, 'approve')}
                    onCancel={() => setConfirmAction(null)}
                  />
                )}

                {u.approval_status !== 'Rejected' && (
                  <ConfirmActionGroup
                    isConfirming={
                      confirmAction?.userId === u.id &&
                      confirmAction.action === 'reject'
                    }
                    isProcessing={processingId === u.id}
                    triggerLabel="Reject"
                    confirmLabel="Confirm Reject"
                    processingLabel="Rejecting..."
                    variant="red"
                    onStartConfirm={() =>
                      setConfirmAction({ userId: u.id, action: 'reject' })
                    }
                    onConfirm={() => handleReviewDecision(u.id, 'reject')}
                    onCancel={() => setConfirmAction(null)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}