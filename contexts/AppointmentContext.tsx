
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  consultationDate?: string;
  consultationTime?: string;
  description: string;
  placement: string;
  size: string;
  referenceImages: string[];
  status: 'pending deposit' | 'pending' | 'approved' | 'rejected' | 'completed';
  depositPaid: boolean;
  depositAmount: number;
  createdAt: string;
}

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'depositPaid' | 'depositAmount'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  markDepositPaid: (id: string) => Promise<void>;
  updateConsultation: (id: string, consultationDate: string, consultationTime: string) => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    console.log('AppointmentContext: Loading appointments from storage');
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const stored = await AsyncStorage.getItem('appointments');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAppointments(parsed);
        console.log('AppointmentContext: Loaded', parsed.length, 'appointments');
      }
    } catch (error) {
      console.error('AppointmentContext: Error loading appointments:', error);
    }
  };

  const saveAppointments = async (newAppointments: Appointment[]) => {
    try {
      await AsyncStorage.setItem('appointments', JSON.stringify(newAppointments));
      setAppointments(newAppointments);
      console.log('AppointmentContext: Saved', newAppointments.length, 'appointments');
    } catch (error) {
      console.error('AppointmentContext: Error saving appointments:', error);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'depositPaid' | 'depositAmount'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `local_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending deposit',
      depositPaid: false,
      depositAmount: 100,
    };
    const updated = [...appointments, newAppointment];
    await saveAppointments(updated);
    console.log('AppointmentContext: Added new appointment:', newAppointment.id);
  };

  const updateAppointmentStatus = async (id: string, status: 'approved' | 'rejected') => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    );
    await saveAppointments(updated);
    console.log('AppointmentContext: Updated appointment status:', id, status);
  };

  const markDepositPaid = async (id: string) => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, depositPaid: true } : apt
    );
    await saveAppointments(updated);
    console.log('AppointmentContext: Marked deposit paid:', id);
  };

  const updateConsultation = async (id: string, consultationDate: string, consultationTime: string) => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, consultationDate, consultationTime } : apt
    );
    await saveAppointments(updated);
    console.log('AppointmentContext: Updated consultation:', id);
  };

  return (
    <AppointmentContext.Provider value={{ 
      appointments, 
      addAppointment, 
      updateAppointmentStatus, 
      markDepositPaid,
      updateConsultation 
    }}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}
