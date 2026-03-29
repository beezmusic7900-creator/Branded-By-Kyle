import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Star, DollarSign, CalendarDays, Images, ShieldCheck } from 'lucide-react-native';

const BLUE = '#2979FF';
const CARD_BG = 'rgba(30,30,30,0.85)';

const bgImage = require('@/assets/images/6bc221b7-8868-4bab-854d-98cc25e404ee.jpeg');
const logoImage = require('@/assets/images/7b25c61f-edfd-4567-a346-cb9b175c7378.png');

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

const specialties = ['Custom Designs', 'Color Work', 'Full Chest Pieces', 'Portraits', 'Cover-ups'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBookAppointment = () => {
    console.log('[Home] Book Appointment button pressed');
    router.push('/book');
  };

  const handleViewPortfolio = () => {
    console.log('[Home] View Portfolio button pressed');
    router.push('/(tabs)/portfolio');
  };

  return (
    <ImageBackground source={resolveImageSource(bgImage)} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logo} contentFit="contain" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Branded By Kyle</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>PREMIUM TATTOO ARTISTRY</Text>

        {/* Admin badge */}
        <View style={styles.adminRow}>
          <ShieldCheck size={16} color="#888" strokeWidth={1.5} />
          <Text style={styles.adminText}>Admin</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Welcome to my exclusive tattoo studio. I specialize in custom designs that tell your unique story through ink.
        </Text>

        {/* Book Appointment button */}
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookAppointment} activeOpacity={0.85}>
          <CalendarDays size={22} color="#fff" strokeWidth={2} />
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>

        {/* View Portfolio button */}
        <TouchableOpacity style={styles.portfolioBtn} onPress={handleViewPortfolio} activeOpacity={0.85}>
          <Images size={22} color={BLUE} strokeWidth={2} />
          <Text style={styles.portfolioBtnText}>View Portfolio</Text>
        </TouchableOpacity>

        {/* Hours card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Clock size={20} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Hours</Text>
          </View>
          <Text style={styles.cardText}>Monday - Saturday</Text>
          <Text style={styles.cardText}>11:00 AM - 11:00 PM</Text>
          <Text style={styles.cardItalic}>By Appointment Only</Text>
        </View>

        {/* Specialties card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Star size={20} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Specialties</Text>
          </View>
          {specialties.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.cardText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Pricing card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <DollarSign size={20} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Pricing</Text>
          </View>
          <Text style={styles.cardText}>Hourly Rate: $150/hr</Text>
          <Text style={styles.cardText}>Deposit: $100 (non-refundable)</Text>
          <Text style={styles.cardItalic}>Deposit required to secure booking</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 180,
    height: 180,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BLUE,
    textAlign: 'center',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  adminText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BLUE,
    borderRadius: 16,
    height: 56,
    width: '100%',
    marginBottom: 12,
  },
  bookBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  portfolioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(20,20,20,0.7)',
    borderRadius: 16,
    height: 56,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: BLUE,
  },
  portfolioBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: BLUE,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardText: {
    fontSize: 15,
    color: '#ddd',
    marginBottom: 4,
    lineHeight: 22,
  },
  cardItalic: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 22,
  },
});
