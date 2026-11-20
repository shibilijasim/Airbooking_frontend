import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import ConfirmActionGroup from '../components/ConfirmActionGroup';
import StatusBadge from '../components/StatusBadge';

interface Passenger {
  full_name: string;
  age: string;
  gender: string;
  passport_number: string;
  status?: string;
}

interface Booking {
  id: number;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  travel_hours: string;
  ticket_count: number;
  total_price: string;
  status: string;
  contact_email: string;
  contact_phone: string;
  passengers: Passenger[];
  booked_at: string;
}

interface LiveStatus {
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  status: string;
  altitude_meters: number;
  speed_kmh: number;
  delayed: number;
  lat: number;
  lng: number;
}

type ConfirmTarget =
  | { bookingId: number; type: 'group' }
  | { bookingId: number; type: 'delete' }
  | { bookingId: number; type: 'passenger'; passengerIndex: number }
  | null;

export default function MyTrips() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const [liveStatuses, setLiveStatuses] = useState<Record<number, LiveStatus>>(
    {}
  );
  const [statusErrors, setStatusErrors] = useState<Record<number, string>>({});
  const [loadingStatusId, setLoadingStatusId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axiosPrivate.get('bookings/');
        setBookings(res.data);
      } catch (error: any) {
        setErrorMsg(
          error.response?.data?.detail || 'Failed to load your bookings.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCheckLiveStatus = async (
    bookingId: number,
    flightNumber: string
  ) => {
    setLoadingStatusId(bookingId);
    setStatusErrors((prev) => ({ ...prev, [bookingId]: '' }));

    try {
      const res = await axiosPrivate.get(`flights/live/${flightNumber}/`);
      setLiveStatuses((prev) => ({ ...prev, [bookingId]: res.data }));
    } catch (error: any) {
      setStatusErrors((prev) => ({
        ...prev,
        [bookingId]:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          'Unable to fetch live flight status.',
      }));
    } finally {
      setLoadingStatusId(null);
    }
  };

  const handleCancel = async (bookingId: number, passengerIndex?: number) => {
    const key =
      passengerIndex !== undefined
        ? `${bookingId}-p-${passengerIndex}`
        : `${bookingId}-group`;

    setActionKey(key);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload =
        passengerIndex !== undefined ? { passenger_index: passengerIndex } : {};
      const res = await axiosPrivate.post(
        `bookings/${bookingId}/cancel/`,
        payload
      );

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? res.data : b))
      );
      setSuccessMsg(
        passengerIndex !== undefined
          ? 'Passenger ticket cancelled successfully.'
          : 'Group booking cancelled successfully.'
      );
      setConfirmTarget(null);
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          'Failed to cancel ticket.'
      );
    } finally {
      setActionKey(null);
    }
  };

  const handleDelete = async (bookingId: number) => {
    const key = `${bookingId}-delete`;
    setActionKey(key);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axiosPrivate.delete(`bookings/${bookingId}/`);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setSuccessMsg('Cancelled trip deleted permanently.');
      setConfirmTarget(null);
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          'Failed to delete trip.'
      );
    } finally {
      setActionKey(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading your trips...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Trips</h2>
        <button
          onClick={() => navigate('/search')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Search Flights
        </button>
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

      {bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border text-center text-gray-500">
          You have no bookings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'Cancelled';
            const activePassengers = booking.passengers.filter(
              (p) => p.status !== 'Cancelled'
            );
            const isGroupBooking = activePassengers.length >= 2;
            const isConfirmingGroup =
              confirmTarget?.bookingId === booking.id &&
              confirmTarget.type === 'group';
            const isConfirmingDelete =
              confirmTarget?.bookingId === booking.id &&
              confirmTarget.type === 'delete';

            const liveData = liveStatuses[booking.id];
            const liveError = statusErrors[booking.id];

            return (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4"
              >
                <div className="flex flex-wrap justify-between items-start border-b pb-4 gap-4">
                  <div>
                    <StatusBadge status={booking.status} />
                    <h3 className="text-2xl font-bold mt-2">
                      {booking.departure_airport} &rarr;{' '}
                      {booking.arrival_airport}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Flight {booking.flight_number} &bull; Departure:{' '}
                      {booking.departure_time} &bull; {booking.travel_hours} hrs
                    </p>
                  </div>

                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        {booking.ticket_count}{' '}
                        {booking.ticket_count === 1
                          ? 'Active Ticket'
                          : 'Active Tickets'}
                      </p>
                      <p className="text-2xl font-black text-blue-600">
                        ${Number(booking.total_price).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      {!isCancelled && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleCheckLiveStatus(
                                booking.id,
                                booking.flight_number
                              )
                            }
                            disabled={loadingStatusId === booking.id}
                            className="border border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {loadingStatusId === booking.id
                              ? 'Checking...'
                              : liveData
                              ? 'Refresh Status'
                              : 'Check Live Status'}
                          </button>

                          <ConfirmActionGroup
                            isConfirming={isConfirmingGroup}
                            isProcessing={actionKey === `${booking.id}-group`}
                            triggerLabel={
                              isGroupBooking ? 'Cancel Group' : 'Cancel Ticket'
                            }
                            confirmLabel="Confirm Cancel"
                            processingLabel="Cancelling..."
                            cancelLabel="Keep"
                            variant="red"
                            onStartConfirm={() =>
                              setConfirmTarget({
                                bookingId: booking.id,
                                type: 'group',
                              })
                            }
                            onConfirm={() => handleCancel(booking.id)}
                            onCancel={() => setConfirmTarget(null)}
                          />
                        </>
                      )}

                      {isCancelled && (
                        <ConfirmActionGroup
                          isConfirming={isConfirmingDelete}
                          isProcessing={actionKey === `${booking.id}-delete`}
                          triggerLabel="Delete Trip"
                          confirmLabel="Confirm Delete"
                          processingLabel="Deleting..."
                          cancelLabel="Keep"
                          variant="red"
                          onStartConfirm={() =>
                            setConfirmTarget({
                              bookingId: booking.id,
                              type: 'delete',
                            })
                          }
                          onConfirm={() => handleDelete(booking.id)}
                          onCancel={() => setConfirmTarget(null)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {!isCancelled && liveError && (
                  <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-200">
                    {liveError}
                  </div>
                )}

                {!isCancelled && liveData && (
                  <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-blue-800 tracking-wide">
                        Live Flight Status
                      </span>
                      <StatusBadge status={liveData.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Delay</p>
                        <p className="font-semibold text-gray-900">
                          {liveData.delayed
                            ? `${liveData.delayed} mins`
                            : 'On Time'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Altitude</p>
                        <p className="font-semibold text-gray-900">
                          {liveData.altitude_meters} m
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Speed</p>
                        <p className="font-semibold text-gray-900">
                          {liveData.speed_kmh} km/h
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Coordinates</p>
                        <p className="font-semibold text-gray-900">
                          {liveData.lat}, {liveData.lng}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Passengers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {booking.passengers.map((p, idx) => {
                      const passengerCancelled =
                        isCancelled || p.status === 'Cancelled';
                      const isConfirmingPassenger =
                        confirmTarget?.bookingId === booking.id &&
                        confirmTarget.type === 'passenger' &&
                        confirmTarget.passengerIndex === idx;
                      const pKey = `${booking.id}-p-${idx}`;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg text-sm flex justify-between items-center gap-3 ${
                            passengerCancelled
                              ? 'bg-red-50/60 border border-red-100'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div>
                            <p
                              className={`font-semibold ${
                                passengerCancelled
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-900'
                              }`}
                            >
                              {p.full_name}
                            </p>
                            <p className="text-gray-600 text-xs">
                              Age: {p.age} &bull; {p.gender} &bull; ID:{' '}
                              {p.passport_number}
                            </p>
                          </div>

                          <div>
                            {passengerCancelled ? (
                              <span className="text-xs font-bold text-red-600 uppercase">
                                Cancelled
                              </span>
                            ) : isGroupBooking ? (
                              <ConfirmActionGroup
                                isConfirming={isConfirmingPassenger}
                                isProcessing={actionKey === pKey}
                                triggerLabel="Cancel"
                                confirmLabel="Confirm"
                                processingLabel="..."
                                cancelLabel="Keep"
                                variant="red"
                                onStartConfirm={() =>
                                  setConfirmTarget({
                                    bookingId: booking.id,
                                    type: 'passenger',
                                    passengerIndex: idx,
                                  })
                                }
                                onConfirm={() => handleCancel(booking.id, idx)}
                                onCancel={() => setConfirmTarget(null)}
                              />
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}