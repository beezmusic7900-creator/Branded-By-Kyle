
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={[commonStyles.container]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://prod-finalquest-user-projects-storage-bucket-aws.s3.amazonaws.com/user-projects/c14bb87b-7216-4302-b8c9-4f9b65473fa3/assets/images/20c6cd0a-ba5d-459e-8e90-26e9ea15a04c.png?AWSAccessKeyId=AKIAVRUVRKQJC5DISQ4Q&Signature=rJNmo7PZAhGLSQ3xUNSsCHJVpAI%3D&Expires=1765640566' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>Branded By Kyle</Text>
          <Text style={styles.tagline}>Premium Tattoo Artistry</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome to my exclusive tattoo studio. I specialize in custom designs that tell your unique story through ink.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[buttonStyles.primaryButton, styles.actionButton]}
            onPress={() => router.push('/(tabs)/book')}
          >
            <IconSymbol 
              ios_icon_name="calendar.badge.plus" 
              android_material_icon_name="event" 
              size={24} 
              color="#FFFFFF" 
            />
            <Text style={[buttonStyles.primaryButtonText, styles.actionButtonText]}>
              Book Appointment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[buttonStyles.secondaryButton, styles.actionButton]}
            onPress={() => router.push('/(tabs)/portfolio')}
          >
            <IconSymbol 
              ios_icon_name="photo.fill" 
              android_material_icon_name="photo_library" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[buttonStyles.secondaryButtonText, styles.actionButtonText]}>
              View Portfolio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={commonStyles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="schedule" 
                size={28} 
                color={colors.primary} 
              />
              <Text style={styles.cardTitle}>Hours</Text>
            </View>
            <Text style={styles.cardText}>Tuesday - Saturday</Text>
            <Text style={styles.cardText}>10:00 AM - 6:00 PM</Text>
            <Text style={[styles.cardText, styles.cardSubtext]}>By Appointment Only</Text>
          </View>

          <View style={commonStyles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={28} 
                color={colors.primary} 
              />
              <Text style={styles.cardTitle}>Specialties</Text>
            </View>
            <Text style={styles.cardText}>• Custom Designs</Text>
            <Text style={styles.cardText}>• Black & Grey Realism</Text>
            <Text style={styles.cardText}>• Color Work</Text>
            <Text style={styles.cardText}>• Cover-ups</Text>
          </View>

          <View style={commonStyles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="payments" 
                size={28} 
                color={colors.primary} 
              />
              <Text style={styles.cardTitle}>Pricing</Text>
            </View>
            <Text style={styles.cardText}>Minimum: $150</Text>
            <Text style={styles.cardText}>Hourly Rate: $200/hr</Text>
            <Text style={[styles.cardText, styles.cardSubtext]}>
              Deposit required to secure booking
            </Text>
          </View>
        </View>

        {/* Bottom Padding */}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textBright,
    marginBottom: 8,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonText: {
    marginLeft: 0,
  },
  infoCardsContainer: {
    width: '100%',
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textBright,
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  cardSubtext: {
    fontSize: 13,
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
