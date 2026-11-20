import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RouteSummaryCard from '../components/RouteSummaryCard';
import type { LiveFlight } from './FlightSearch';

export default function FlightSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { flight: LiveFlight } | null;

  const [seatCount, setSeatCount] = useState(1);

  if (!state?.flight) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl border text-center space-y-4">
        <p className="text-gray-600">No upcoming flight selected.</p>
        <button
          onClick={() => navigate('/search')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          Back to Flight Search
        </button>
      </div>
    );
  }

  const { flight } = state;
  const maxSeats = Math.max(
    1,
    Math.min(
      10,
      flight.available_seats && flight.available_seats > 0
        ? flight.available_seats
        : 10
    )
  );
  const totalPrice = Number(flight.price) * seatCount;

  const updateSeatCount = (delta: number) => {
    setSeatCount((prev) => Math.max(1, Math.min(maxSeats, prev + delta)));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Flight Selection</h2>
        <button
          onClick={() => navigate('/search')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Flight Search
        </button>
      </div>

      <div className="space-y-6">
        <RouteSummaryCard
          flightNumber={flight.flight_number}
          departureAirport={flight.departure_airport}
          arrivalAirport={flight.arrival_airport}
          departureTime={flight.departure_time}
          status={flight.status || 'On-Time'}
          rightLabel="Fare per Ticket"
          rightValue={`$${Number(flight.price).toFixed(2)}`}
        />

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
            <div>
              <p className="text-gray-500">Departure Time</p>
              <p className="font-semibold text-gray-900">
                {flight.departure_time}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-semibold text-gray-900">
                {flight.travel_hours} hrs
              </p>
            </div>
            <div>
              <p className="text-gray-500">Availability</p>
              <p className="font-semibold text-emerald-700">
                {flight.available_seats !== undefined
                  ? `${flight.available_seats} tickets available`
                  : 'Available'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center border-t pt-6 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Number of Tickets
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateSeatCount(-1)}
                  className="w-9 h-9 rounded-lg border border-gray-300 font-bold hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-lg">
                  {seatCount}
                </span>
                <button
                  type="button"
                  onClick={() => updateSeatCount(1)}
                  className="w-9 h-9 rounded-lg border border-gray-300 font-bold hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">
                Total ({seatCount} {seatCount === 1 ? 'ticket' : 'tickets'})
              </p>
              <p className="text-3xl font-black text-blue-600">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/book', {
                state: { flight, ticketCount: seatCount },
              })
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Continue to Booking
          </button>
        </div>
      </div>
    </div>
  );
}