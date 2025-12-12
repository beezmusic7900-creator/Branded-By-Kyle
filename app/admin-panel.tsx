
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/contexts/AppointmentContext';

export default function AdminPanelScreen() {
  const router = useRouter();
  const { logout, adminCredentials, updateCredentials } = useAuth();
  const { appointments, updateAppointmentStatus } = useAppointments();
  const [showSettings, setShowSettings] = useState(false);
  const [newEmail, setNewEmail] = useState(adminCredentials.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(tabs)/(home)/');
          },
        },
      ]
    );
  };

  const handleApprove = (id: string) => {
    Alert.alert(
      'Approve Appointment',
      'Are you sure you want to approve this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            await updateAppointmentStatus(id, 'approved');
            Alert.alert('Success', 'Appointment approved! The client will be notified.');
          },
        },
      ]
    );
  };

  const handleReject = (id: string) => {
    Alert.alert(
      'Reject Appointment',
      'Are you sure you want to reject this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await updateAppointmentStatus(id, 'rejected');
            Alert.alert('Rejected', 'Appointment has been rejected.');
          },
        },
      ]
    );
  };

  const handleUpdateCredentials = async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const passwordToUse = newPassword || adminCredentials.password;
    await updateCredentials(newEmail, passwordToUse);
    Alert.alert('Success', 'Credentials updated successfully');
    setNewPassword('');
    setConfirmPassword('');
    setShowSettings(false);
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const approvedAppointments = appointments.filter(apt => apt.status === 'approved');

  return (
    <ImageBackground
      source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
      style={commonStyles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow_back" 
              size={28} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
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
          {/* Settings Section */}
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

          {/* Pending Appointments */}
          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="clock.badge.exclamationmark" 
                android_material_icon_name="pending_actions" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>
                Pending Appointments ({pendingAppointments.length})
              </Text>
            </View>
          </View>

          {pendingAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending appointments</Text>
            </View>
          ) : (
            pendingAppointments.map((apt, index) => (
              <View key={index} style={commonStyles.card}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentName}>{apt.name}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>PENDING</Text>
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

                <View style={styles.depositInfo}>
                  <IconSymbol 
                    ios_icon_name={apt.depositPaid ? "checkmark.circle.fill" : "exclamationmark.circle.fill"} 
                    android_material_icon_name={apt.depositPaid ? "check_circle" : "error"} 
                    size={18} 
                    color={apt.depositPaid ? '#34C759' : '#FF9500'} 
                  />
                  <Text style={[styles.depositText, { color: apt.depositPaid ? '#34C759' : '#FF9500' }]}>
                    Deposit: {apt.depositPaid ? 'Paid ($100)' : 'Not Paid'}
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
                    <Text style={buttonStyles.primaryButtonText}>Approve</Text>
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

          {/* Approved Appointments */}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textBright,
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
  depositInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  depositText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
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
