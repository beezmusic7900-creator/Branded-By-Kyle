
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
  status: 'pending' | 'approved' | 'rejected' | 'completed';
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
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const stored = await AsyncStorage.getItem('appointments');
      if (stored) {
        setAppointments(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading appointments:', error);
    }
  };

  const saveAppointments = async (newAppointments: Appointment[]) => {
    try {
      await AsyncStorage.setItem('appointments', JSON.stringify(newAppointments));
      setAppointments(newAppointments);
    } catch (error) {
      console.log('Error saving appointments:', error);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'depositPaid' | 'depositAmount'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      depositPaid: false,
      depositAmount: 100,
    };
    const updated = [...appointments, newAppointment];
    await saveAppointments(updated);
  };

  const updateAppointmentStatus = async (id: string, status: 'approved' | 'rejected') => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    );
    await saveAppointments(updated);
  };

  const markDepositPaid = async (id: string) => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, depositPaid: true } : apt
    );
    await saveAppointments(updated);
  };

  const updateConsultation = async (id: string, consultationDate: string, consultationTime: string) => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, consultationDate, consultationTime } : apt
    );
    await saveAppointments(updated);
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
