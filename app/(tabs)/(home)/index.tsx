import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, Instagram, MapPin, Star, Clock, Zap } from "lucide-react-native";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  background: "#0A0A0A",
  surface: "#141414",
  surfaceSecondary: "#1C1C1C",
  text: "#F5F0EB",
  textSecondary: "#A09890",
  textTertiary: "#5C5550",
  primary: "#C9A96E",
  primaryMuted: "rgba(201,169,110,0.12)",
  border: "rgba(201,169,110,0.15)",
  divider: "rgba(255,255,255,0.06)",
};

const GALLERY_ITEMS = [
  { id: "1", label: "Blackwork", color: "#1A1A1A", accent: "#C9A96E" },
  { id: "2", label: "Fine Line", color: "#141414", accent: "#E8D5B0" },
  { id: "3", label: "Realism", color: "#0F0F0F", accent: "#B8956A" },
  { id: "4", label: "Japanese", color: "#1C1010", accent: "#D4845A" },
  { id: "5", label: "Geometric", color: "#0A0F1A", accent: "#7AADCC" },
  { id: "6", label: "Neo-Trad", color: "#0F1A0A", accent: "#8CC97A" },
];

const STATS = [
  { icon: Star, value: "500+", label: "Tattoos" },
  { icon: Clock, value: "8 yrs", label: "Experience" },
  { icon: Zap, value: "4.9★", label: "Rating" },
];

function AnimBtn({
  onPress,
  style,
  children,
  disabled,
  accessibilityLabel,
}: {
  onPress: () => void;
  style?: object;
  children: React.ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          console.log("[Home] AnimBtn pressed");
          onPress();
        }}
        disabled={disabled}
        style={style}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: typeof Star; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Icon size={18} color={C.primary} strokeWidth={2} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GalleryCard({ item, index }: { item: (typeof GALLERY_ITEMS)[0]; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: 300 + index * 70, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: 300 + index * 70, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, index]);

  return (
    <Animated.View style={[styles.galleryCard, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.galleryCardInner, { backgroundColor: item.color }]}>
        <View style={[styles.galleryAccentBar, { backgroundColor: item.accent }]} />
        <Text style={[styles.galleryLabel, { color: item.accent }]}>{item.label}</Text>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslate = useRef(new Animated.Value(24)).current;
  const ctaScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, delay: 500, useNativeDriver: true, speed: 12, bounciness: 6 }),
    ]).start();
  }, [heroOpacity, heroTranslate, ctaScale]);

  const handleBookPress = useCallback(() => {
    console.log("[Home] Book Appointment CTA pressed — navigating to /book");
    router.push("/book");
  }, [router]);

  const handleInstagramPress = useCallback(() => {
    console.log("[Home] Instagram link pressed");
  }, []);

  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 600 : undefined;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero */}
        <View style={[styles.heroSection, { paddingTop: insets.top + 24 }, isTablet && { alignItems: "center" }]}>
          <Animated.View
            style={[
              styles.heroContent,
              { opacity: heroOpacity, transform: [{ translateY: heroTranslate }] },
              isTablet && { maxWidth: contentMaxWidth, width: "100%" },
            ]}
          >
            <View style={styles.locationBadge}>
              <MapPin size={12} color={C.primary} strokeWidth={2} />
              <Text style={styles.locationText}>Los Angeles, CA</Text>
            </View>
            <Text style={styles.artistName}>Branded</Text>
            <Text style={[styles.artistName, styles.artistNameAccent]}>By Kyle</Text>
            <Text style={styles.heroTagline}>Custom tattoo artistry. Every piece tells your story.</Text>
            <View style={styles.statsRow}>
              {STATS.map((s) => (
                <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* CTA */}
        <View style={[styles.ctaSection, isTablet && { alignItems: "center" }]}>
          <Animated.View style={[{ transform: [{ scale: ctaScale }] }, isTablet && { width: contentMaxWidth }]}>
            <AnimBtn
              onPress={handleBookPress}
              accessibilityLabel="Book an appointment with Kyle"
              style={styles.bookBtn}
            >
              <View style={styles.bookBtnInner}>
                <Calendar size={20} color="#0A0A0A" strokeWidth={2.5} />
                <Text style={styles.bookBtnText}>Book Appointment</Text>
              </View>
            </AnimBtn>
          </Animated.View>
          <Text style={[styles.ctaSubtext, isTablet && { textAlign: "center" }]}>
            Free consultation · No deposit required
          </Text>
        </View>

        {/* Gallery */}
        <View style={[styles.section, isTablet && { alignItems: "center" }]}>
          <View style={isTablet ? { width: contentMaxWidth } : undefined}>
            <Text style={styles.sectionTitle}>Styles</Text>
            <View style={styles.galleryGrid}>
              {GALLERY_ITEMS.map((item, index) => (
                <GalleryCard key={item.id} item={item} index={index} />
              ))}
            </View>
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, isTablet && { alignItems: "center" }]}>
          <View style={[styles.aboutCard, isTablet && { width: contentMaxWidth }]}>
            <Text style={styles.sectionTitle}>About Kyle</Text>
            <Text style={styles.aboutText}>
              With over 8 years of experience, Kyle specializes in custom tattoo design — from delicate fine-line work to bold blackwork and everything in between. Every piece is drawn from scratch, tailored to your vision.
            </Text>
            <View style={styles.divider} />
            <AnimBtn
              onPress={handleInstagramPress}
              accessibilityLabel="View Kyle's Instagram portfolio"
              style={styles.instagramBtn}
            >
              <View style={styles.instagramBtnInner}>
                <Instagram size={16} color={C.primary} strokeWidth={2} />
                <Text style={styles.instagramBtnText}>@brandedbykyletattoo</Text>
              </View>
            </AnimBtn>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={[styles.bottomCtaSection, isTablet && { alignItems: "center" }]}>
          <AnimBtn
            onPress={handleBookPress}
            accessibilityLabel="Book an appointment with Kyle"
            style={[styles.bookBtn, isTablet && { width: contentMaxWidth }]}
          >
            <View style={styles.bookBtnInner}>
              <Calendar size={20} color="#0A0A0A" strokeWidth={2.5} />
              <Text style={styles.bookBtnText}>Book Appointment</Text>
            </View>
          </AnimBtn>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  scrollContent: { flexGrow: 1 },
  heroSection: { paddingHorizontal: 24, paddingBottom: 32 },
  heroContent: {},
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.primaryMuted,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  locationText: { fontSize: 12, fontWeight: "600", color: C.primary, letterSpacing: 0.3 },
  artistName: { fontSize: 52, fontWeight: "800", color: C.text, letterSpacing: -1.5, lineHeight: 56 },
  artistNameAccent: { color: C.primary, marginBottom: 16 },
  heroTagline: { fontSize: 16, color: C.textSecondary, lineHeight: 24, marginBottom: 28, maxWidth: 320 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.divider,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 17, fontWeight: "800", color: C.text, letterSpacing: -0.3 },
  statLabel: { fontSize: 11, color: C.textTertiary, fontWeight: "500" },
  ctaSection: { paddingHorizontal: 24, marginBottom: 40 },
  bookBtn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  bookBtnInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  bookBtnText: { fontSize: 18, fontWeight: "800", color: "#0A0A0A", letterSpacing: -0.3 },
  ctaSubtext: { fontSize: 13, color: C.textTertiary, marginTop: 10, paddingHorizontal: 4 },
  section: { paddingHorizontal: 24, marginBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: C.text, letterSpacing: -0.3, marginBottom: 16 },
  galleryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  galleryCard: { width: "30.5%", aspectRatio: 1, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: C.divider },
  galleryCardInner: { flex: 1, justifyContent: "flex-end", padding: 10 },
  galleryAccentBar: { position: "absolute", top: 0, left: 0, right: 0, height: 2, opacity: 0.7 },
  galleryLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  aboutCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.divider,
    padding: 20,
  },
  aboutText: { fontSize: 15, color: C.textSecondary, lineHeight: 24 },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 16 },
  instagramBtn: { alignSelf: "flex-start" },
  instagramBtnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  instagramBtnText: { fontSize: 14, fontWeight: "600", color: C.primary },
  bottomCtaSection: { paddingHorizontal: 24, marginBottom: 8 },
});
