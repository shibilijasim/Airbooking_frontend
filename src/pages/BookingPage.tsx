import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../api/axios';
import { FormInput, FormSelect } from '../components/FormFields';
import RouteSummaryCard from '../components/RouteSummaryCard';
import { useFormFields } from '../hooks/useFormFields';
import type { LiveFlight } from './FlightSearch';

interface Passenger {
  full_name: string;
  age: string;
  gender: string;
  passport_number: string;
}

interface ConfirmedBooking {
  id: number;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  ticket_count: number;
  total_price: string;
  status: string;
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const PAYMENT_OPTIONS = [
  { label: 'Credit / Debit Card', value: 'Card' },
  { label: 'UPI / Instant Transfer', value: 'UPI' },
  { label: 'Travel Wallet', value: 'Wallet' },
];

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    flight: LiveFlight;
    ticketCount: number;
  } | null;

  const { values: checkout, handleChange: handleCheckoutChange } = useFormFields({
    contactEmail: '',
    contactPhone: '',
    paymentMethod: 'Card',
    cardholderName: '',
    cardNumber: '',
    cardExpiry: '',
  });

  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: state?.ticketCount || 1 }, () => ({
      full_name: '',
      age: '',
      gender: 'Male',
      passport_number: '',
    }))
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] =
    useState<ConfirmedBooking | null>(null);

  if (!state?.flight) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl border text-center space-y-4">
        <p className="text-gray-600">No flight selected.</p>
        <button
          onClick={() => navigate('/search')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          Back to Flight Search
        </button>
      </div>
    );
  }

  const { flight, ticketCount } = state;
  const totalPrice = Number(flight.price) * ticketCount;

  const handlePassengerChange = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const response = await axiosPrivate.post('bookings/', {
        flight_number: flight.flight_number,
        departure_airport: flight.departure_airport,
        arrival_airport: flight.arrival_airport,
        departure_time: flight.departure_time,
        travel_hours: flight.travel_hours,
        ticket_count: ticketCount,
        total_price: totalPrice.toFixed(2),
        contact_email: checkout.contactEmail,
        contact_phone: checkout.contactPhone,
        passengers,
      });

      setConfirmedBooking(response.data);
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error ||
          error.response?.data?.detail ||
          'Failed to complete booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-sm border border-green-200 space-y-6">
        <div className="border-b pb-4">
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded uppercase">
            Booking Confirmed
          </span>
          <h2 className="text-3xl font-bold mt-3 text-gray-900">
            Reference #{confirmedBooking.id}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Payment processed via {checkout.paymentMethod}. Your booking is
            confirmed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
          <div>
            <p className="text-gray-500">Route</p>
            <p className="font-bold text-gray-900">
              {confirmedBooking.departure_airport} &rarr;{' '}
              {confirmedBooking.arrival_airport}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Flight</p>
            <p className="font-bold text-gray-900">
              {confirmedBooking.flight_number}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Tickets</p>
            <p className="font-bold text-gray-900">
              {confirmedBooking.ticket_count}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Amount Paid</p>
            <p className="font-bold text-blue-600">
              ${Number(confirmedBooking.total_price).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/my-trips', { replace: true })}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Go to My Trips
          </button>
          <button
            onClick={() => navigate('/search')}
            className="px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-colors"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Booking &amp; Payment</h2>
        <button
          onClick={() => navigate('/flights/select', { state: { flight } })}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Flight Selection
        </button>
      </div>

      <RouteSummaryCard
        flightNumber={flight.flight_number}
        departureAirport={flight.departure_airport}
        arrivalAirport={flight.arrival_airport}
        departureTime={flight.departure_time}
        rightLabel={`${ticketCount} ${ticketCount === 1 ? 'Ticket' : 'Tickets'} × $${Number(flight.price).toFixed(2)}`}
        rightValue={`$${totalPrice.toFixed(2)}`}
      />

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleCompleteBooking} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Email"
              name="contactEmail"
              type="email"
              required
              value={checkout.contactEmail}
              onChange={handleCheckoutChange}
            />
            <FormInput
              label="Phone Number"
              name="contactPhone"
              type="tel"
              required
              value={checkout.contactPhone}
              onChange={handleCheckoutChange}
            />
          </div>
        </div>

        {passengers.map((passenger, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold mb-4">Passenger {idx + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                type="text"
                required
                value={passenger.full_name}
                onChange={(e) =>
                  handlePassengerChange(idx, 'full_name', e.target.value)
                }
              />
              <FormInput
                label="Age"
                type="number"
                min={1}
                max={120}
                required
                value={passenger.age}
                onChange={(e) =>
                  handlePassengerChange(idx, 'age', e.target.value)
                }
              />
              <FormSelect
                label="Gender"
                options={GENDER_OPTIONS}
                value={passenger.gender}
                onChange={(e) =>
                  handlePassengerChange(idx, 'gender', e.target.value)
                }
              />
              <FormInput
                label="Passport / ID Number"
                type="text"
                required
                uppercase
                value={passenger.passport_number}
                onChange={(e) =>
                  handlePassengerChange(idx, 'passport_number', e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Payment</h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded font-semibold">
              Checkout
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Payment Method"
              name="paymentMethod"
              options={PAYMENT_OPTIONS}
              value={checkout.paymentMethod}
              onChange={handleCheckoutChange}
            />
            <FormInput
              label="Cardholder / Payer Name"
              name="cardholderName"
              type="text"
              required
              placeholder="Full name"
              value={checkout.cardholderName}
              onChange={handleCheckoutChange}
            />
            <FormInput
              label="Card / Reference Number"
              name="cardNumber"
              type="text"
              required
              placeholder="4242 •••• •••• 4242"
              value={checkout.cardNumber}
              onChange={handleCheckoutChange}
            />
            <FormInput
              label="Expiry (MM/YY)"
              name="cardExpiry"
              type="text"
              required
              placeholder="12/28"
              value={checkout.cardExpiry}
              onChange={handleCheckoutChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {submitting
            ? 'Processing Payment & Confirming Booking...'
            : `Pay & Confirm Booking ($${totalPrice.toFixed(2)})`}
        </button>
      </form>
    </div>
  );
}