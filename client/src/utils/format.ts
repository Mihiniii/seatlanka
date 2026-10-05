const TZ = 'Asia/Colombo';

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: TZ,
  });
}

export function formatDuration(fromIso: string, toIso: string) {
  const mins = Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000);
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
}

export function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString('en-US')}`;
}

/** Today's date in Sri Lanka as YYYY-MM-DD */
export function todayYMD() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

/** 3-letter city code for the ticket, e.g. Colombo -> CMB */
const CODES: Record<string, string> = { colombo: 'CMB', kandy: 'KDY', galle: 'GAL', jaffna: 'JAF', ella: 'ELA' };
export function cityCode(city: string) {
  return CODES[city.toLowerCase()] ?? city.slice(0, 3).toUpperCase();
}
