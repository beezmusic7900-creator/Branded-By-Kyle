
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground, Linking, Alert, Image } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppointments } from '@/contexts/AppointmentContext';

export default function AppointmentsScreen() {
  const { appointments, markDepositPaid } = useAppointments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'rejected':
        return '#FF3B30';
      case 'completed':
        return colors.grey;
      default:
        return colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return { ios: 'checkmark.circle.fill', android: 'check_circle' };
      case 'pending':
        return { ios: 'clock.fill', android: 'schedule' };
      case 'rejected':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      case 'completed':
        return { ios: 'checkmark.seal.fill', android: 'verified' };
      default:
        return { ios: 'circle', android: 'circle' };
    }
  };

  const handlePayDeposit = (appointmentId: string) => {
    Alert.alert(
      'Payment Link',
      'In a production app, this would open a payment link. For now, we\'ll mark the deposit as paid.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            await markDepositPaid(appointmentId);
            Alert.alert('Success', 'Deposit marked as paid! Kyle will review your appointment.');
          },
        },
      ]
    );
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
            <Image
              source={require('@/assets/images/f576c74c-16da-4b4e-91f3-c2170f4b4d92.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
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
                        <View>
                          <Text style={styles.dateText}>
                            {new Date(appointment.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                          <Text style={styles.timeText}>
                            {new Date(appointment.date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Text>
                        </View>
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

                    {appointment.consultationDate && (
                      <View style={styles.consultationContainer}>
                        <IconSymbol 
                          ios_icon_name="video.fill" 
                          android_material_icon_name="videocam" 
                          size={18} 
                          color={colors.primary} 
                        />
                        <Text style={styles.consultationText}>
                          Consultation: {new Date(appointment.consultationDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })} at {appointment.consultationTime}
                        </Text>
                      </View>
                    )}

                    <Text style={styles.descriptionText}>{appointment.description}</Text>

                    <View style={styles.depositContainer}>
                      <IconSymbol 
                        ios_icon_name={appointment.depositPaid ? 'checkmark.circle.fill' : 'exclamationmark.circle.fill'} 
                        android_material_icon_name={appointment.depositPaid ? 'check_circle' : 'error'} 
                        size={18} 
                        color={appointment.depositPaid ? '#34C759' : '#FF9500'} 
                      />
                      <Text style={[styles.depositText, { color: appointment.depositPaid ? '#34C759' : '#FF9500' }]}>
                        {appointment.depositPaid ? 'Deposit Paid ($100)' : 'Deposit Pending ($100)'}
                      </Text>
                    </View>

                    {!appointment.depositPaid && appointment.status === 'pending' && (
                      <TouchableOpacity 
                        style={[buttonStyles.primaryButton, styles.actionButton]}
                        onPress={() => handlePayDeposit(appointment.id)}
                      >
                        <Text style={buttonStyles.primaryButtonText}>Pay Deposit</Text>
                      </TouchableOpacity>
                    )}

                    {appointment.status === 'approved' && (
                      <View style={styles.approvedInfo}>
                        <IconSymbol 
                          ios_icon_name="checkmark.seal.fill" 
                          android_material_icon_name="verified" 
                          size={20} 
                          color="#34C759" 
                        />
                        <Text style={styles.approvedText}>
                          Your appointment has been approved! Kyle will contact you soon.
                        </Text>
                      </View>
                    )}

                    {appointment.status === 'rejected' && (
                      <View style={styles.rejectedInfo}>
                        <IconSymbol 
                          ios_icon_name="exclamationmark.triangle.fill" 
                          android_material_icon_name="warning" 
                          size={20} 
                          color="#FF3B30" 
                        />
                        <Text style={styles.rejectedText}>
                          This appointment was not approved. Please contact Kyle for more information.
                        </Text>
                      </View>
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
              <Text style={styles.infoTitle}>Important Information</Text>
              <Text style={styles.infoText}>
                • $100 deposit is non-refundable but secures your date
                {'\n'}
                • Consultation must be completed before appointment
                {'\n'}
                • Remaining balance due at time of service
                {'\n'}
                • 48 hours notice required for cancellations
                {'\n'}
                • Appointments are synced to your device calendar
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
  headerLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
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
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 2,
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
  consultationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: colors.backgroundAlt,
    padding: 10,
    borderRadius: 8,
  },
  consultationText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
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
  approvedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#34C75920',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  approvedText: {
    flex: 1,
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
  },
  rejectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FF3B3020',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectedText: {
    flex: 1,
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '500',
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
