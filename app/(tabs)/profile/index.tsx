import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Star, DollarSign, CheckCircle } from 'lucide-react-native';

const BLUE = '#2979FF';
const CARD_BG = 'rgba(30,30,30,0.85)';

const bgImage = require('../../../assets/images/58f69f1a-4699-4acb-8d6c-e139c289ff00.webp');
const logoImage = require('@/assets/images/7b25c61f-edfd-4567-a346-cb9b175c7378.png');

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

const specialties = ['Custom Designs', 'Color Work', 'Full Chest Pieces', 'Portraits', 'Cover-ups'];

const aboutText1 = 'With over 10 years of experience in the tattoo industry, I specialize in creating custom designs that tell your unique story. My passion is bringing your vision to life through detailed, high-quality tattoo work that you\'ll be proud to wear for a lifetime.';
const aboutText2 = 'I believe every tattoo should be a masterpiece, which is why I take the time to understand your ideas and work closely with you throughout the entire process.';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={resolveImageSource(bgImage)} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image source={logoImage} style={styles.logo} contentFit="contain" />

        {/* Name */}
        <Text style={styles.name}>Kyle</Text>

        {/* Title */}
        <Text style={styles.artistTitle}>MASTER TATTOO ARTIST</Text>

        {/* About Me card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={22} color={BLUE} strokeWidth={2} />
            <Text style={styles.cardTitle}>About Me</Text>
          </View>
          <Text style={styles.cardText}>{aboutText1}</Text>
          <Text style={[styles.cardText, { marginTop: 12 }]}>{aboutText2}</Text>
        </View>

        {/* Specialties card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Star size={22} color={BLUE} strokeWidth={2} fill={BLUE} />
            <Text style={styles.cardTitle}>Specialties</Text>
          </View>
          {specialties.map((item) => (
            <View key={item} style={styles.specialtyRow}>
              <CheckCircle size={20} color={BLUE} strokeWidth={2} fill={BLUE} />
              <Text style={styles.specialtyText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Pricing card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.dollarCircle}>
              <DollarSign size={18} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Pricing</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.cardText}>Hourly Rate</Text>
            <Text style={styles.priceValue}>$150/hr</Text>
          </View>
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
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  artistTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BLUE,
    textAlign: 'center',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 28,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardText: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 24,
  },
  cardItalic: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 6,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  specialtyText: {
    fontSize: 15,
    color: '#ddd',
    fontWeight: '500',
  },
  dollarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 15,
    color: BLUE,
    fontWeight: '700',
  },
});
