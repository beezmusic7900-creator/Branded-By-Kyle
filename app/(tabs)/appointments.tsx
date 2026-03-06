
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground, Linking, Alert, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppointments } from '@/contexts/AppointmentContext';
import { appointmentApi, Appointment as ApiAppointment } from '@/utils/api';

const SQUARE_PAYMENT_LINK = 'https://square.link/u/sAU6Bf87';

export default function AppointmentsScreen() {
  const { appointments: localAppointments } = useAppointments();
  const [apiAppointments, setApiAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Appointments: Component mounted, fetching appointments');
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log('Appointments: Fetching from backend API');
      const appointments = await appointmentApi.getAll();
      setApiAppointments(appointments);
      console.log('Appointments: Fetched', appointments.length, 'appointments from API');
    } catch (error) {
      console.error('Appointments: Error fetching from API, using local data:', error);
      // Fallback to local appointments if backend not available
      setApiAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  // Merge API and local appointments (prefer API data)
  const allAppointments = apiAppointments.length > 0 ? apiAppointments : localAppointments.map(apt => ({
    ...apt,
    appointmentDate: apt.date,
    appointmentTime: new Date(apt.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    service: 'Custom Tattoo',
    referenceImages: apt.referenceImages || [],
    depositAmount: 100,
    createdAt: apt.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'pending deposit':
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
      case 'pending deposit':
        return { ios: 'exclamationmark.circle.fill', android: 'error' };
      case 'rejected':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      case 'completed':
        return { ios: 'checkmark.seal.fill', android: 'verified' };
      default:
        return { ios: 'circle', android: 'circle' };
    }
  };

  const getStatusDisplayText = (status: string) => {
    if (status === 'pending deposit') {
      return 'Pending Deposit';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handlePayDeposit = async (appointmentId: string) => {
    console.log('Appointments: Pay deposit requested for:', appointmentId);
    
    Alert.alert(
      'Complete Deposit Payment',
      'You will be redirected to Square to complete your $100 non-refundable deposit payment.\n\nAfter payment is confirmed, your booking status will be updated automatically and you will receive a confirmation email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Payment',
          onPress: async () => {
            try {
              console.log('Appointments: Opening Square payment link:', SQUARE_PAYMENT_LINK);
              const canOpen = await Linking.canOpenURL(SQUARE_PAYMENT_LINK);
              
              if (canOpen) {
                await Linking.openURL(SQUARE_PAYMENT_LINK);
                console.log('Appointments: Payment link opened successfully');
                
                Alert.alert(
                  'Payment Link Opened',
                  'Complete your payment in the browser. Once payment is confirmed by Square, your booking status will be automatically updated and you will receive a confirmation email.\n\nPull down to refresh this screen after completing payment.',
                  [{ text: 'OK' }]
                );
              } else {
                console.log('Appointments: Cannot open payment link');
                Alert.alert('Error', 'Unable to open payment link. Please contact us at brandedbykyle@gmail.com');
              }
            } catch (error) {
              console.error('Appointments: Error opening payment link:', error);
              Alert.alert('Error', 'Unable to open payment link. Please contact us at brandedbykyle@gmail.com');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
        style={commonStyles.container}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.text, { marginTop: 16 }]}>Loading appointments...</Text>
        </View>
      </ImageBackground>
    );
  }

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
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
            <Text style={[commonStyles.text, commonStyles.textCenter, { fontSize: 12, marginTop: 8, opacity: 0.7 }]}>
              Pull down to refresh
            </Text>
          </View>

          {allAppointments.length === 0 ? (
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
              {allAppointments.map((appointment, index) => {
                const statusIcon = getStatusIcon(appointment.status);
                const statusColor = getStatusColor(appointment.status);
                const statusText = getStatusDisplayText(appointment.status);
                const appointmentDate = new Date(appointment.appointmentDate || appointment.date);
                
                return (
                  <View key={appointment.id || index} style={commonStyles.card}>
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
                            {appointmentDate.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                          <Text style={styles.timeText}>
                            {appointment.appointmentTime || appointmentDate.toLocaleTimeString('en-US', { 
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
                          {statusText}
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

                    {!appointment.depositPaid && (
                      <View style={styles.depositWarning}>
                        <IconSymbol 
                          ios_icon_name="exclamationmark.triangle.fill" 
                          android_material_icon_name="warning" 
                          size={20} 
                          color="#FF9500" 
                        />
                        <Text style={styles.depositWarningText}>
                          Your booking is saved but not confirmed. Complete the $100 deposit payment to secure your appointment and receive confirmation.
                        </Text>
                      </View>
                    )}

                    {!appointment.depositPaid && (
                      <TouchableOpacity 
                        style={[buttonStyles.primaryButton, styles.actionButton]}
                        onPress={() => handlePayDeposit(appointment.id)}
                      >
                        <IconSymbol 
                          ios_icon_name="creditcard.fill" 
                          android_material_icon_name="payment" 
                          size={20} 
                          color="#FFFFFF" 
                        />
                        <Text style={buttonStyles.primaryButtonText}>Pay $100 Deposit</Text>
                      </TouchableOpacity>
                    )}

                    {appointment.depositPaid && appointment.status === 'pending' && (
                      <View style={styles.pendingInfo}>
                        <IconSymbol 
                          ios_icon_name="clock.fill" 
                          android_material_icon_name="schedule" 
                          size={20} 
                          color="#FF9500" 
                        />
                        <Text style={styles.pendingText}>
                          Deposit received! Kyle is reviewing your appointment and will contact you soon.
                        </Text>
                      </View>
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
                          Your appointment has been approved! Kyle will contact you soon to confirm details.
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
                          This appointment was not approved. Please contact Kyle at brandedbykyle@gmail.com for more information.
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
                • Deposit must be paid to confirm your booking
                {'\n'}
                • You will receive email confirmation after payment
                {'\n'}
                • Consultation must be completed before appointment
                {'\n'}
                • Remaining balance due at time of service
                {'\n'}
                • 48 hours notice required for cancellations
                {'\n'}
                • Appointments are synced to your device calendar
                {'\n'}
                • Pull down to refresh after completing payment
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
    marginBottom: 12,
  },
  depositText: {
    fontSize: 14,
    fontWeight: '600',
  },
  depositWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FF950020',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF950040',
  },
  depositWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#FF9500',
    fontWeight: '500',
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 8,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FF950020',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    color: '#FF9500',
    fontWeight: '500',
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
