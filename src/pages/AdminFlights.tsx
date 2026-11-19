import { useEffect, useState } from 'react';
import { axiosPrivate } from '../api/axios';

export interface ManagedFlight {
  id: number;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  travel_hours: number | string;
  price: number | string;
  available_seats: number;
  status: string;
}

const STATUS_OPTIONS = ['On-Time', 'Delayed', 'Boarding', 'Cancelled', 'Landed'];

function getStatusBadgeClass(status: string): string {
  switch ((status || '').toLowerCase()) {
    case 'delayed':
      return 'bg-amber-100 text-amber-800';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'boarding':
      return 'bg-indigo-100 text-indigo-800';
    case 'landed':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-emerald-100 text-emerald-800';
  }
}

export default function AdminFlights() {
  const [flights, setFlights] = useState<ManagedFlight[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [syncAirport, setSyncAirport] = useState('CCJ');
  const [draftStatuses, setDraftStatuses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchFlights = async (
    filterVal = statusFilter,
    options?: { forceSync?: boolean; departure?: string }
  ) => {
    const isSync = Boolean(options?.forceSync);
    if (isSync) {
      setSyncing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg('');

    try {
      const params: Record<string, string> = {};
      if (filterVal !== 'All') {
        params.status = filterVal;
      }
      if (isSync) {
        params.sync = 'true';
        const depCode = (options?.departure ?? syncAirport).trim().toUpperCase();
        if (depCode) {
          params.departure = depCode;
        }
      }

      const res = await axiosPrivate.get('admin/flights/', { params });
      const rawList: ManagedFlight[] = Array.isArray(res.data) ? res.data : [];

      const seenIds = new Set<number>();
      const list: ManagedFlight[] = [];
      for (const item of rawList) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          list.push(item);
        }
      }

      setFlights(list);

      const initialDrafts: Record<number, string> = {};
      for (const f of list) {
        initialDrafts[f.id] = f.status;
      }
      setDraftStatuses(initialDrafts);

      if (isSync) {
        setSuccessMsg(`Synced flights from ${params.departure || 'AirLabs'}.`);
      }
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          'Failed to load flights.'
      );
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchFlights(statusFilter);
  }, [statusFilter]);

  const handleStatusChange = (flightId: number, nextStatus: string) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [flightId]: nextStatus,
    }));
  };

  const notifyUserWindows = (flightId: number, updatedStatus: string) => {
    localStorage.setItem('flight_status_updated_at', String(Date.now()));
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('airbooking_flight_status');
      channel.postMessage({ flightId, status: updatedStatus });
      channel.close();
    }
  };

  const handleUpdateStatus = async (flight: ManagedFlight) => {
    const nextStatus = draftStatuses[flight.id] || flight.status;
    setSavingId(flight.id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axiosPrivate.put(`admin/flights/${flight.id}/status/`, {
        status: nextStatus,
      });

      const updated: ManagedFlight = res.data;
      setFlights((prev) =>
        statusFilter !== 'All' &&
        updated.status.toLowerCase() !== statusFilter.toLowerCase()
          ? prev.filter((item) => item.id !== flight.id)
          : prev.map((item) => (item.id === flight.id ? updated : item))
      );
      setDraftStatuses((prev) => ({
        ...prev,
        [flight.id]: updated.status,
      }));
      notifyUserWindows(flight.id, updated.status);
      setSuccessMsg(
        `Flight ${updated.flight_number} status updated to "${updated.status}".`
      );
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          `Failed to update status for flight ${flight.flight_number}.`
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Flight Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Inspect flight details and update live operational status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              maxLength={4}
              placeholder="IATA (e.g. CCJ)"
              value={syncAirport}
              onChange={(e) => setSyncAirport(e.target.value.toUpperCase())}
              className="w-28 p-2 border border-gray-300 rounded-lg bg-white text-sm uppercase outline-none"
            />
            <button
              type="button"
              disabled={syncing || loading}
              onClick={() =>
                fetchFlights(statusFilter, {
                  forceSync: true,
                  departure: syncAirport,
                })
              }
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Flights'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="flight-status-filter"
              className="text-sm font-medium text-gray-700"
            >
              Status:
            </label>
            <select
              id="flight-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg bg-white text-sm outline-none"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
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
        <div className="text-center py-12 text-gray-500">Loading flights...</div>
      ) : flights.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
          No flights found for the selected status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {flights.map((flight) => {
            const currentDraft = draftStatuses[flight.id] ?? flight.status;
            const hasChanged =
              currentDraft.toLowerCase() !== (flight.status || '').toLowerCase();

            return (
              <div
                key={flight.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-gray-900 text-lg">
                      Flight {flight.flight_number}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${getStatusBadgeClass(
                        flight.status
                      )}`}
                    >
                      {flight.status}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {flight.departure_airport} &rarr; {flight.arrival_airport}
                  </p>
                  <p className="text-sm text-gray-600">
                    Departure: {flight.departure_time} &bull; {flight.travel_hours} hrs &bull;{' '}
                    {flight.available_seats} seats &bull; ${Number(flight.price).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <select
                    aria-label={`Status for ${flight.flight_number}`}
                    value={currentDraft}
                    onChange={(e) => handleStatusChange(flight.id, e.target.value)}
                    className="p-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {!STATUS_OPTIONS.includes(currentDraft) && (
                      <option value={currentDraft}>{currentDraft}</option>
                    )}
                  </select>

                  <button
                    type="button"
                    disabled={!hasChanged || savingId === flight.id}
                    onClick={() => handleUpdateStatus(flight)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingId === flight.id ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}