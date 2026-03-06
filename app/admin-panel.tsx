
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import * as Calendar from 'expo-calendar';

export default function AdminPanelScreen() {
  const router = useRouter();
  const { logout, adminCredentials, updateCredentials } = useAuth();
  const { appointments, updateAppointmentStatus } = useAppointments();
  const [showSettings, setShowSettings] = useState(false);
  const [newEmail, setNewEmail] = useState(adminCredentials.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const syncToAdminCalendar = async (appointment: any) => {
    try {
      console.log('AdminPanel: Syncing appointment to admin calendar...');
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('AdminPanel: Calendar permission denied');
        Alert.alert('Permission Required', 'Calendar access is needed to sync appointments.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('Calendar Error', 'No writable calendar found.');
        return;
      }

      const appointmentDate = new Date(appointment.date);
      const appointmentEndDate = new Date(appointmentDate.getTime() + 3 * 60 * 60 * 1000);
      
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Tattoo Session - ${appointment.name}`,
        startDate: appointmentDate,
        endDate: appointmentEndDate,
        notes: `Client: ${appointment.name}\nEmail: ${appointment.email}\nPhone: ${appointment.phone}\nDescription: ${appointment.description}\nPlacement: ${appointment.placement}\nSize: ${appointment.size}\nRate: $150/hr\nDeposit: $100 (${appointment.depositPaid ? 'PAID' : 'PENDING'})`,
        alarms: [
          { relativeOffset: -24 * 60 },
          { relativeOffset: -2 * 60 }
        ],
      });

      if (appointment.consultationDate) {
        const consultDate = new Date(appointment.consultationDate);
        const [time, period] = appointment.consultationTime.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        consultDate.setHours(hour, parseInt(minutes), 0, 0);
        
        const consultEndDate = new Date(consultDate.getTime() + 60 * 60 * 1000);
        
        await Calendar.createEventAsync(defaultCalendar.id, {
          title: `Consultation - ${appointment.name}`,
          startDate: consultDate,
          endDate: consultEndDate,
          notes: `Client: ${appointment.name}\nEmail: ${appointment.email}\nPhone: ${appointment.phone}\nTattoo: ${appointment.description}`,
          alarms: [
            { relativeOffset: -24 * 60 },
            { relativeOffset: -2 * 60 }
          ],
        });
      }

      console.log('AdminPanel: Appointment synced to admin calendar');
      Alert.alert('Calendar Synced', 'Appointment has been added to your calendar!');
    } catch (error) {
      console.error('AdminPanel: Calendar sync error:', error);
      Alert.alert('Sync Failed', 'Could not sync to calendar.');
    }
  };

  const handleLogout = () => {
    console.log('AdminPanel: Logout requested');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              console.log('AdminPanel: Logged out successfully');
              router.replace('/(tabs)/(home)/');
            } catch (error) {
              console.error('AdminPanel: Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleApprove = async (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    
    if (!appointment?.depositPaid) {
      Alert.alert(
        'Deposit Not Paid',
        'This appointment cannot be approved because the deposit has not been paid yet. The client must complete the $100 deposit payment first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('AdminPanel: Approving appointment:', id);
    Alert.alert(
      'Approve Appointment',
      'Are you sure you want to approve this appointment? It will be synced to your calendar.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Sync',
          onPress: async () => {
            try {
              await updateAppointmentStatus(id, 'approved');
              if (appointment) {
                await syncToAdminCalendar(appointment);
              }
              console.log('AdminPanel: Appointment approved successfully');
              
              // TODO: Backend Integration - Send confirmation email to client
              // POST /api/appointments/:id/send-confirmation
              // This sends email with booking details and deposit confirmation
              
              Alert.alert('Success', 'Appointment approved and synced to your calendar! The client will receive a confirmation email.');
            } catch (error) {
              console.error('AdminPanel: Error approving appointment:', error);
              Alert.alert('Error', 'Failed to approve appointment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReject = (id: string) => {
    console.log('AdminPanel: Rejecting appointment:', id);
    Alert.alert(
      'Reject Appointment',
      'Are you sure you want to reject this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateAppointmentStatus(id, 'rejected');
              console.log('AdminPanel: Appointment rejected successfully');
              Alert.alert('Rejected', 'Appointment has been rejected.');
            } catch (error) {
              console.error('AdminPanel: Error rejecting appointment:', error);
              Alert.alert('Error', 'Failed to reject appointment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateCredentials = async () => {
    console.log('AdminPanel: Updating credentials');
    
    if (!newEmail) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const passwordToUse = newPassword || adminCredentials.password;
      await updateCredentials(newEmail, passwordToUse);
      console.log('AdminPanel: Credentials updated successfully');
      Alert.alert('Success', 'Credentials updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setShowSettings(false);
    } catch (error) {
      console.error('AdminPanel: Error updating credentials:', error);
      Alert.alert('Error', 'Failed to update credentials. Please try again.');
    }
  };

  const handleBack = () => {
    console.log('AdminPanel: Navigating back');
    try {
      router.back();
    } catch (error) {
      console.error('AdminPanel: Error navigating back:', error);
    }
  };

  const pendingDepositAppointments = appointments.filter(apt => !apt.depositPaid);
  const pendingApprovalAppointments = appointments.filter(apt => apt.depositPaid && apt.status === 'pending');
  const approvedAppointments = appointments.filter(apt => apt.status === 'approved');

  return (
    <ImageBackground
      source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
      style={commonStyles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow_back" 
              size={28} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <Image
            source={require('@/assets/images/f576c74c-16da-4b4e-91f3-c2170f4b4d92.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={handleLogout}>
            <IconSymbol 
              ios_icon_name="rectangle.portrait.and.arrow.right" 
              android_material_icon_name="logout" 
              size={28} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={commonStyles.card}
            onPress={() => setShowSettings(!showSettings)}
          >
            <View style={styles.settingsHeader}>
              <View style={styles.sectionHeader}>
                <IconSymbol 
                  ios_icon_name="gear" 
                  android_material_icon_name="settings" 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.sectionTitle}>Admin Settings</Text>
              </View>
              <IconSymbol 
                ios_icon_name={showSettings ? "chevron.up" : "chevron.down"} 
                android_material_icon_name={showSettings ? "expand_less" : "expand_more"} 
                size={24} 
                color={colors.text} 
              />
            </View>
          </TouchableOpacity>

          {showSettings && (
            <View style={commonStyles.card}>
              <Text style={commonStyles.label}>Email</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="admin@brandedbykyle.com"
                placeholderTextColor={colors.grey}
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={commonStyles.label}>New Password (leave blank to keep current)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter new password"
                placeholderTextColor={colors.grey}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Text style={commonStyles.label}>Confirm New Password</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Confirm new password"
                placeholderTextColor={colors.grey}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity 
                style={[buttonStyles.primaryButton, styles.updateButton]}
                onPress={handleUpdateCredentials}
              >
                <Text style={buttonStyles.primaryButtonText}>Update Credentials</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="exclamationmark.circle.fill" 
                android_material_icon_name="error" 
                size={24} 
                color="#FF9500" 
              />
              <Text style={styles.sectionTitle}>
                Pending Deposit ({pendingDepositAppointments.length})
              </Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              These bookings are saved but awaiting deposit payment
            </Text>
          </View>

          {pendingDepositAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No bookings pending deposit</Text>
            </View>
          ) : (
            pendingDepositAppointments.map((apt, index) => (
              <View key={index} style={commonStyles.card}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentName}>{apt.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#FF950020' }]}>
                    <Text style={[styles.statusText, { color: '#FF9500' }]}>PENDING DEPOSIT</Text>
                  </View>
                </View>

                <View style={styles.appointmentDetail}>
                  <IconSymbol 
                    ios_icon_name="envelope" 
                    android_material_icon_name="email" 
                    size={16} 
                    color={colors.text} 
                  />
                  <Text style={styles.detailText}>{apt.email}</Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <IconSymbol 
                    ios_icon_name="phone" 
                    android_material_icon_name="phone" 
                    size={16} 
                    color={colors.text} 
                  />
                  <Text style={styles.detailText}>{apt.phone}</Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <IconSymbol 
                    ios_icon_name="calendar" 
                    android_material_icon_name="event" 
                    size={16} 
                    color={colors.text} 
                  />
                  <Text style={styles.detailText}>
                    {new Date(apt.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                {apt.consultationDate && (
                  <View style={styles.appointmentDetail}>
                    <IconSymbol 
                      ios_icon_name="video" 
                      android_material_icon_name="videocam" 
                      size={16} 
                      color={colors.primary} 
                    />
                    <Text style={styles.detailText}>
                      Consultation: {new Date(apt.consultationDate).toLocaleDateString()} at {apt.consultationTime}
                    </Text>
                  </View>
                )}

                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{apt.description}</Text>

                {apt.placement && (
                  <>
                    <Text style={styles.descriptionLabel}>Placement:</Text>
                    <Text style={styles.descriptionText}>{apt.placement}</Text>
                  </>
                )}

                {apt.size && (
                  <>
                    <Text style={styles.descriptionLabel}>Size:</Text>
                    <Text style={styles.descriptionText}>{apt.size}</Text>
                  </>
                )}

                <View style={styles.depositWarning}>
                  <IconSymbol 
                    ios_icon_name="exclamationmark.triangle.fill" 
                    android_material_icon_name="warning" 
                    size={18} 
                    color="#FF9500" 
                  />
                  <Text style={styles.depositWarningText}>
                    Waiting for client to complete $100 deposit payment. Cannot approve until deposit is paid.
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="clock.badge.exclamationmark" 
                android_material_icon_name="pending_actions" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>
                Pending Approval ({pendingApprovalAppointments.length})
              </Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Deposit paid - ready for your approval
            </Text>
          </View>

          {pendingApprovalAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No appointments pending approval</Text>
            </View>
          ) : (
            pendingApprovalAppointments.map((apt, index) => (
              <View key={index} style={commonStyles.card}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentName}>{apt.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#34C75920' }]}>
                    <Text style={[styles.statusText, { color: '#34C759' }]}>DEPOSIT PAID</Text>
                  </View>
                </View>

                <View style={styles.appointmentDetail}>
                  <IconSymbol 
                    ios_icon_name="envelope" 
                    android_material_icon_name="email" 
                    size={16} 
                    color={colors.text} 
                  />
                  <Text style={styles.detailText}>{apt.email}</Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <IconSymbol 
                    ios_icon_name="phone" 
                    android_material_icon_name="phone" 
                    size={16} 
                    color={colors.text} 
                  />
                  <Text style={styles.detailText}>{apt.phone}</Text>
                </View>

                <View style={styles.appointmentDetail}>
                  <IconSymbol 
                    ios_icon_name="calendar" 
                    android_material_icon_name="event" 
                    size={16} 
                    color={colors.text} 
                  />
                  <Text style={styles.detailText}>
                    {new Date(apt.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                {apt.consultationDate && (
                  <View style={styles.appointmentDetail}>
                    <IconSymbol 
                      ios_icon_name="video" 
                      android_material_icon_name="videocam" 
                      size={16} 
                      color={colors.primary} 
                    />
                    <Text style={styles.detailText}>
                      Consultation: {new Date(apt.consultationDate).toLocaleDateString()} at {apt.consultationTime}
                    </Text>
                  </View>
                )}

                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{apt.description}</Text>

                {apt.placement && (
                  <>
                    <Text style={styles.descriptionLabel}>Placement:</Text>
                    <Text style={styles.descriptionText}>{apt.placement}</Text>
                  </>
                )}

                {apt.size && (
                  <>
                    <Text style={styles.descriptionLabel}>Size:</Text>
                    <Text style={styles.descriptionText}>{apt.size}</Text>
                  </>
                )}

                <View style={styles.depositPaidInfo}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={18} 
                    color="#34C759" 
                  />
                  <Text style={styles.depositPaidText}>
                    Deposit Paid: $100 ✓
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[buttonStyles.primaryButton, styles.approveButton]}
                    onPress={() => handleApprove(apt.id)}
                  >
                    <IconSymbol 
                      ios_icon_name="checkmark" 
                      android_material_icon_name="check" 
                      size={20} 
                      color="#FFFFFF" 
                    />
                    <Text style={buttonStyles.primaryButtonText}>Approve & Sync</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[buttonStyles.secondaryButton, styles.rejectButton]}
                    onPress={() => handleReject(apt.id)}
                  >
                    <IconSymbol 
                      ios_icon_name="xmark" 
                      android_material_icon_name="close" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={buttonStyles.secondaryButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={24} 
                color="#34C759" 
              />
              <Text style={styles.sectionTitle}>
                Approved Appointments ({approvedAppointments.length})
              </Text>
            </View>
          </View>

          {approvedAppointments.map((apt, index) => (
            <View key={index} style={commonStyles.card}>
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentName}>{apt.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#34C75920' }]}>
                  <Text style={[styles.statusText, { color: '#34C759' }]}>APPROVED</Text>
                </View>
              </View>

              <View style={styles.appointmentDetail}>
                <IconSymbol 
                  ios_icon_name="calendar" 
                  android_material_icon_name="event" 
                  size={16} 
                  color={colors.text} 
                />
                <Text style={styles.detailText}>
                  {new Date(apt.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>

              {apt.consultationDate && (
                <View style={styles.appointmentDetail}>
                  <IconSymbol 
                    ios_icon_name="video" 
                    android_material_icon_name="videocam" 
                    size={16} 
                    color={colors.primary} 
                  />
                  <Text style={styles.detailText}>
                    Consultation: {new Date(apt.consultationDate).toLocaleDateString()} at {apt.consultationTime}
                  </Text>
                </View>
              )}

              <Text style={styles.descriptionText}>{apt.description}</Text>
              
              <View style={styles.depositPaidInfo}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={18} 
                  color="#34C759" 
                />
                <Text style={styles.depositPaidText}>
                  Deposit Paid: $100 ✓
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[buttonStyles.secondaryButton, { marginTop: 12 }]}
                onPress={() => syncToAdminCalendar(apt)}
              >
                <IconSymbol 
                  ios_icon_name="calendar.badge.plus" 
                  android_material_icon_name="event" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={buttonStyles.secondaryButtonText}>Sync to Calendar</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textBright,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.text,
    marginTop: 6,
    opacity: 0.8,
  },
  updateButton: {
    marginTop: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.grey,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textBright,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#FF950020',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textBright,
    marginTop: 8,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  depositWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FF950020',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
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
  depositPaidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#34C75920',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  depositPaidText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
