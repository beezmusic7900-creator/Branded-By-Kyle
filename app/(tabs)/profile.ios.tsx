
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Linking, ImageBackground } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const handleContact = (type: 'email' | 'phone' | 'instagram') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:kyle@brandedbykyle.com');
        break;
      case 'phone':
        Linking.openURL('tel:+15551234567');
        break;
      case 'instagram':
        Linking.openURL('https://instagram.com/brandedbykyle');
        break;
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
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: 'https://prod-finalquest-user-projects-storage-bucket-aws.s3.amazonaws.com/user-projects/c14bb87b-7216-4302-b8c9-4f9b65473fa3/assets/images/20c6cd0a-ba5d-459e-8e90-26e9ea15a04c.png?AWSAccessKeyId=AKIAVRUVRKQJC5DISQ4Q&Signature=rJNmo7PZAhGLSQ3xUNSsCHJVpAI%3D&Expires=1765640566' }}
              style={styles.profileImage}
              resizeMode="contain"
            />
            <Text style={styles.artistName}>Kyle</Text>
            <Text style={styles.artistTitle}>Master Tattoo Artist</Text>
          </View>

          {/* Bio Section */}
          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>About Me</Text>
            </View>
            <Text style={styles.bioText}>
              With over 10 years of experience in the tattoo industry, I specialize in creating custom designs 
              that tell your unique story. My passion is bringing your vision to life through detailed, 
              high-quality tattoo work that you&apos;ll be proud to wear for a lifetime.
            </Text>
            <Text style={styles.bioText}>
              I believe every tattoo should be a masterpiece, which is why I take the time to understand 
              your ideas and work closely with you throughout the entire process.
            </Text>
          </View>

          {/* Specialties */}
          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>Specialties</Text>
            </View>
            <View style={styles.specialtiesList}>
              <View style={styles.specialtyItem}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.specialtyText}>Custom Designs</Text>
              </View>
              <View style={styles.specialtyItem}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.specialtyText}>Black & Grey Realism</Text>
              </View>
              <View style={styles.specialtyItem}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.specialtyText}>Color Work</Text>
              </View>
              <View style={styles.specialtyItem}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.specialtyText}>Cover-ups & Touch-ups</Text>
              </View>
              <View style={styles.specialtyItem}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.specialtyText}>Portrait Work</Text>
              </View>
              <View style={styles.specialtyItem}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={styles.specialtyText}>Geometric & Tribal</Text>
              </View>
            </View>
          </View>

          {/* Pricing */}
          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="dollarsign.circle.fill" 
                android_material_icon_name="payments" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>Pricing</Text>
            </View>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Minimum</Text>
              <Text style={styles.pricingValue}>$150</Text>
            </View>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Hourly Rate</Text>
              <Text style={styles.pricingValue}>$200/hr</Text>
            </View>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Deposit</Text>
              <Text style={styles.pricingValue}>$100</Text>
            </View>
            <Text style={styles.pricingNote}>
              * Deposit is non-refundable but applies to final cost
            </Text>
          </View>

          {/* Contact */}
          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="phone.fill" 
                android_material_icon_name="phone" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleContact('email')}
            >
              <IconSymbol 
                ios_icon_name="envelope.fill" 
                android_material_icon_name="email" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.contactButtonText}>kyle@brandedbykyle.com</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleContact('phone')}
            >
              <IconSymbol 
                ios_icon_name="phone.fill" 
                android_material_icon_name="phone" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.contactButtonText}>(555) 123-4567</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleContact('instagram')}
            >
              <IconSymbol 
                ios_icon_name="camera.fill" 
                android_material_icon_name="photo_camera" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.contactButtonText}>@brandedbykyle</Text>
            </TouchableOpacity>
          </View>

          {/* Studio Info */}
          <View style={commonStyles.card}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                ios_icon_name="building.2.fill" 
                android_material_icon_name="business" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.sectionTitle}>Studio Information</Text>
            </View>
            <Text style={styles.studioText}>
              <Text style={styles.studioLabel}>Hours: </Text>
              Tuesday - Saturday, 10:00 AM - 6:00 PM
            </Text>
            <Text style={styles.studioText}>
              <Text style={styles.studioLabel}>Location: </Text>
              By appointment only
            </Text>
            <Text style={[styles.studioText, styles.studioNote]}>
              Private studio - address provided upon booking confirmation
            </Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textBright,
    marginBottom: 4,
    letterSpacing: 1,
  },
  artistTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textBright,
    letterSpacing: 0.5,
  },
  bioText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  specialtiesList: {
    gap: 12,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specialtyText: {
    fontSize: 15,
    color: colors.text,
  },
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 15,
    color: colors.text,
  },
  pricingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  pricingNote: {
    fontSize: 13,
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  contactButtonText: {
    fontSize: 15,
    color: colors.text,
  },
  studioText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  studioLabel: {
    fontWeight: '700',
    color: colors.textBright,
  },
  studioNote: {
    fontSize: 13,
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
