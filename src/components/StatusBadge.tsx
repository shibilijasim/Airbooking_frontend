import { getStatusBadgeClass } from '../utils/flightFormat';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${getStatusBadgeClass(
        status
      )}`}
    >
      {status || 'On-Time'}
    </span>
  );
}