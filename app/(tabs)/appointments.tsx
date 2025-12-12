
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
  description: string;
  depositPaid: boolean;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: '2025-02-15',
    time: '2:00 PM',
    status: 'confirmed',
    description: 'Custom sleeve design - upper arm',
    depositPaid: true,
  },
  {
    id: '2',
    date: '2025-01-28',
    time: '11:00 AM',
    status: 'pending',
    description: 'Black & grey portrait',
    depositPaid: false,
  },
];

export default function AppointmentsScreen() {
  const [appointments] = useState<Appointment[]>(mockAppointments);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'completed':
        return colors.grey;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { ios: 'checkmark.circle.fill', android: 'check_circle' };
      case 'pending':
        return { ios: 'clock.fill', android: 'schedule' };
      case 'completed':
        return { ios: 'checkmark.seal.fill', android: 'verified' };
      default:
        return { ios: 'circle', android: 'circle' };
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
      style={commonStyles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconSymbol 
              ios_icon_name="list.bullet.clipboard.fill" 
              android_material_icon_name="assignment" 
              size={48} 
              color={colors.primary} 
            />
            <Text style={commonStyles.title}>My Appointments</Text>
            <Text style={[commonStyles.text, commonStyles.textCenter]}>
              View and manage your upcoming tattoo sessions
            </Text>
          </View>

          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="calendar.badge.exclamationmark" 
                android_material_icon_name="event_busy" 
                size={64} 
                color={colors.grey} 
              />
              <Text style={styles.emptyStateText}>No appointments yet</Text>
              <Text style={[commonStyles.text, commonStyles.textCenter]}>
                Book your first appointment to get started
              </Text>
            </View>
          ) : (
            <View style={styles.appointmentsList}>
              {appointments.map((appointment, index) => {
                const statusIcon = getStatusIcon(appointment.status);
                const statusColor = getStatusColor(appointment.status);
                
                return (
                  <View key={index} style={commonStyles.card}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.dateContainer}>
                        <IconSymbol 
                          ios_icon_name="calendar" 
                          android_material_icon_name="event" 
                          size={20} 
                          color={colors.primary} 
                        />
                        <Text style={styles.dateText}>
                          {new Date(appointment.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <IconSymbol 
                          ios_icon_name={statusIcon.ios} 
                          android_material_icon_name={statusIcon.android} 
                          size={16} 
                          color={statusColor} 
                        />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timeContainer}>
                      <IconSymbol 
                        ios_icon_name="clock" 
                        android_material_icon_name="access_time" 
                        size={18} 
                        color={colors.text} 
                      />
                      <Text style={styles.timeText}>{appointment.time}</Text>
                    </View>

                    <Text style={styles.descriptionText}>{appointment.description}</Text>

                    <View style={styles.depositContainer}>
                      <IconSymbol 
                        ios_icon_name={appointment.depositPaid ? 'checkmark.circle.fill' : 'exclamationmark.circle.fill'} 
                        android_material_icon_name={appointment.depositPaid ? 'check_circle' : 'error'} 
                        size={18} 
                        color={appointment.depositPaid ? '#34C759' : '#FF9500'} 
                      />
                      <Text style={[styles.depositText, { color: appointment.depositPaid ? '#34C759' : '#FF9500' }]}>
                        {appointment.depositPaid ? 'Deposit Paid' : 'Deposit Pending'}
                      </Text>
                    </View>

                    {appointment.status === 'pending' && (
                      <TouchableOpacity 
                        style={[buttonStyles.secondaryButton, styles.actionButton]}
                      >
                        <Text style={buttonStyles.secondaryButtonText}>
                          {appointment.depositPaid ? 'View Details' : 'Pay Deposit'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.infoCard}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Cancellation Policy</Text>
              <Text style={styles.infoText}>
                Please provide at least 48 hours notice for cancellations. 
                Deposits are non-refundable but can be applied to future appointments.
              </Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  appointmentsList: {
    gap: 16,
    marginBottom: 24,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textBright,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 15,
    color: colors.text,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  depositContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  depositText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textBright,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
