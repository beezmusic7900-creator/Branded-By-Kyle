const SUPABASE_URL = 'https://dxsinzpjaxjurbvstghq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4c2luenBqYXhqdXJidnN0Z2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTg4NDEsImV4cCI6MjA4OTE5NDg0MX0.XpR3Rc_qyF1akZVm24crE7Za19ik6sAR6kIFLJ418RY';

const BASE = `${SUPABASE_URL}/functions/v1/booking-api`;

const hdrs = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

async function call(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${BASE}${path}`;
  console.log('[API]', init.method ?? 'GET', url);
  const res = await fetch(url, { ...init, headers: { ...hdrs, ...(init.headers ?? {}) } });
  return res;
}

async function parseError(_res: Response, text: string, fallback: string): Promise<string> {
  try {
    const p = JSON.parse(text);
    return p?.error ?? p?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export interface CreateBookingPayload {
  name: string;
  email: string;
  phone: string;
  tattoo_style: string;
  description: string;
  preferred_date: string;
}

export interface BookingResult {
  id: string;
  name: string;
  email: string;
  preferred_date: string;
  status: string;
  created_at: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  tattoo_style: string;
  description: string;
  preferred_date: string;
  status: string;
  deposit_paid: boolean;
  created_at: string;
}

export interface BlackoutDate {
  id: string;
  date: string;
  reason?: string;
  created_at: string;
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function apiGetUnavailableDates(): Promise<string[]> {
  const res = await call('/api/bookings/unavailable-dates');
  const text = await res.text();
  console.log('[API] unavailable-dates', res.status, text);
  if (!res.ok) return [];
  try { return JSON.parse(text).dates ?? []; } catch { return []; }
}

export async function apiCreateBooking(payload: CreateBookingPayload): Promise<BookingResult> {
  const res = await call('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
  const text = await res.text();
  console.log('[API] create booking', res.status, text);
  if (!res.ok) throw new Error(await parseError(res, text, 'Failed to create booking'));
  return JSON.parse(text);
}

export async function apiConfirmBooking(bookingId: string): Promise<void> {
  const res = await call(`/api/bookings/${bookingId}/confirm`, { method: 'PATCH' });
  const text = await res.text();
  console.log('[API] confirm booking', res.status, text);
  if (!res.ok) throw new Error(await parseError(res, text, 'Failed to confirm booking'));
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function apiAdminGetBookings(): Promise<Booking[]> {
  const res = await call('/api/admin/bookings');
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function apiAdminUpdateBookingStatus(id: string, status: string): Promise<Booking> {
  const res = await call(`/api/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  const text = await res.text();
  if (!res.ok) throw new Error(await parseError(res, text, 'Failed to update booking'));
  return JSON.parse(text);
}

export async function apiAdminDeleteBooking(id: string): Promise<void> {
  const res = await call(`/api/admin/bookings/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete booking');
}

export async function apiAdminGetBlackoutDates(): Promise<BlackoutDate[]> {
  const res = await call('/api/admin/blackout-dates');
  if (!res.ok) throw new Error('Failed to fetch blackout dates');
  return res.json();
}

export async function apiAdminCreateBlackoutDate(date: string, reason?: string): Promise<BlackoutDate> {
  const res = await call('/api/admin/blackout-dates', { method: 'POST', body: JSON.stringify({ date, reason }) });
  const text = await res.text();
  if (!res.ok) throw new Error(await parseError(res, text, 'Failed to create blackout date'));
  return JSON.parse(text);
}

export async function apiAdminDeleteBlackoutDate(id: string): Promise<void> {
  const res = await call(`/api/admin/blackout-dates/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete blackout date');
}
