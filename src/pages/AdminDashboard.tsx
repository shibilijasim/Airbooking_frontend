// export default function AdminDashboard() {
//   return (
//     <div className="w-full max-w-6xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="p-6 border-b border-gray-100">
//           <h2 className="text-xl font-semibold">Pending Approvals</h2>
//         </div>
        
//         {/* Responsive Table Wrapper */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
//                 <th className="p-4 border-b">User ID</th>
//                 <th className="p-4 border-b">Username</th>
//                 <th className="p-4 border-b">Email</th>
//                 <th className="p-4 border-b">Status</th>
//                 <th className="p-4 border-b text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {/* Mock Row */}
//               <tr className="hover:bg-gray-50 transition-colors">
//                 <td className="p-4 text-gray-900">#1042</td>
//                 <td className="p-4 font-medium">john_doe</td>
//                 <td className="p-4 text-gray-500">john@example.com</td>
//                 <td className="p-4">
//                   <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Pending</span>
//                 </td>
//                 <td className="p-4 flex justify-end gap-2">
//                   <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition">
//                     Approve
//                   </button>
//                   <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition">
//                     Reject
//                   </button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState } from 'react';
// import { axiosPrivate } from '../api/axios';

// interface ReviewUser {
//   id: number;
//   username: string;
//   email: string;
//   is_active: boolean;
//   approval_status: 'Pending' | 'Approved' | 'Rejected';
//   date_joined: string;
// }

// type ConfirmAction = {
//   userId: number;
//   action: 'approve' | 'reject';
// } | null;

// export default function AdminDashboard() {
//   const [users, setUsers] = useState<ReviewUser[]>([]);
//   const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState('');
//   const [successMsg, setSuccessMsg] = useState('');
//   const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
//   const [processingId, setProcessingId] = useState<number | null>(null);

//   const fetchUsers = async (filter = statusFilter) => {
//     setLoading(true);
//     setErrorMsg('');
//     try {
//       const res = await axiosPrivate.get('accounts/admin/users/', {
//         params: { status: filter },
//       });
//       setUsers(res.data);
//     } catch (error: any) {
//       setErrorMsg(
//         error.response?.data?.detail ||
//           error.response?.data?.error ||
//           'Failed to load users for review.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers(statusFilter);
//   }, [statusFilter]);

//   const handleReviewDecision = async (userId: number, action: 'approve' | 'reject') => {
//     setProcessingId(userId);
//     setErrorMsg('');
//     setSuccessMsg('');

//     try {
//       const res = await axiosPrivate.post(`accounts/admin/users/${userId}/review/`, {
//         action,
//       });

//       const updated: ReviewUser = res.data;
//       setUsers((prev) =>
//         statusFilter === 'All'
//           ? prev.map((u) => (u.id === userId ? updated : u))
//           : prev.filter((u) => u.id !== userId)
//       );

//       setSuccessMsg(
//         action === 'approve'
//           ? `User "${updated.username}" approved. Activation email queued via Celery.`
//           : `User "${updated.username}" rejected.`
//       );
//       setConfirmAction(null);
//     } catch (error: any) {
//       setErrorMsg(
//         error.response?.data?.error ||
//           error.response?.data?.detail ||
//           'Failed to process review action.'
//       );
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto space-y-6">
//       <div className="flex flex-wrap justify-between items-center gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900">User Approval Queue</h2>
//           <p className="text-sm text-gray-600 mt-1">
//             Review new registrations and activate approved user accounts.
//           </p>
//         </div>

//         <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200">
//           {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => {
//                 setConfirmAction(null);
//                 setStatusFilter(tab);
//               }}
//               className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
//                 statusFilter === tab
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>
//       </div>

//       {errorMsg && (
//         <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
//           {errorMsg}
//         </div>
//       )}

//       {successMsg && (
//         <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
//           {successMsg}
//         </div>
//       )}

//       {loading ? (
//         <div className="text-center py-12 text-gray-500">Loading user accounts...</div>
//       ) : users.length === 0 ? (
//         <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
//           No {statusFilter.toLowerCase()} users found.
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {users.map((u) => {
//             const isConfirmingApprove =
//               confirmAction?.userId === u.id && confirmAction.action === 'approve';
//             const isConfirmingReject =
//               confirmAction?.userId === u.id && confirmAction.action === 'reject';

//             return (
//               <div
//                 key={u.id}
//                 className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4"
//               >
//                 <div>
//                   <div className="flex items-center gap-2.5">
//                     <h3 className="text-lg font-bold text-gray-900">{u.username}</h3>
//                     <span
//                       className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
//                         u.approval_status === 'Approved'
//                           ? 'bg-emerald-100 text-emerald-800'
//                           : u.approval_status === 'Rejected'
//                           ? 'bg-red-100 text-red-700'
//                           : 'bg-amber-100 text-amber-800'
//                       }`}
//                     >
//                       {u.approval_status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600 mt-1">{u.email}</p>
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     Registered: {new Date(u.date_joined).toLocaleString()}
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {u.approval_status !== 'Approved' && (
//                     <>
//                       {isConfirmingApprove ? (
//                         <>
//                           <button
//                             onClick={() => handleReviewDecision(u.id, 'approve')}
//                             disabled={processingId === u.id}
//                             className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50"
//                           >
//                             {processingId === u.id ? 'Approving...' : 'Confirm Approve'}
//                           </button>
//                           <button
//                             onClick={() => setConfirmAction(null)}
//                             className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-lg"
//                           >
//                             Cancel
//                           </button>
//                         </>
//                       ) : (
//                         <button
//                           onClick={() =>
//                             setConfirmAction({ userId: u.id, action: 'approve' })
//                           }
//                           className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
//                         >
//                           Approve
//                         </button>
//                       )}
//                     </>
//                   )}

//                   {u.approval_status !== 'Rejected' && (
//                     <>
//                       {isConfirmingReject ? (
//                         <>
//                           <button
//                             onClick={() => handleReviewDecision(u.id, 'reject')}
//                             disabled={processingId === u.id}
//                             className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50"
//                           >
//                             {processingId === u.id ? 'Rejecting...' : 'Confirm Reject'}
//                           </button>
//                           <button
//                             onClick={() => setConfirmAction(null)}
//                             className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-lg"
//                           >
//                             Cancel
//                           </button>
//                         </>
//                       ) : (
//                         <button
//                           onClick={() =>
//                             setConfirmAction({ userId: u.id, action: 'reject' })
//                           }
//                           className="border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
//                         >
//                           Reject
//                         </button>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import { axiosPrivate } from '../api/axios';

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
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');
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

  const handleReviewDecision = async (userId: number, action: 'approve' | 'reject') => {
    setProcessingId(userId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axiosPrivate.post(`auth/admin/users/${userId}/review/`, {
        action,
      });

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
          <h2 className="text-3xl font-bold text-gray-900">User Approval Queue</h2>
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
        <div className="text-center py-12 text-gray-500">Loading user accounts...</div>
      ) : users.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
          No {statusFilter.toLowerCase()} users found.
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const isConfirmingApprove =
              confirmAction?.userId === u.id && confirmAction.action === 'approve';
            const isConfirmingReject =
              confirmAction?.userId === u.id && confirmAction.action === 'reject';

            return (
              <div
                key={u.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-gray-900">{u.username}</h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                        u.approval_status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.approval_status === 'Rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {u.approval_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Registered: {new Date(u.date_joined).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {u.approval_status !== 'Approved' && (
                    <>
                      {isConfirmingApprove ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReviewDecision(u.id, 'approve')}
                            disabled={processingId === u.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50"
                          >
                            {processingId === u.id ? 'Approving...' : 'Confirm Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmAction(null)}
                            className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({ userId: u.id, action: 'approve' })
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </>
                  )}

                  {u.approval_status !== 'Rejected' && (
                    <>
                      {isConfirmingReject ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReviewDecision(u.id, 'reject')}
                            disabled={processingId === u.id}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg disabled:opacity-50"
                          >
                            {processingId === u.id ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmAction(null)}
                            className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({ userId: u.id, action: 'reject' })
                          }
                          className="border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}