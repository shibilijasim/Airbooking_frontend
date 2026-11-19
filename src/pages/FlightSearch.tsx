import { useState, useEffect, useCallback } from 'react';
import { axiosPrivate } from '../api/axios';
import { useNavigate } from 'react-router-dom';

export interface LiveFlight {
  id?: number;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  price: number;
  status: string;
  travel_hours: number;
  available_seats?: number;
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDepartureTimestamp(raw: string): number {
  if (!raw) return Number.NaN;
  const normalized = raw.replace(' UTC', 'Z').replace(' ', 'T');
  const parsed = Date.parse(normalized);
  if (!Number.isNaN(parsed)) return parsed;
  return Date.parse(raw);
}

function normalizeDisplayStatus(raw?: string): string {
  const cleaned = (raw || '').trim().toLowerCase();
  if (!cleaned || cleaned === 'scheduled' || cleaned === 'on-time' || cleaned === 'ontime') {
    return 'On-Time';
  }
  if (cleaned === 'delayed') {
    return 'Delayed';
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function isEligibleFlight(flight: LiveFlight, todayStr: string, exactDate: string): boolean {
  const statusLower = (flight.status || '').toLowerCase().trim();
  if (statusLower.includes('arrived')) {
    return false;
  }

  const seats = flight.available_seats ?? 18;
  if (seats <= 0) {
    return false;
  }

  if (flight.departure_time) {
    const datePart = flight.departure_time.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart) && datePart < todayStr) {
      return false;
    }
    if (exactDate && !flight.departure_time.startsWith(exactDate)) {
      return false;
    }
  } else if (exactDate) {
    return false;
  }

  return true;
}

export default function FlightSearch() {
  const navigate = useNavigate();
  const todayStr = getTodayDateString();

  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters: airport, date (from current date onward), min seats, price, travel hours
  const [departure, setDeparture] = useState('CCJ');
  const [arrival, setArrival] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [minSeats, setMinSeats] = useState('1');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxHours, setMaxHours] = useState('');

  // Sort States
  const [sortBy, setSortBy] = useState('departure_time');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchFlights = useCallback(
    async (overrides?: {
      departure?: string;
      arrival?: string;
      flightDate?: string;
      minSeats?: string;
      minPrice?: string;
      maxPrice?: string;
      maxHours?: string;
      sortBy?: string;
      sortOrder?: string;
      silent?: boolean;
    }) => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const depVal = (
        overrides?.departure !== undefined ? overrides.departure : departure
      )
        .trim()
        .toUpperCase();
      const arrVal = (
        overrides?.arrival !== undefined ? overrides.arrival : arrival
      )
        .trim()
        .toUpperCase();
      const dateVal =
        overrides?.flightDate !== undefined ? overrides.flightDate : flightDate;
      const seatsVal =
        overrides?.minSeats !== undefined ? overrides.minSeats : minSeats;
      const activeSortBy =
        overrides?.sortBy !== undefined ? overrides.sortBy : sortBy;
      const activeSortOrder =
        overrides?.sortOrder !== undefined ? overrides.sortOrder : sortOrder;

      if (!depVal && !arrVal) {
        setErrorMsg(
          'Please enter at least a Departure or Arrival airport IATA code (e.g., CCJ, COK).'
        );
        setFlights([]);
        return;
      }

      if (!overrides?.silent) {
        setLoading(true);
      }
      setErrorMsg('');

      try {
        const params: Record<string, string> = {
          departure: depVal,
          arrival: arrVal,
          from_date: dateVal || todayStr,
          min_price:
            overrides?.minPrice !== undefined ? overrides.minPrice : minPrice,
          max_price:
            overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice,
          max_hours:
            overrides?.maxHours !== undefined ? overrides.maxHours : maxHours,
          sort_by: activeSortBy,
          sort_order: activeSortOrder,
        };
        if (dateVal) params.date = dateVal;
        if (seatsVal) params.min_seats = seatsVal;

        const response = await axiosPrivate.get('flights/live-search/', {
          params,
        });
        const rawList: LiveFlight[] = Array.isArray(response.data)
          ? response.data
          : [];

        const seenKeys = new Set<string>();
        const requiredSeats = Math.max(1, Number(seatsVal || '1'));

        let list: LiveFlight[] = [];
        for (const f of rawList) {
          const seats =
            typeof f.available_seats === 'number' ? f.available_seats : 18;
          const normalizedFlight: LiveFlight = {
            ...f,
            status: normalizeDisplayStatus(f.status),
            available_seats: seats,
          };

          if (!isEligibleFlight(normalizedFlight, todayStr, dateVal)) {
            continue;
          }
          if (seats < requiredSeats) {
            continue;
          }

          const dedupeKey = `${normalizedFlight.flight_number}-${normalizedFlight.departure_airport}-${normalizedFlight.arrival_airport}-${normalizedFlight.departure_time}`;
          if (seenKeys.has(dedupeKey)) {
            continue;
          }
          seenKeys.add(dedupeKey);
          list.push(normalizedFlight);
        }

        list = [...list].sort((a, b) => {
          if (activeSortBy === 'departure_time') {
            const tsA = parseDepartureTimestamp(a.departure_time);
            const tsB = parseDepartureTimestamp(b.departure_time);
            const safeA = Number.isNaN(tsA) ? Number.MAX_SAFE_INTEGER : tsA;
            const safeB = Number.isNaN(tsB) ? Number.MAX_SAFE_INTEGER : tsB;
            return activeSortOrder === 'desc' ? safeB - safeA : safeA - safeB;
          }

          const valA =
            activeSortBy === 'travel_hours'
              ? Number(a.travel_hours) || 0
              : Number(a.price) || 0;
          const valB =
            activeSortBy === 'travel_hours'
              ? Number(b.travel_hours) || 0
              : Number(b.price) || 0;
          return activeSortOrder === 'desc' ? valB - valA : valA - valB;
        });

        setFlights(list);
      } catch (error: any) {
        if (!overrides?.silent) {
          setErrorMsg(
            error.response?.data?.error ||
              error.response?.data?.detail ||
              'Failed to fetch upcoming flights.'
          );
          setFlights([]);
        }
      } finally {
        if (!overrides?.silent) {
          setLoading(false);
        }
      }
    },
    [
      arrival,
      departure,
      flightDate,
      maxHours,
      maxPrice,
      minPrice,
      minSeats,
      navigate,
      sortBy,
      sortOrder,
      todayStr,
    ]
  );

  // Lightweight background status sync so admin updates patch visible cards in place
  const syncFlightStatuses = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const depVal = departure.trim().toUpperCase();
    const arrVal = arrival.trim().toUpperCase();
    if (!depVal && !arrVal) return;

    try {
      const params: Record<string, string> = {
        departure: depVal,
        arrival: arrVal,
        from_date: flightDate || todayStr,
      };
      if (flightDate) params.date = flightDate;

      const response = await axiosPrivate.get('flights/live-search/', {
        params,
      });
      const latestList: LiveFlight[] = Array.isArray(response.data)
        ? response.data
        : [];

      if (latestList.length === 0) return;

      const byId = new Map<number, string>();
      const byFlightRoute = new Map<string, string>();

      for (const item of latestList) {
        const normalized = normalizeDisplayStatus(item.status);
        if (typeof item.id === 'number') {
          byId.set(item.id, normalized);
        }
        const routeKey = `${(item.flight_number || '').toUpperCase()}|${(
          item.departure_airport || ''
        ).toUpperCase()}|${(item.arrival_airport || '').toUpperCase()}`;
        byFlightRoute.set(routeKey, normalized);
      }

      setFlights((prevFlights) => {
        let changed = false;
        const nextFlights = prevFlights.map((f) => {
          const routeKey = `${(f.flight_number || '').toUpperCase()}|${(
            f.departure_airport || ''
          ).toUpperCase()}|${(f.arrival_airport || '').toUpperCase()}`;

          const nextStatus =
            (typeof f.id === 'number' ? byId.get(f.id) : undefined) ||
            byFlightRoute.get(routeKey);

          if (nextStatus && nextStatus !== f.status) {
            changed = true;
            return { ...f, status: nextStatus };
          }
          return f;
        });

        return changed ? nextFlights : prevFlights;
      });
    } catch {
      // Keep current flight list intact if a background poll fails
    }
  }, [arrival, departure, flightDate, todayStr]);

  useEffect(() => {
    fetchFlights();

    const intervalId = window.setInterval(() => {
      syncFlightStatuses();
    }, 4000);

    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel('airbooking_flight_status')
        : null;

    const handleBroadcast = () => {
      syncFlightStatuses();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'flight_status_updated_at') {
        syncFlightStatuses();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFlightStatuses();
      }
    };

    channel?.addEventListener('message', handleBroadcast);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      channel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      channel?.close();
    };
  }, [fetchFlights, syncFlightStatuses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleClearFilters = () => {
    setDeparture('CCJ');
    setArrival('');
    setFlightDate('');
    setMinSeats('1');
    setMinPrice('');
    setMaxPrice('');
    setMaxHours('');
    setSortBy('departure_time');
    setSortOrder('asc');
    fetchFlights({
      departure: 'CCJ',
      arrival: '',
      flightDate: '',
      minSeats: '1',
      minPrice: '',
      maxPrice: '',
      maxHours: '',
      sortBy: 'departure_time',
      sortOrder: 'asc',
    });
  };

  const handleSelectFlight = (flight: LiveFlight) => {
    navigate('/flights/select', { state: { flight } });
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Filter Sidebar */}
      <div className="w-full md:w-1/4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold">Filter Flights</h2>
          {/* <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear Filters
          </button> */}
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Departure Airport (IATA)
            </label>
            <input
              type="text"
              placeholder="e.g. CCJ"
              className="w-full p-2 border rounded outline-none uppercase"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Arrival Airport (IATA)
            </label>
            <input
              type="text"
              placeholder="e.g. COK"
              className="w-full p-2 border rounded outline-none uppercase"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Travel Date (From {todayStr})
            </label>
            <input
              type="date"
              min={todayStr}
              className="w-full p-2 border rounded outline-none bg-white"
              value={flightDate}
              onChange={(e) => setFlightDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Seat Availability (Min Seats)
            </label>
            <select
              className="w-full p-2 border rounded outline-none bg-white"
              value={minSeats}
              onChange={(e) => setMinSeats(e.target.value)}
            >
              <option value="1">Any Available (1+ seats)</option>
              <option value="2">2+ seats available</option>
              <option value="4">4+ seats available</option>
              <option value="6">6+ seats available</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="$0"
                className="w-full p-2 border rounded outline-none"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="$1000"
                className="w-full p-2 border rounded outline-none"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Max Travel Hours
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="e.g. 5.5"
              className="w-full p-2 border rounded outline-none"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Flights Results */}
      <div className="w-full md:w-3/4 space-y-6">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <p className="text-gray-600 font-medium">
              {flights.length} flights from {flightDate || todayStr}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Status Sync
            </div>
          </div>

          <div className="flex gap-3">
            <select
              className="p-2 border border-gray-300 rounded-lg outline-none bg-gray-50"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="departure_time">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="travel_hours">Sort by Travel Hours</option>
            </select>
            <select
              className="p-2 border border-gray-300 rounded-lg outline-none bg-gray-50"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending &uarr;</option>
              <option value="desc">Descending &darr;</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-lg">
            Loading flights...
          </div>
        ) : flights.length === 0 && !errorMsg ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500">
            No available flights found from {flightDate || todayStr}. Try clearing
            filters or changing the airport or date.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {flights.map((flight, idx) => {
              const lowerStatus = (flight.status || 'On-Time').toLowerCase();
              const isDelayed = lowerStatus === 'delayed';
              const isCancelled = lowerStatus === 'cancelled';
              const isLanded = lowerStatus === 'landed';
              const isUnavailable = isCancelled || isLanded;

              return (
                <div
                  key={`${flight.flight_number}-${flight.departure_time}-${idx}`}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded uppercase ${
                          isDelayed
                            ? 'bg-amber-100 text-amber-800'
                            : isCancelled
                            ? 'bg-red-100 text-red-700'
                            : isLanded
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {flight.status || 'On-Time'}
                      </span>
                      <span className="font-bold text-gray-700">
                        Flight {flight.flight_number}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 items-center bg-gray-50 p-3 rounded-lg mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Departure</p>
                        <p className="text-xl font-bold text-gray-900">
                          {flight.departure_airport || 'N/A'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          {flight.travel_hours} hrs
                        </p>
                        <p className="text-gray-400 font-bold">&rarr;</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Arrival</p>
                        <p className="text-xl font-bold text-gray-900">
                          {flight.arrival_airport || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-medium text-gray-800">
                        Departure:
                      </span>{' '}
                      {flight.departure_time}
                    </p>

                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="text-xs font-medium text-emerald-700">
                        {flight.available_seats} seats available
                      </span>
                      <span className="text-2xl font-black text-blue-600">
                        ${Number(flight.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => handleSelectFlight(flight)}
                    className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isCancelled
                      ? 'Flight Cancelled'
                      : isLanded
                      ? 'Flight Landed'
                      : 'Select Flight'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}