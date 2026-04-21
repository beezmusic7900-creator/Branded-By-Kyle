import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  let path = url.pathname
    .replace(/^\/functions\/v1\/booking-api/, '')
    .replace(/^\/booking-api/, '');
  if (!path || path === '') path = '/';
  const method = req.method;

  console.log(`[booking-api] ${method} ${path}`);

  try {
    // GET /api/bookings/unavailable-dates
    if (method === 'GET' && path === '/api/bookings/unavailable-dates') {
      const [{ data: bookings }, { data: blackouts }] = await Promise.all([
        supabase.from('bookings').select('preferred_date').eq('status', 'confirmed'),
        supabase.from('blackout_dates').select('date'),
      ]);
      const dates = new Set<string>();
      (bookings ?? []).forEach((b: { preferred_date: string }) => {
        if (b.preferred_date) dates.add(b.preferred_date.split('T')[0]);
      });
      (blackouts ?? []).forEach((b: { date: string }) => {
        if (b.date) dates.add(b.date.split('T')[0]);
      });
      return json({ dates: Array.from(dates).sort() });
    }

    // POST /api/bookings
    if (method === 'POST' && path === '/api/bookings') {
      const body = await req.json();
      const { name, email, phone, tattoo_style, description, preferred_date } = body;
      if (!name || !email || !preferred_date) {
        return json({ error: 'name, email, and preferred_date are required.' }, 400);
      }
      const { data: blackout } = await supabase
        .from('blackout_dates').select('id').eq('date', preferred_date).maybeSingle();
      if (blackout) {
        return json({ error: 'This date is unavailable. Please choose another date.' }, 409);
      }
      const { data: existing } = await supabase
        .from('bookings').select('id').eq('preferred_date', preferred_date).eq('status', 'confirmed').maybeSingle();
      if (existing) {
        return json({ error: 'This date is unavailable. Please choose another date.' }, 409);
      }
      const { data, error } = await supabase
        .from('bookings')
        .insert({ name, email, phone: phone || null, tattoo_style: tattoo_style || null, description: description || null, preferred_date, status: 'pending_payment', deposit_paid: false })
        .select('id, name, email, preferred_date, status, created_at')
        .single();
      if (error) { console.error('[booking-api] Insert error:', error); return json({ error: error.message }, 500); }
      return json(data, 201);
    }

    // PATCH /api/bookings/:id/confirm
    const confirmMatch = path.match(/^\/api\/bookings\/([^/]+)\/confirm$/);
    if (method === 'PATCH' && confirmMatch) {
      const id = confirmMatch[1];
      const { data, error } = await supabase
        .from('bookings').update({ status: 'confirmed', deposit_paid: true }).eq('id', id)
        .select('id, status, deposit_paid').single();
      if (error || !data) return json({ error: 'Booking not found.' }, 404);
      return json(data);
    }

    // GET /api/admin/bookings
    if (method === 'GET' && path === '/api/admin/bookings') {
      const { data, error } = await supabase.from('bookings').select('*').order('preferred_date', { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json(data ?? []);
    }

    // PATCH /api/admin/bookings/:id  and  DELETE /api/admin/bookings/:id
    const adminBookingMatch = path.match(/^\/api\/admin\/bookings\/([^/]+)$/);
    if (adminBookingMatch) {
      const id = adminBookingMatch[1];
      if (method === 'PATCH') {
        const body = await req.json();
        const { status } = body;
        const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select('*').single();
        if (error || !data) return json({ error: 'Booking not found.' }, 404);
        return json(data);
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) return json({ error: error.message }, 500);
        return json({ success: true });
      }
    }

    // GET /api/admin/blackout-dates
    if (method === 'GET' && path === '/api/admin/blackout-dates') {
      const { data, error } = await supabase.from('blackout_dates').select('*').order('date', { ascending: true });
      if (error) return json({ error: error.message }, 500);
      return json(data ?? []);
    }

    // POST /api/admin/blackout-dates
    if (method === 'POST' && path === '/api/admin/blackout-dates') {
      const body = await req.json();
      const { date, reason } = body;
      if (!date) return json({ error: 'date is required.' }, 400);
      const { data, error } = await supabase
        .from('blackout_dates').insert({ date, reason: reason || null }).select('*').single();
      if (error) {
        if (error.code === '23505') return json({ error: 'This date is already blocked.' }, 409);
        return json({ error: error.message }, 500);
      }
      return json(data, 201);
    }

    // DELETE /api/admin/blackout-dates/:id
    const blackoutMatch = path.match(/^\/api\/admin\/blackout-dates\/([^/]+)$/);
    if (method === 'DELETE' && blackoutMatch) {
      const id = blackoutMatch[1];
      const { error } = await supabase.from('blackout_dates').delete().eq('id', id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    return json({ error: 'Not found.' }, 404);
  } catch (err) {
    console.error('[booking-api] Unhandled error:', err);
    return json({ error: 'Internal server error.' }, 500);
  }
});
