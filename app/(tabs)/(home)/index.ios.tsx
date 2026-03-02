
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  const handleAdminLogin = () => {
    console.log('HomeScreen: Navigating to admin login');
    try {
      router.push('/admin-login');
    } catch (error) {
      console.log('HomeScreen: Error navigating to admin login:', error);
    }
  };

  const handleAdminPanel = () => {
    console.log('HomeScreen: Navigating to admin panel');
    try {
      router.push('/admin-panel');
    } catch (error) {
      console.log('HomeScreen: Error navigating to admin panel:', error);
    }
  };

  const handleBookAppointment = () => {
    console.log('HomeScreen: Navigating to book appointment');
    try {
      router.push('/(tabs)/book');
    } catch (error) {
      console.log('HomeScreen: Error navigating to book:', error);
    }
  };

  const handleViewPortfolio = () => {
    console.log('HomeScreen: Navigating to portfolio');
    try {
      router.push('/(tabs)/portfolio');
    } catch (error) {
      console.log('HomeScreen: Error navigating to portfolio:', error);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
      style={[commonStyles.container]}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/f576c74c-16da-4b4e-91f3-c2170f4b4d92.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Branded By Kyle</Text>
            <Text style={styles.tagline}>Premium Tattoo Artistry</Text>
          </View>

          {!isAdmin && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={handleAdminLogin}
            >
              <IconSymbol 
                ios_icon_name="lock.shield" 
                android_material_icon_name="security" 
                size={16} 
                color={colors.grey} 
              />
              <Text style={styles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity 
              style={[buttonStyles.secondaryButton, styles.adminPanelButton]}
              onPress={handleAdminPanel}
            >
              <IconSymbol 
                ios_icon_name="lock.shield.fill" 
                android_material_icon_name="security" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={buttonStyles.secondaryButtonText}>Open Admin Panel</Text>
            </TouchableOpacity>
          )}

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome to my exclusive tattoo studio. I specialize in custom designs that tell your unique story through ink.
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[buttonStyles.primaryButton, styles.actionButton]}
              onPress={handleBookAppointment}
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
              onPress={handleViewPortfolio}
            >
              <IconSymbol 
                ios_icon_name="photo.fill" 
                android_material_icon_name="photo" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={[buttonStyles.secondaryButtonText, styles.actionButtonText]}>
                View Portfolio
              </Text>
            </TouchableOpacity>
          </View>

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
              <Text style={styles.cardText}>Monday - Saturday</Text>
              <Text style={styles.cardText}>11:00 AM - 11:00 PM</Text>
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
              <Text style={styles.cardText}>• Color Work</Text>
              <Text style={styles.cardText}>• Full Chest Pieces</Text>
              <Text style={styles.cardText}>• Portraits</Text>
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
              <Text style={styles.cardText}>Hourly Rate: $150/hr</Text>
              <Text style={styles.cardText}>Deposit: $100 (non-refundable)</Text>
              <Text style={[styles.cardText, styles.cardSubtext]}>
                Deposit required to secure booking
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  adminButtonText: {
    fontSize: 12,
    color: colors.grey,
    fontWeight: '500',
  },
  adminPanelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
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
