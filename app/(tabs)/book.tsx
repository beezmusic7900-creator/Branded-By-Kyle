
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Alert, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Calendar from 'expo-calendar';
import { useAppointments } from '@/contexts/AppointmentContext';
import { useRouter } from 'expo-router';

export default function BookScreen() {
  const router = useRouter();
  const { addAppointment, appointments } = useAppointments();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [consultationDate, setConsultationDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [showConsultationDatePicker, setShowConsultationDatePicker] = useState(false);
  const [consultationTime, setConsultationTime] = useState('10:00 AM');
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('');
  const [size, setSize] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    console.log('BookScreen: Checking availability for selected date');
    checkAvailability();
  }, [date]);

  const checkAvailability = async () => {
    console.log('BookScreen: Fetching booked slots for date:', date.toISOString());
    setLoadingAvailability(true);
    try {
      // TODO: Backend Integration - GET /api/bookings/availability?date=YYYY-MM-DD
      // Returns: { bookedSlots: ['2024-01-15T10:00:00Z', '2024-01-15T14:00:00Z'] }
      // For now, use local appointments
      const dateStr = date.toISOString().split('T')[0];
      const booked = appointments
        .filter(apt => apt.date.startsWith(dateStr) && apt.status !== 'rejected')
        .map(apt => apt.date);
      console.log('BookScreen: Found booked slots:', booked);
      setBookedSlots(booked);
    } catch (error) {
      console.log('BookScreen: Error checking availability:', error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const isTimeSlotBooked = (timeSlot: string): boolean => {
    const [time, period] = timeSlot.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    const slotDate = new Date(date);
    slotDate.setHours(hour, parseInt(minutes), 0, 0);
    const slotISO = slotDate.toISOString();
    
    const isBooked = bookedSlots.some(bookedSlot => {
      const bookedDate = new Date(bookedSlot);
      return Math.abs(bookedDate.getTime() - slotDate.getTime()) < 60 * 60 * 1000;
    });
    
    console.log('BookScreen: Checking if', timeSlot, 'is booked:', isBooked);
    return isBooked;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      console.log('BookScreen: Date changed to:', selectedDate.toISOString());
      setDate(selectedDate);
    }
  };

  const handleConsultationDateChange = (event: any, selectedDate?: Date) => {
    setShowConsultationDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const appointmentTime = date.getTime();
      const consultTime = selectedDate.getTime();
      const hoursDiff = (appointmentTime - consultTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        Alert.alert('Invalid Date', 'Consultation must be at least 24 hours before the appointment date.');
        return;
      }
      setConsultationDate(selectedDate);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setReferenceImages([...referenceImages, ...newImages]);
    }
  };

  const addToCalendar = async (appointmentDate: Date, consultDate: Date, clientName: string, tattooDescription: string) => {
    try {
      console.log('Requesting calendar permissions...');
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Calendar permission denied');
        Alert.alert('Permission Required', 'Calendar access is needed to sync appointments. You can still book without calendar sync.');
        return;
      }

      console.log('Calendar permission granted, getting calendars...');
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      console.log('Available calendars:', calendars.length);
      
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!defaultCalendar) {
        console.log('No writable calendar found');
        Alert.alert('Calendar Error', 'No writable calendar found on your device.');
        return;
      }

      console.log('Using calendar:', defaultCalendar.title);

      const consultationEndDate = new Date(consultDate.getTime() + 60 * 60 * 1000);
      const consultationEventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Consultation - ${clientName}`,
        startDate: consultDate,
        endDate: consultationEndDate,
        notes: `Tattoo Consultation\nClient: ${clientName}\nDescription: ${tattooDescription}\nType: Phone/Zoom`,
        alarms: [
          { relativeOffset: -24 * 60 },
          { relativeOffset: -2 * 60 }
        ],
      });
      console.log('Consultation event created:', consultationEventId);

      const appointmentEndDate = new Date(appointmentDate.getTime() + 3 * 60 * 60 * 1000);
      const appointmentEventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Tattoo Appointment - ${clientName}`,
        startDate: appointmentDate,
        endDate: appointmentEndDate,
        notes: `Tattoo Session\nClient: ${clientName}\nDescription: ${tattooDescription}\nRate: $150/hr\nDeposit: $100 (paid)`,
        alarms: [
          { relativeOffset: -24 * 60 },
          { relativeOffset: -2 * 60 }
        ],
      });
      console.log('Appointment event created:', appointmentEventId);

      Alert.alert('Calendar Synced', 'Appointments have been added to your calendar with reminders!');
    } catch (error) {
      console.log('Calendar sync error:', error);
      Alert.alert('Calendar Sync Failed', 'Could not sync to calendar, but your booking is still saved.');
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !phone || !description) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const appointmentTime = date.getTime();
    const consultTime = consultationDate.getTime();
    const hoursDiff = (appointmentTime - consultTime) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      Alert.alert('Invalid Consultation Date', 'Consultation must be at least 24 hours before the appointment date.');
      return;
    }

    // Check if the selected time slot is already booked
    const selectedHour = date.getHours();
    const selectedMinute = date.getMinutes();
    const period = selectedHour >= 12 ? 'PM' : 'AM';
    const displayHour = selectedHour > 12 ? selectedHour - 12 : (selectedHour === 0 ? 12 : selectedHour);
    const timeSlot = `${displayHour}:${selectedMinute.toString().padStart(2, '0')} ${period}`;
    
    if (isTimeSlotBooked(timeSlot)) {
      Alert.alert('Time Slot Unavailable', 'This time slot is already booked. Please select a different time.');
      return;
    }

    console.log('BookScreen: Submitting booking and syncing to calendar...');

    // TODO: Backend Integration - POST /api/bookings
    // Body: { name, email, phone, appointmentDate: ISO8601, consultationDate: ISO8601, consultationTime, description, placement, size, referenceImages }
    // Returns: { id, status: 'pending', depositPaid: false }
    await addAppointment({
      name,
      email,
      phone,
      date: date.toISOString(),
      consultationDate: consultationDate.toISOString(),
      consultationTime,
      description,
      placement,
      size,
      referenceImages,
    });

    const consultDateWithTime = new Date(consultationDate);
    const [time, period2] = consultationTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period2 === 'PM' && hour !== 12) hour += 12;
    if (period2 === 'AM' && hour === 12) hour = 0;
    consultDateWithTime.setHours(hour, parseInt(minutes), 0, 0);

    await addToCalendar(date, consultDateWithTime, name, description);

    console.log('BookScreen: Booking submitted successfully');
    
    Alert.alert(
      'Booking Request Submitted',
      'Thank you! Your booking request has been submitted and synced to your calendar.\n\n' +
      'Next Steps:\n' +
      '1. Pay the $100 non-refundable deposit to secure your date\n' +
      '2. After payment is confirmed, you can schedule your consultation\n' +
      '3. Kyle will review and approve your appointment\n\n' +
      'Payment link will be sent to your email shortly.',
      [{ 
        text: 'OK',
        onPress: () => {
          setName('');
          setEmail('');
          setPhone('');
          setDescription('');
          setPlacement('');
          setSize('');
          setReferenceImages([]);
          checkAvailability();
          router.push('/(tabs)/appointments');
        }
      }]
    );
  };

  const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', 
    '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  const appointmentTimeSlots = [
    '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
    '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

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
              ios_icon_name="calendar.badge.plus" 
              android_material_icon_name="event" 
              size={48} 
              color={colors.primary} 
            />
            <Text style={commonStyles.title}>Book Your Appointment</Text>
            <Text style={[commonStyles.text, commonStyles.textCenter]}>
              Fill out the form below to request an appointment. A $100 non-refundable deposit is required to secure your booking.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={commonStyles.subtitle}>Contact Information</Text>
            
            <Text style={commonStyles.label}>Full Name *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.grey}
              value={name}
              onChangeText={setName}
            />

            <Text style={commonStyles.label}>Email *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={colors.grey}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={commonStyles.label}>Phone Number *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.grey}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={commonStyles.subtitle}>Consultation Details</Text>
            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              Schedule your consultation at least 24 hours before your appointment to discuss your tattoo design via phone or Zoom.
            </Text>
            
            <Text style={commonStyles.label}>Consultation Date *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowConsultationDatePicker(true)}
            >
              <IconSymbol 
                ios_icon_name="video" 
                android_material_icon_name="videocam" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.dateButtonText}>
                {consultationDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>

            {showConsultationDatePicker && (
              <DateTimePicker
                value={consultationDate}
                mode="date"
                display="default"
                onChange={handleConsultationDateChange}
                minimumDate={new Date()}
                maximumDate={new Date(date.getTime() - 24 * 60 * 60 * 1000)}
              />
            )}

            <Text style={commonStyles.label}>Consultation Time *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.timeSlotContainer}
            >
              {timeSlots.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    consultationTime === time && styles.timeSlotActive
                  ]}
                  onPress={() => setConsultationTime(time)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    consultationTime === time && styles.timeSlotTextActive
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <Text style={commonStyles.subtitle}>Appointment Details</Text>
            
            <Text style={commonStyles.label}>Preferred Appointment Date *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="calendar_today" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
              />
            )}

            <Text style={[commonStyles.label, { marginTop: 16 }]}>Preferred Appointment Time *</Text>
            {loadingAvailability ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Checking availability...</Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.timeSlotContainer}
              >
                {appointmentTimeSlots.map((time, index) => {
                  const isBooked = isTimeSlotBooked(time);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        isBooked && styles.timeSlotBooked,
                        !isBooked && styles.timeSlotAvailable
                      ]}
                      onPress={() => {
                        if (!isBooked) {
                          const [timeStr, period] = time.split(' ');
                          const [hours, minutes] = timeStr.split(':');
                          let hour = parseInt(hours);
                          if (period === 'PM' && hour !== 12) hour += 12;
                          if (period === 'AM' && hour === 12) hour = 0;
                          const newDate = new Date(date);
                          newDate.setHours(hour, parseInt(minutes), 0, 0);
                          setDate(newDate);
                          console.log('BookScreen: Selected time slot:', time);
                        } else {
                          Alert.alert('Time Unavailable', 'This time slot is already booked. Please select another time.');
                        }
                      }}
                      disabled={isBooked}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        isBooked && styles.timeSlotTextBooked
                      ]}>
                        {time}
                      </Text>
                      {isBooked && (
                        <IconSymbol 
                          ios_icon_name="lock.fill" 
                          android_material_icon_name="lock" 
                          size={14} 
                          color={colors.grey} 
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <Text style={styles.availabilityNote}>
              <IconSymbol 
                ios_icon_name="info.circle" 
                android_material_icon_name="info" 
                size={14} 
                color={colors.text} 
              />
              {' '}Green = Available, Gray = Booked
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={commonStyles.subtitle}>Tattoo Details</Text>
            
            <Text style={commonStyles.label}>Description *</Text>
            <TextInput
              style={[commonStyles.input, commonStyles.inputMultiline]}
              placeholder="Describe your tattoo idea in detail..."
              placeholderTextColor={colors.grey}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={commonStyles.label}>Placement</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., Upper arm, back, chest"
              placeholderTextColor={colors.grey}
              value={placement}
              onChangeText={setPlacement}
            />

            <Text style={commonStyles.label}>Approximate Size</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., 4x6 inches, palm-sized"
              placeholderTextColor={colors.grey}
              value={size}
              onChangeText={setSize}
            />

            <Text style={commonStyles.label}>Reference Images</Text>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <IconSymbol 
                ios_icon_name="photo.badge.plus" 
                android_material_icon_name="add_photo_alternate" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.imagePickerText}>
                {referenceImages.length > 0 
                  ? `${referenceImages.length} image(s) selected` 
                  : 'Add Reference Images'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.depositInfo}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={24} 
              color={colors.primary} 
            />
            <View style={styles.depositTextContainer}>
              <Text style={styles.depositText}>
                <Text style={styles.depositTextBold}>$100 Non-Refundable Deposit Required</Text>
                {'\n\n'}
                After submitting your booking request:
                {'\n'}
                1. You will receive a payment link via email
                {'\n'}
                2. Pay the $100 deposit to secure your tattoo date
                {'\n'}
                3. Once payment is confirmed, your consultation will be scheduled
                {'\n'}
                4. Kyle will review and approve your appointment
                {'\n\n'}
                The remaining balance ($150/hr) is due at the time of service.
                {'\n\n'}
                📅 Your appointments will be automatically synced to your device calendar with reminders!
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[buttonStyles.primaryButton, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={buttonStyles.primaryButtonText}>Submit Booking Request</Text>
          </TouchableOpacity>

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
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  formSection: {
    width: '100%',
    marginBottom: 32,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
  },
  timeSlotContainer: {
    marginBottom: 8,
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  timeSlotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotAvailable: {
    backgroundColor: '#34C75920',
    borderColor: '#34C759',
  },
  timeSlotBooked: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    opacity: 0.5,
  },
  timeSlotText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotTextActive: {
    color: '#FFFFFF',
  },
  timeSlotTextBooked: {
    color: colors.grey,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    color: colors.text,
    fontSize: 14,
  },
  availabilityNote: {
    color: colors.text,
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  imagePickerText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  depositInfo: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  depositTextContainer: {
    flex: 1,
  },
  depositText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  depositTextBold: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: 15,
  },
  submitButton: {
    marginBottom: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
