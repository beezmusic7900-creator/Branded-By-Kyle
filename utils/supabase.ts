import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[Supabase] Missing env vars — EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY not set");
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface BookingPayload {
  name: string;
  email: string;
  phone: string;
  tattoo_style: string;
  description: string;
  preferred_date: string;
  reference_image_url?: string;
}

export interface BookingResult {
  id: string;
  created_at: string;
  name: string;
  email: string;
  status: string;
}

export async function submitBooking(payload: BookingPayload): Promise<BookingResult> {
  console.log("[Supabase] Submitting booking request", { name: payload.name, email: payload.email, style: payload.tattoo_style });

  const { data, error } = await supabase
    .from("bookings")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Booking insert failed", error);
    throw new Error(error.message ?? "Failed to submit booking");
  }

  console.log("[Supabase] Booking submitted successfully", { id: data?.id });
  return data as BookingResult;
}
