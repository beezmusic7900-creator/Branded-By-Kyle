const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const REST = `${SUPABASE_URL}/rest/v1`;

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'return=representation',
};

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

export async function apiCreateBooking(payload: CreateBookingPayload): Promise<BookingResult> {
  console.log('[API] Creating booking', { name: payload.name, date: payload.preferred_date });
  const res = await fetch(`${REST}/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      tattoo_style: payload.tattoo_style || null,
      description: payload.description || null,
      preferred_date: payload.preferred_date,
      status: 'pending_payment',
      deposit_paid: false,
    }),
  });
  const text = await res.text();
  console.log('[API] Create booking response', res.status, text);
  if (!res.ok) {
    console.error('[API] Create booking failed - status:', res.status, 'body:', text);
    let msg = 'Failed to create booking';
    try {
      const parsed = JSON.parse(text);
      msg = parsed?.message ?? parsed?.error ?? parsed?.hint ?? msg;
    } catch {}
    throw new Error(msg);
  }
  const data = JSON.parse(text);
  return Array.isArray(data) ? data[0] : data;
}

export async function apiConfirmBooking(bookingId: string): Promise<void> {
  console.log('[API] Confirming booking', { bookingId });
  const res = await fetch(`${REST}/bookings?id=eq.${encodeURIComponent(bookingId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'confirmed', deposit_paid: true }),
  });
  const text = await res.text();
  console.log('[API] Confirm booking response', res.status, text);
  if (!res.ok) {
    console.error('[API] Confirm booking failed - status:', res.status, 'body:', text);
    let msg = 'Failed to confirm booking';
    try {
      const parsed = JSON.parse(text);
      msg = parsed?.message ?? parsed?.error ?? parsed?.hint ?? msg;
    } catch {}
    throw new Error(msg);
  }
}

export async function apiGetUnavailableDates(): Promise<string[]> {
  console.log('[API] Fetching unavailable dates');
  const [bookingsRes, blackoutsRes] = await Promise.all([
    fetch(`${REST}/bookings?status=eq.confirmed&select=preferred_date`, { headers }),
    fetch(`${REST}/blackout_dates?select=date`, { headers }),
  ]);
  const bookings: { preferred_date: string }[] = bookingsRes.ok ? await bookingsRes.json() : [];
  const blackouts: { date: string }[] = blackoutsRes.ok ? await blackoutsRes.json() : [];
  const dates = new Set<string>();
  bookings.forEach(b => { if (b.preferred_date) dates.add(b.preferred_date.split('T')[0]); });
  blackouts.forEach(b => { if (b.date) dates.add(b.date.split('T')[0]); });
  console.log('[API] Unavailable dates', { count: dates.size });
  return Array.from(dates).sort();
}
