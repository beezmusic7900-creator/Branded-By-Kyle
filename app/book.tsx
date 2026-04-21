import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ImageBackground,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, CheckCircle, AlertCircle, Calendar, User, Mail, Phone, FileText } from "lucide-react-native";
import { apiCreateBooking, apiConfirmBooking, apiGetUnavailableDates } from '@/utils/api';

const BG = require("../assets/images/58f69f1a-4699-4acb-8d6c-e139c289ff00.webp");
const logoImage = require("@/assets/images/7b25c61f-edfd-4567-a346-cb9b175c7378.png");

const BLUE = "#2979FF";
const BG_COLOR = "#0A0A0A";
const SURFACE = "#141414";
const SURFACE2 = "#1C1C1C";
const TEXT = "#F5F0EB";
const TEXT_SEC = "#A09890";
const TEXT_TERT = "#5C5550";
const DANGER = "#FF453A";
const SUCCESS = "#30D158";
const BORDER = "rgba(255,255,255,0.08)";
const INPUT_FOCUS = BLUE;

const TATTOO_STYLES = [
  "Traditional",
  "Neo-Traditional",
  "Blackwork",
  "Fine Line",
  "Realism",
  "Watercolor",
  "Japanese",
  "Geometric",
  "Tribal",
  "Other",
];

const SQUARE_PAYMENT_URL = "https://square.link/u/jRrxMkF3";
const DEPOSIT_SECONDS = 30 * 60;

// ─── Animated Button ─────────────────────────────────────────────────────────
function AnimBtn({
  onPress,
  style,
  children,
  disabled,
}: {
  onPress: () => void;
  style?: object;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [scale]);
  return (
    <Animated.View style={[{ transform: [{ scale }] }, disabled && { opacity: 0.5 }]}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        disabled={disabled}
        style={style}
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Form Input ───────────────────────────────────────────────────────────────
function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  error,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  icon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: TEXT_SEC }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: SURFACE2,
            borderColor: error ? DANGER : focused ? INPUT_FOCUS : BORDER,
          },
        ]}
      >
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={TEXT_TERT}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize ?? "sentences"}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              color: TEXT,
              paddingLeft: icon ? 0 : 14,
              height: multiline ? undefined : 48,
              minHeight: multiline ? 80 : undefined,
              textAlignVertical: multiline ? "top" : "center",
            },
          ]}
        />
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color={DANGER} />
          <Text style={[styles.errorText, { color: DANGER }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Step 1: Date & Info Form ─────────────────────────────────────────────────
function Step1({
  onContinue,
}: {
  onContinue: (data: {
    name: string;
    email: string;
    phone: string;
    style: string;
    description: string;
    date: Date;
    bookingId: string;
  }) => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  useEffect(() => {
    async function fetchUnavailable() {
      try {
        const dates = await apiGetUnavailableDates();
        setUnavailableDates(new Set(dates));
        console.log('[BookStep1] Unavailable dates fetched', { count: dates.length });
      } catch (err) {
        console.warn('[BookStep1] Failed to fetch unavailable dates', err);
      }
    }
    fetchUnavailable();
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!selectedStyle) newErrors.style = "Please select a tattoo style";
    if (!description.trim()) newErrors.description = "Please describe your tattoo idea";
    if (!preferredDate) newErrors.date = "Preferred date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, phone, selectedStyle, description, preferredDate]);

  const handleContinue = useCallback(async () => {
    console.log("[BookStep1] Continue pressed");
    setSubmitError(null);
    if (!validate()) {
      console.log("[BookStep1] Validation failed");
      return;
    }
    setLoading(true);
    try {
      const result = await apiCreateBooking({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        tattoo_style: selectedStyle,
        description: description.trim(),
        preferred_date: preferredDate!.toISOString().split('T')[0],
      });
      const bookingId = result.id;
      console.log("[BookStep1] Booking created", { id: bookingId });
      onContinue({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        style: selectedStyle,
        description: description.trim(),
        date: preferredDate!,
        bookingId,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("[BookStep1] Failed to create booking", message);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  }, [validate, name, email, phone, selectedStyle, description, preferredDate, onContinue]);

  const handleDateChange = useCallback(
    (_: unknown, date?: Date) => {
      if (Platform.OS !== "ios") setShowDatePicker(false);
      if (date) {
        console.log("[BookStep1] Date selected:", date.toISOString());
        const dateStr = date.toISOString().split("T")[0];
        if (unavailableDates.has(dateStr)) {
          setDateWarning("This date is unavailable. Please choose another.");
        } else {
          setDateWarning(null);
        }
        setPreferredDate(date);
        setErrors((prev) => ({ ...prev, date: "" }));
      } else {
        setShowDatePicker(false);
      }
    },
    [unavailableDates]
  );

  const dateDisplay = preferredDate
    ? preferredDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })
    : "Select a date";

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Stack.Screen
        options={{
          title: "Book Appointment",
          headerStyle: { backgroundColor: SURFACE },
          headerTitleStyle: { color: TEXT, fontWeight: "700" },
          headerTintColor: BLUE,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => { console.log("[BookStep1] Close pressed"); router.back(); }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ padding: 4 }}
            >
              <X size={22} color={BLUE} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formHeader}>
          <Image source={logoImage} style={styles.headerLogo} contentFit="contain" />
          <Text style={[styles.formTitle, { color: TEXT }]}>Book a Session</Text>
          <Text style={[styles.formSubtitle, { color: TEXT_SEC }]}>
            Fill in your details below to request an appointment.
          </Text>
        </View>

        {!!submitError && (
          <View style={[styles.errorBanner, { backgroundColor: "rgba(255,69,58,0.1)", borderColor: "rgba(255,69,58,0.3)" }]}>
            <AlertCircle size={16} color={DANGER} />
            <Text style={[styles.errorBannerText, { color: DANGER }]}>{submitError}</Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: BLUE }]}>Contact Info</Text>
        <FormInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoCapitalize="words"
          error={errors.name}
          icon={<User size={16} color={TEXT_TERT} style={{ marginLeft: 14, marginRight: 8 }} />}
        />
        <FormInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          icon={<Mail size={16} color={TEXT_TERT} style={{ marginLeft: 14, marginRight: 8 }} />}
        />
        <FormInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 (555) 000-0000"
          keyboardType="phone-pad"
          autoCapitalize="none"
          error={errors.phone}
          icon={<Phone size={16} color={TEXT_TERT} style={{ marginLeft: 14, marginRight: 8 }} />}
        />

        <Text style={[styles.sectionLabel, { color: BLUE, marginTop: 8 }]}>Tattoo Details</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: TEXT_SEC }]}>Style</Text>
          <View style={styles.styleGrid}>
            {TATTOO_STYLES.map((style) => {
              const isSelected = selectedStyle === style;
              return (
                <AnimBtn
                  key={style}
                  onPress={() => {
                    console.log("[BookStep1] Style selected:", style);
                    setSelectedStyle(style);
                    setErrors((prev) => ({ ...prev, style: "" }));
                  }}
                  style={[
                    styles.styleChip,
                    {
                      backgroundColor: isSelected ? BLUE : SURFACE2,
                      borderColor: isSelected ? BLUE : BORDER,
                    },
                  ]}
                >
                  <Text style={[styles.styleChipText, { color: isSelected ? "#fff" : TEXT_SEC }]}>
                    {style}
                  </Text>
                </AnimBtn>
              );
            })}
          </View>
          {!!errors.style && (
            <View style={styles.errorRow}>
              <AlertCircle size={12} color={DANGER} />
              <Text style={[styles.errorText, { color: DANGER }]}>{errors.style}</Text>
            </View>
          )}
        </View>

        <FormInput
          label="Describe Your Idea"
          value={description}
          onChangeText={setDescription}
          placeholder="Size, placement, colors, references, inspiration..."
          multiline
          numberOfLines={4}
          error={errors.description}
          icon={<FileText size={16} color={TEXT_TERT} style={{ marginLeft: 14, marginRight: 8, marginTop: 14 }} />}
        />

        {/* Date picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: TEXT_SEC }]}>Preferred Date</Text>
          <TouchableOpacity
            onPress={() => {
              console.log("[BookStep1] Date picker opened");
              setShowDatePicker(true);
            }}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: SURFACE2,
                  borderColor: errors.date ? DANGER : BORDER,
                },
              ]}
            >
              <View style={styles.inputIcon}>
                <Calendar size={16} color={TEXT_TERT} style={{ marginLeft: 14, marginRight: 8 }} />
              </View>
              <Text
                style={[
                  styles.input,
                  { color: preferredDate ? TEXT : TEXT_TERT, paddingLeft: 0, height: 48, lineHeight: 48 },
                ]}
              >
                {dateDisplay}
              </Text>
            </View>
          </TouchableOpacity>
          {!!dateWarning && (
            <View style={styles.errorRow}>
              <AlertCircle size={12} color="#F5A623" />
              <Text style={[styles.errorText, { color: "#F5A623" }]}>{dateWarning}</Text>
            </View>
          )}
          {!!errors.date && (
            <View style={styles.errorRow}>
              <AlertCircle size={12} color={DANGER} />
              <Text style={[styles.errorText, { color: DANGER }]}>{errors.date}</Text>
            </View>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={preferredDate ?? tomorrow}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={tomorrow}
            onChange={handleDateChange}
          />
        )}
        {showDatePicker && Platform.OS === "ios" && (
          <TouchableOpacity
            onPress={() => setShowDatePicker(false)}
            style={[styles.submitBtn, { backgroundColor: SURFACE2, marginTop: 0, marginBottom: 16 }]}
          >
            <Text style={[styles.submitBtnText, { color: BLUE }]}>Done</Text>
          </TouchableOpacity>
        )}

        <AnimBtn
          onPress={handleContinue}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: loading ? "rgba(41,121,255,0.5)" : BLUE }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.submitBtnText, { color: "#fff" }]}>Continue to Deposit →</Text>
          )}
        </AnimBtn>

        <Text style={[styles.disclaimer, { color: TEXT_TERT }]}>
          A $100 non-refundable deposit is required to secure your booking.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Step 2: Deposit Payment ──────────────────────────────────────────────────
function Step2({
  name,
  email,
  phone,
  date,
  style,
  description,
  bookingId,
  onConfirmed,
  onExpired,
}: {
  name: string;
  email: string;
  phone: string;
  date: Date;
  style: string;
  description: string;
  bookingId: string;
  onConfirmed: () => void;
  onExpired: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(DEPOSIT_SECONDS);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          console.log("[BookStep2] Timer expired");
          onExpired();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onExpired]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const dateDisplay = date.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });

  const handlePayDeposit = useCallback(() => {
    console.log("[BookStep2] Pay deposit button pressed — opening Square link");
    Linking.openURL(SQUARE_PAYMENT_URL);
  }, []);

  const handleIvePaid = useCallback(async () => {
    console.log("[BookStep2] 'I've completed my payment' pressed — confirming booking", { bookingId });
    setConfirmError(null);
    setConfirming(true);
    try {
      await apiConfirmBooking(bookingId);
      console.log("[BookStep2] Booking confirmed successfully");

      // Send confirmation email (non-fatal)
      try {
        const bookingData = { name, email, phone, tattoo_style: style, description, preferred_date: date.toISOString().split('T')[0] };
        await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-booking-confirmation`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
              'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
            },
            body: JSON.stringify({ ...bookingData, booking_id: bookingId }),
          }
        );
        console.log('[BookStep2] Confirmation email sent');
      } catch (emailErr) {
        console.warn('[BookStep2] Email send failed (non-fatal):', emailErr);
      }

      onConfirmed();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      console.error("[BookStep2] Confirm failed", message);
      setConfirmError(message);
    } finally {
      setConfirming(false);
    }
  }, [bookingId, name, email, phone, style, description, date, onConfirmed]);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          title: "Deposit",
          headerStyle: { backgroundColor: SURFACE },
          headerTitleStyle: { color: TEXT, fontWeight: "700" },
          headerTintColor: BLUE,
          headerLeft: () => null,
        }}
      />

      {/* Summary card */}
      <View style={[styles.summaryCard, { backgroundColor: SURFACE2, borderColor: BORDER }]}>
        <Text style={[styles.summaryTitle, { color: TEXT_SEC }]}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryKey, { color: TEXT_SEC }]}>Name</Text>
          <Text style={[styles.summaryVal, { color: TEXT }]}>{name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryKey, { color: TEXT_SEC }]}>Date</Text>
          <Text style={[styles.summaryVal, { color: TEXT }]}>{dateDisplay}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryKey, { color: TEXT_SEC }]}>Style</Text>
          <Text style={[styles.summaryVal, { color: TEXT }]}>{style}</Text>
        </View>
      </View>

      {/* Deposit info */}
      <Text style={[styles.depositAmount, { color: TEXT }]}>$100 Non-Refundable Deposit Required</Text>
      <Text style={[styles.depositExplain, { color: TEXT_SEC }]}>
        Your appointment is held for 30 minutes. Complete your deposit now to secure your booking.
      </Text>

      {/* Countdown */}
      <View style={[styles.timerBox, { backgroundColor: SURFACE2, borderColor: secondsLeft < 60 ? DANGER : BLUE }]}>
        <Text style={[styles.timerLabel, { color: TEXT_SEC }]}>Time remaining</Text>
        <Text style={[styles.timerValue, { color: secondsLeft < 60 ? DANGER : BLUE }]}>{timerDisplay}</Text>
      </View>

      {!!confirmError && (
        <View style={[styles.errorBanner, { backgroundColor: "rgba(255,69,58,0.1)", borderColor: "rgba(255,69,58,0.3)", marginBottom: 16 }]}>
          <AlertCircle size={16} color={DANGER} />
          <Text style={[styles.errorBannerText, { color: DANGER }]}>{confirmError}</Text>
        </View>
      )}

      {/* Pay button */}
      <AnimBtn
        onPress={handlePayDeposit}
        style={[styles.submitBtn, { backgroundColor: BLUE }]}
      >
        <Text style={[styles.submitBtnText, { color: "#fff" }]}>Pay $100 Deposit</Text>
      </AnimBtn>

      {/* Confirm payment button */}
      <AnimBtn
        onPress={handleIvePaid}
        disabled={confirming}
        style={[styles.outlineBtn, { borderColor: BLUE }]}
      >
        {confirming ? (
          <ActivityIndicator color={BLUE} />
        ) : (
          <Text style={[styles.outlineBtnText, { color: BLUE }]}>I've completed my payment</Text>
        )}
      </AnimBtn>
    </ScrollView>
  );
}

// ─── Step 3: Confirmation ─────────────────────────────────────────────────────
function Step3({ name, date, email }: { name: string; date: Date; email: string }) {
  const router = useRouter();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const dateDisplay = date.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fadeIn]);

  const thankYouText = `Thank you ${name}! Your appointment on ${dateDisplay} is confirmed. Kyle will contact you at ${email} within 24 hours with further details.`;

  return (
    <View style={styles.successContainer}>
      <Stack.Screen
        options={{
          title: "Confirmed",
          headerStyle: { backgroundColor: SURFACE },
          headerTitleStyle: { color: TEXT, fontWeight: "700" },
          headerTintColor: BLUE,
          headerLeft: () => null,
        }}
      />
      <Animated.View style={[styles.successContent, { opacity: fadeIn }]}>
        <View style={[styles.successIconRing, { backgroundColor: "rgba(48,209,88,0.12)", borderColor: "rgba(48,209,88,0.3)" }]}>
          <CheckCircle size={48} color={SUCCESS} strokeWidth={1.5} />
        </View>
        <Text style={[styles.successTitle, { color: TEXT }]}>Booking Confirmed!</Text>
        <Text style={[styles.successSubtitle, { color: TEXT_SEC }]}>{thankYouText}</Text>
        <AnimBtn
          onPress={() => {
            console.log("[BookStep3] Done pressed");
            router.back();
          }}
          style={[styles.submitBtn, { backgroundColor: BLUE, width: "100%" }]}
        >
          <Text style={[styles.submitBtnText, { color: "#fff" }]}>Done</Text>
        </AnimBtn>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BookScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookingData, setBookingData] = useState<{
    name: string;
    email: string;
    phone: string;
    style: string;
    description: string;
    date: Date;
    bookingId: string;
  } | null>(null);

  const handleStep1Continue = useCallback(
    (data: { name: string; email: string; phone: string; style: string; description: string; date: Date; bookingId: string }) => {
      console.log("[Book] Advancing to Step 2 (deposit)");
      setBookingData(data);
      setStep(2);
    },
    []
  );

  const handleStep2Confirmed = useCallback(() => {
    console.log("[Book] Advancing to Step 3 (confirmation)");
    setStep(3);
  }, []);

  const handleExpired = useCallback(() => {
    console.log("[Book] Deposit timer expired — returning to Step 1");
    setStep(1);
    setBookingData(null);
  }, []);

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.72)" }}>
        {step === 1 && <Step1 onContinue={handleStep1Continue} />}
        {step === 2 && bookingData && (
          <Step2
            name={bookingData.name}
            email={bookingData.email}
            phone={bookingData.phone}
            date={bookingData.date}
            style={bookingData.style}
            description={bookingData.description}
            bookingId={bookingData.bookingId}
            onConfirmed={handleStep2Confirmed}
            onExpired={handleExpired}
          />
        )}
        {step === 3 && bookingData && (
          <Step3 name={bookingData.name} date={bookingData.date} email={bookingData.email} />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerLogo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 16,
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  inputIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingRight: 14,
    paddingVertical: 12,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  styleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  styleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  styleChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitBtn: {
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  outlineBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  // Summary card
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryKey: {
    fontSize: 14,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  // Deposit
  depositAmount: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  depositExplain: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  timerBox: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 20,
    alignItems: "center",
    marginBottom: 28,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
  },
  // Success
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  successIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 40,
  },
});
