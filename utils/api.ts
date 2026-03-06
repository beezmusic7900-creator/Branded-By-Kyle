
// API utility for making HTTP requests to the backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-url.com';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error: ${response.status}`, data);
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

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
  create: (data: AppointmentData): Promise<Appointment> =>
    apiPost<Appointment>('/api/appointments', data),

  // Get all appointments
  getAll: (): Promise<Appointment[]> =>
    apiGet<Appointment[]>('/api/appointments'),

  // Get availability for a specific date
  getAvailability: (date: string): Promise<{ date: string; bookedSlots: string[] }> =>
    apiGet<{ date: string; bookedSlots: string[] }>(`/api/appointments/availability?date=${date}`),

  // Update appointment status
  updateStatus: (id: string, status: 'approved' | 'rejected'): Promise<{ id: string; status: string; updatedAt: string }> =>
    apiPut<{ id: string; status: string; updatedAt: string }>(`/api/appointments/${id}/status`, { status }),

  // Send confirmation email
  sendConfirmation: (id: string): Promise<{ success: boolean; emailSent: boolean }> =>
    apiPost<{ success: boolean; emailSent: boolean }>(`/api/appointments/${id}/send-confirmation`, {}),
};
