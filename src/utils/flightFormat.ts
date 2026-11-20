export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDepartureTimestamp(raw: string): number {
  if (!raw) return Number.NaN;
  const normalized = raw.replace(' UTC', 'Z').replace(' ', 'T');
  const parsed = Date.parse(normalized);
  if (!Number.isNaN(parsed)) return parsed;
  return Date.parse(raw);
}

export function normalizeDisplayStatus(raw?: string): string {
  const cleaned = (raw || '').trim().toLowerCase();
  if (
    !cleaned ||
    cleaned === 'scheduled' ||
    cleaned === 'on-time' ||
    cleaned === 'ontime'
  ) {
    return 'On-Time';
  }
  if (cleaned === 'delayed') return 'Delayed';
  if (cleaned === 'boarding') return 'Boarding';
  if (cleaned === 'cancelled') return 'Cancelled';
  if (cleaned === 'landed') return 'Landed';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function getStatusBadgeClass(status: string): string {
  switch ((status || '').toLowerCase()) {
    case 'delayed':
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'cancelled':
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'boarding':
      return 'bg-indigo-100 text-indigo-800';
    case 'landed':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-emerald-100 text-emerald-800';
  }
}