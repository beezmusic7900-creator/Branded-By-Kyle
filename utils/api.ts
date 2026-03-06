
// API utility for making HTTP requests to the backend
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // If no API URL is configured, throw error to trigger fallback
  if (!API_BASE_URL) {
    console.log('API: No backend URL configured, using local storage fallback');
    throw new Error('Backend API not configured');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log(`API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status}`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API Success: ${options.method || 'GET'} ${url}`);
    return data;
  } catch (error) {
    console.error(`API Request Failed: ${url}`, error);
    throw error;
  }
}

// Public API methods (no authentication required)
export const apiGet = <T>(endpoint: string): Promise<T> =>
  apiRequest<T>(endpoint, { method: 'GET' });

export const apiPost = <T>(endpoint: string, body: any): Promise<T> =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiPut = <T>(endpoint: string, body: any): Promise<T> =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(endpoint: string): Promise<T> =>
  apiRequest<T>(endpoint, { method: 'DELETE' });

// Appointment API methods
export interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  service?: string;
  appointmentDate: string; // ISO 8601
  appointmentTime: string;
  consultationDate?: string; // ISO 8601
  consultationTime?: string;
  description: string;
  placement?: string;
  size?: string;
  referenceImages?: string[];
}

export interface Appointment extends AppointmentData {
  id: string;
  status: 'pending deposit' | 'pending' | 'approved' | 'rejected' | 'completed';
  depositPaid: boolean;
  depositAmount: number;
  paymentConfirmedAt?: string;
  squarePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export const appointmentApi = {
  // Create a new appointment
  create: async (data: AppointmentData): Promise<Appointment> => {
    try {
      return await apiPost<Appointment>('/api/appointments', data);
    } catch (error) {
      console.log('API: Create appointment failed, using fallback');
      // Return a mock appointment for local storage fallback
      return {
        ...data,
        id: `local_${Date.now()}`,
        status: 'pending deposit',
        depositPaid: false,
        depositAmount: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  // Get all appointments
  getAll: async (): Promise<Appointment[]> => {
    try {
      return await apiGet<Appointment[]>('/api/appointments');
    } catch (error) {
      console.log('API: Get appointments failed, using fallback');
      return [];
    }
  },

  // Get availability for a specific date
  getAvailability: async (date: string): Promise<{ date: string; bookedSlots: string[] }> => {
    try {
      return await apiGet<{ date: string; bookedSlots: string[] }>(`/api/appointments/availability?date=${date}`);
    } catch (error) {
      console.log('API: Get availability failed, using fallback');
      return { date, bookedSlots: [] };
    }
  },

  // Update appointment status
  updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<{ id: string; status: string; updatedAt: string }> => {
    try {
      return await apiPut<{ id: string; status: string; updatedAt: string }>(`/api/appointments/${id}/status`, { status });
    } catch (error) {
      console.log('API: Update status failed, using fallback');
      throw error;
    }
  },

  // Send confirmation email
  sendConfirmation: async (id: string): Promise<{ success: boolean; emailSent: boolean }> => {
    try {
      return await apiPost<{ success: boolean; emailSent: boolean }>(`/api/appointments/${id}/send-confirmation`, {});
    } catch (error) {
      console.log('API: Send confirmation failed, using fallback');
      return { success: false, emailSent: false };
    }
  },
};
