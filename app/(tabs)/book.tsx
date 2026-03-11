
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Alert, ImageBackground, Image, ActivityIndicator, Linking } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Calendar from 'expo-calendar';
import { useRouter } from 'expo-router';
import ConfirmModal from '@/components/ConfirmModal';
import { appointmentApi, AppointmentData } from '@/utils/api';
import { useAppointments } from '@/contexts/AppointmentContext';

const SQUARE_PAYMENT_LINK = 'https://square.link/u/jRrxMkF3';

export default function BookScreen() {
  const router = useRouter();
  const { addAppointment: addLocalAppointment } = useAppointments();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  useEffect(() => {
    console.log('BookScreen: Component mounted, checking availability');
    checkAvailability();
  }, [date]);

  const checkAvailability = async () => {
    const dateStr = date.toISOString().split('T')[0];
    console.log('BookScreen: Fetching booked slots for date:', dateStr);
    setLoadingAvailability(true);
    try {
      const result = await appointmentApi.getAvailability(dateStr);
      setBookedSlots(result.bookedSlots || []);
      console.log('BookScreen: Availability check complete, booked slots:', result.bookedSlots?.length || 0);
    } catch (error) {
      console.error('BookScreen: Error checking availability:', error);
      // Fallback to empty array if backend not available
      setBookedSlots([]);
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
    
    return isBooked;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      console.log('BookScreen: Appointment date changed to:', selectedDate.toISOString());
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
      console.log('BookScreen: Consultation date changed to:', selectedDate.toISOString());
      setConsultationDate(selectedDate);
    }
  };

  const pickImage = async () => {
    console.log('BookScreen: Opening image picker');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setReferenceImages([...referenceImages, ...newImages]);
        console.log('BookScreen: Selected', newImages.length, 'images');
      }
    } catch (error) {
      console.error('BookScreen: Error picking images:', error);
      Alert.alert('Error', 'Could not select images. Please try again.');
    }
  };

  const addToCalendar = async (appointmentDate: Date, consultDate: Date, clientName: string, tattooDescription: string) => {
    try {
      console.log('BookScreen: Requesting calendar permissions');
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('BookScreen: Calendar permission denied');
        return;
      }

      console.log('BookScreen: Calendar permission granted, getting calendars');
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      console.log('BookScreen: Found', calendars.length, 'calendars');
      
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!defaultCalendar) {
        console.log('BookScreen: No writable calendar found');
        return;
      }

      console.log('BookScreen: Using calendar:', defaultCalendar.title);

      // Create consultation event
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
      console.log('BookScreen: Consultation event created:', consultationEventId);

      // Create appointment event
      const appointmentEndDate = new Date(appointmentDate.getTime() + 3 * 60 * 60 * 1000);
      const appointmentEventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Tattoo Appointment - ${clientName}`,
        startDate: appointmentDate,
        endDate: appointmentEndDate,
        notes: `Tattoo Session\nClient: ${clientName}\nDescription: ${tattooDescription}\nRate: $150/hr\nDeposit: $100 (pending payment)`,
        alarms: [
          { relativeOffset: -24 * 60 },
          { relativeOffset: -2 * 60 }
        ],
      });
      console.log('BookScreen: Appointment event created:', appointmentEventId);
    } catch (error) {
      console.error('BookScreen: Calendar sync error:', error);
    }
  };

  const handleSubmit = async () => {
    console.log('BookScreen: Submit button pressed - starting validation');
    
    // Validation
    if (!name || !email || !phone || !description) {
      console.log('BookScreen: Validation failed - missing required fields');
      Alert.alert('Missing Information', 'Please fill in all required fields (Name, Email, Phone, Description).');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('BookScreen: Validation failed - invalid email format');
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Check consultation date is at least 24 hours before appointment
    const appointmentTime = date.getTime();
    const consultTime = consultationDate.getTime();
    const hoursDiff = (appointmentTime - consultTime) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      console.log('BookScreen: Validation failed - consultation too close to appointment');
      Alert.alert('Invalid Consultation Date', 'Consultation must be at least 24 hours before the appointment date.');
      return;
    }

    // Check if time slot is available
    const selectedHour = date.getHours();
    const selectedMinute = date.getMinutes();
    const period = selectedHour >= 12 ? 'PM' : 'AM';
    const displayHour = selectedHour > 12 ? selectedHour - 12 : (selectedHour === 0 ? 12 : selectedHour);
    const timeSlot = `${displayHour}:${selectedMinute.toString().padStart(2, '0')} ${period}`;
    
    if (isTimeSlotBooked(timeSlot)) {
      console.log('BookScreen: Validation failed - time slot already booked');
      Alert.alert('Time Slot Unavailable', 'This time slot is already booked. Please select a different time.');
      return;
    }

    console.log('BookScreen: Validation passed - submitting booking');
    setIsSubmitting(true);

    try {
      // Prepare consultation date with time
      const consultDateWithTime = new Date(consultationDate);
      const [time, period2] = consultationTime.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (period2 === 'PM' && hour !== 12) hour += 12;
      if (period2 === 'AM' && hour === 12) hour = 0;
      consultDateWithTime.setHours(hour, parseInt(minutes), 0, 0);

      const bookingData: AppointmentData = {
        name,
        email,
        phone,
        service: 'Custom Tattoo',
        appointmentDate: date.toISOString(),
        appointmentTime: timeSlot,
        consultationDate: consultDateWithTime.toISOString(),
        consultationTime,
        description,
        placement,
        size,
        referenceImages,
      };

      console.log('BookScreen: Submitting booking to backend:', bookingData);

      try {
        // Try to submit to backend
        const createdAppointment = await appointmentApi.create(bookingData);
        console.log('BookScreen: Booking created successfully:', createdAppointment.id);
        setPendingBookingId(createdAppointment.id);
        
        // Also save locally for offline access
        await addLocalAppointment({
          name,
          email,
          phone,
          date: date.toISOString(),
          consultationDate: consultDateWithTime.toISOString(),
          consultationTime,
          description,
          placement,
          size,
          referenceImages,
        });
      } catch (apiError) {
        console.error('BookScreen: Backend API error, saving locally only:', apiError);
        // Fallback to local storage if backend is not available
        await addLocalAppointment({
          name,
          email,
          phone,
          date: date.toISOString(),
          consultationDate: consultDateWithTime.toISOString(),
          consultationTime,
          description,
          placement,
          size,
          referenceImages,
        });
        setPendingBookingId(`local_${Date.now()}`);
      }

      // Sync to calendar
      await addToCalendar(date, consultDateWithTime, name, description);

      console.log('BookScreen: Booking submitted successfully, showing payment modal');
      setShowPaymentModal(true);
    } catch (error) {
      console.error('BookScreen: Error submitting booking:', error);
      Alert.alert('Booking Error', 'Failed to submit your booking. Please try again or contact us directly at brandedbykyle@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = async () => {
    console.log('BookScreen: User confirmed payment redirect to:', SQUARE_PAYMENT_LINK);
    setShowPaymentModal(false);
    
    try {
      console.log('BookScreen: Opening Square payment link:', SQUARE_PAYMENT_LINK);
      const canOpen = await Linking.canOpenURL(SQUARE_PAYMENT_LINK);
      
      if (canOpen) {
        await Linking.openURL(SQUARE_PAYMENT_LINK);
        console.log('BookScreen: Payment link opened successfully');
        
        // Show success message
        Alert.alert(
          'Booking Submitted',
          'Your booking has been saved with status "Pending Deposit".\n\nPlease complete the $100 deposit payment in the browser that just opened.\n\nOnce payment is confirmed, you will receive an email confirmation and your booking status will be updated.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form
                setName('');
                setEmail('');
                setPhone('');
                setDescription('');
                setPlacement('');
                setSize('');
                setReferenceImages([]);
                setPendingBookingId(null);
                
                // Navigate to appointments screen
                router.push('/(tabs)/appointments');
              }
            }
          ]
        );
      } else {
        console.log('BookScreen: Cannot open payment link');
        Alert.alert('Error', 'Unable to open payment link. Please contact us directly at brandedbykyle@gmail.com');
      }
    } catch (error) {
      console.error('BookScreen: Error opening payment link:', error);
      Alert.alert('Error', 'Unable to open payment link. Please contact us directly at brandedbykyle@gmail.com');
    }
  };

  const handleCancelPayment = () => {
    console.log('BookScreen: User cancelled payment');
    setShowPaymentModal(false);
    Alert.alert(
      'Booking Saved',
      'Your booking has been saved with status "Pending Deposit". You can complete the payment later from the Appointments screen.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Clear form
            setName('');
            setEmail('');
            setPhone('');
            setDescription('');
            setPlacement('');
            setSize('');
            setReferenceImages([]);
            setPendingBookingId(null);
            
            router.push('/(tabs)/appointments');
          }
        }
      ]
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
              editable={!isSubmitting}
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
              editable={!isSubmitting}
            />

            <Text style={commonStyles.label}>Phone Number *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.grey}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isSubmitting}
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
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="event" 
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
                      disabled={isBooked || isSubmitting}
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
              editable={!isSubmitting}
            />

            <Text style={commonStyles.label}>Placement</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., Upper arm, back, chest"
              placeholderTextColor={colors.grey}
              value={placement}
              onChangeText={setPlacement}
              editable={!isSubmitting}
            />

            <Text style={commonStyles.label}>Approximate Size</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="e.g., 4x6 inches, palm-sized"
              placeholderTextColor={colors.grey}
              value={size}
              onChangeText={setSize}
              editable={!isSubmitting}
            />

            <Text style={commonStyles.label}>Reference Images</Text>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={pickImage}
              disabled={isSubmitting}
            >
              <IconSymbol 
                ios_icon_name="photo.badge.plus" 
                android_material_icon_name="add-a-photo" 
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
                1. You will be redirected to complete the $100 deposit payment
                {'\n'}
                2. Once payment is processed and received, you will get a confirmation email
                {'\n'}
                3. Your consultation will be scheduled
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
            style={[
              buttonStyles.primaryButton, 
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={buttonStyles.primaryButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={buttonStyles.primaryButtonText}>Submit Booking Request</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>

      <ConfirmModal
        visible={showPaymentModal}
        title="Deposit Required"
        message={`Your booking has been saved with status "Pending Deposit".\n\nA non-refundable $100 deposit is required to confirm your booking. You will now be redirected to Square to complete the payment.\n\nAfter payment is confirmed, you will receive an email confirmation with your booking details.`}
        confirmText="Proceed to Payment"
        cancelText="Pay Later"
        onConfirm={handleProceedToPayment}
        onCancel={handleCancelPayment}
        icon="payment"
        iconColor={colors.primary}
      />
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomPadding: {
    height: 40,
  },
});
