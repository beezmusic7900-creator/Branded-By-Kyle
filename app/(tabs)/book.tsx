
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

export default function BookScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('');
  const [size, setSize] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
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

  const handleSubmit = () => {
    if (!name || !email || !phone || !description) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    console.log('Booking submitted:', { name, email, phone, date, description, placement, size, referenceImages });
    Alert.alert(
      'Booking Request Submitted',
      'Thank you! Your booking request has been submitted. Kyle will review it and contact you shortly to confirm your appointment and discuss deposit details.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="calendar.badge.plus" 
            android_material_icon_name="event" 
            size={48} 
            color={colors.primary} 
          />
          <Text style={commonStyles.title}>Book Your Appointment</Text>
          <Text style={[commonStyles.text, commonStyles.textCenter]}>
            Fill out the form below to request an appointment. A deposit will be required to secure your booking.
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
          <Text style={commonStyles.subtitle}>Appointment Details</Text>
          
          <Text style={commonStyles.label}>Preferred Date</Text>
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
              minimumDate={new Date()}
            />
          )}
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
          <Text style={styles.depositText}>
            A non-refundable deposit will be required to secure your appointment. 
            You will receive payment instructions via email after Kyle reviews your request.
          </Text>
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
  );
}

const styles = StyleSheet.create({
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
  depositText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
