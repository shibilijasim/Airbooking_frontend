import StatusBadge from './StatusBadge';

interface RouteSummaryCardProps {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  status?: string;
  rightLabel: string;
  rightValue: string;
}

export default function RouteSummaryCard({
  flightNumber,
  departureAirport,
  arrivalAirport,
  departureTime,
  status,
  rightLabel,
  rightValue,
}: RouteSummaryCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          {status && <StatusBadge status={status} />}
          <span className="text-sm text-gray-500">Flight {flightNumber}</span>
        </div>
        <p className="text-2xl font-bold mt-2 text-gray-900">
          {departureAirport} &rarr; {arrivalAirport}
        </p>
        <p className="text-sm text-gray-600">Departure: {departureTime}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{rightLabel}</p>
        <p className="text-3xl font-black text-blue-600">{rightValue}</p>
      </div>
    </div>
  );
}