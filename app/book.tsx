import React, { useState, useRef, useCallback } from "react";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, CheckCircle, AlertCircle, Calendar, User, Mail, Phone, FileText } from "lucide-react-native";
import { submitBooking, BookingPayload } from "@/utils/supabase";

// ─── Palette ────────────────────────────────────────────────────────────────
const LIGHT = {
  background: "#0A0A0A",
  surface: "#141414",
  surfaceSecondary: "#1C1C1C",
  text: "#F5F0EB",
  textSecondary: "#A09890",
  textTertiary: "#5C5550",
  primary: "#C9A96E",
  primaryMuted: "rgba(201,169,110,0.12)",
  danger: "#FF453A",
  success: "#30D158",
  border: "rgba(201,169,110,0.15)",
  divider: "rgba(255,255,255,0.06)",
  inputBg: "#1C1C1C",
  inputBorder: "rgba(255,255,255,0.08)",
  inputFocusBorder: "#C9A96E",
};

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

// ─── Animated Pressable ──────────────────────────────────────────────────────
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
        onPress={() => {
          console.log("[BookAppointment] Button pressed");
          onPress();
        }}
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

// ─── Styled Input ────────────────────────────────────────────────────────────
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
  const C = LIGHT;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: C.inputBg,
            borderColor: error ? C.danger : focused ? C.inputFocusBorder : C.inputBorder,
          },
        ]}
      >
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textTertiary}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize ?? "sentences"}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              color: C.text,
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
          <AlertCircle size={12} color={C.danger} />
          <Text style={[styles.errorText, { color: C.danger }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function BookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = LIGHT;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const successOpacity = useRef(new Animated.Value(0)).current;

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

  const handleSubmit = useCallback(async () => {
    console.log("[BookAppointment] handleSubmit called");
    setSubmitError(null);

    if (!validate()) {
      console.log("[BookAppointment] Validation failed");
      return;
    }

    const payload: BookingPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      tattoo_style: selectedStyle,
      description: description.trim(),
      preferred_date: preferredDate ? preferredDate.toISOString() : "",
    };

    console.log("[BookAppointment] Starting network request to Supabase", payload);
    setLoading(true);

    try {
      const result = await submitBooking(payload);
      console.log("[BookAppointment] Booking success", result);
      setSuccess(true);
      Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("[BookAppointment] Booking failed", message);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  }, [validate, name, email, phone, selectedStyle, description, preferredDate, successOpacity]);

  const handleClose = useCallback(() => {
    console.log("[BookAppointment] Close pressed");
    router.back();
  }, [router]);

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: C.background, paddingBottom: insets.bottom + 32 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Animated.View style={[styles.successContent, { opacity: successOpacity }]}>
          <View style={[styles.successIconRing, { backgroundColor: "rgba(48,209,88,0.12)", borderColor: "rgba(48,209,88,0.3)" }]}>
            <CheckCircle size={48} color={C.success} strokeWidth={1.5} />
          </View>
          <Text style={[styles.successTitle, { color: C.text }]}>Request Sent!</Text>
          <Text style={[styles.successSubtitle, { color: C.textSecondary }]}>
            {"Kyle will review your request and reach out within 48 hours to confirm your appointment."}
          </Text>
          <AnimBtn
            onPress={handleClose}
            style={[styles.successBtn, { backgroundColor: C.primary }]}
          >
            <Text style={[styles.successBtnText, { color: "#0A0A0A" }]}>Done</Text>
          </AnimBtn>
        </Animated.View>
      </View>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          title: "Book Appointment",
          headerStyle: { backgroundColor: C.surface },
          headerTitleStyle: { color: C.text, fontWeight: "700" },
          headerTintColor: C.primary,
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Close booking form"
              accessibilityRole="button"
              style={{ padding: 4 }}
            >
              <X size={22} color={C.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.formHeader}>
          <Text style={[styles.formTitle, { color: C.text }]}>Book a Session</Text>
          <Text style={[styles.formSubtitle, { color: C.textSecondary }]}>
            Fill in your details and Kyle will get back to you within 48 hours.
          </Text>
        </View>

        {/* Submit error banner */}
        {!!submitError && (
          <View style={[styles.errorBanner, { backgroundColor: "rgba(255,69,58,0.1)", borderColor: "rgba(255,69,58,0.3)" }]}>
            <AlertCircle size={16} color={C.danger} />
            <Text style={[styles.errorBannerText, { color: C.danger }]}>{submitError}</Text>
          </View>
        )}

        {/* Contact info */}
        <Text style={[styles.sectionLabel, { color: C.primary }]}>Contact Info</Text>

        <FormInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoCapitalize="words"
          error={errors.name}
          icon={<User size={16} color={C.textTertiary} style={{ marginLeft: 14, marginRight: 8 }} />}
        />
        <FormInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          icon={<Mail size={16} color={C.textTertiary} style={{ marginLeft: 14, marginRight: 8 }} />}
        />
        <FormInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+1 (555) 000-0000"
          keyboardType="phone-pad"
          autoCapitalize="none"
          error={errors.phone}
          icon={<Phone size={16} color={C.textTertiary} style={{ marginLeft: 14, marginRight: 8 }} />}
        />

        {/* Tattoo details */}
        <Text style={[styles.sectionLabel, { color: C.primary, marginTop: 8 }]}>Tattoo Details</Text>

        {/* Style picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Style</Text>
          <View style={styles.styleGrid}>
            {TATTOO_STYLES.map((style) => {
              const isSelected = selectedStyle === style;
              return (
                <AnimBtn
                  key={style}
                  onPress={() => {
                    console.log("[BookAppointment] Style selected:", style);
                    setSelectedStyle(style);
                    setErrors((prev) => ({ ...prev, style: "" }));
                  }}
                  style={[
                    styles.styleChip,
                    {
                      backgroundColor: isSelected ? C.primary : C.surfaceSecondary,
                      borderColor: isSelected ? C.primary : C.inputBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.styleChipText,
                      { color: isSelected ? "#0A0A0A" : C.textSecondary },
                    ]}
                  >
                    {style}
                  </Text>
                </AnimBtn>
              );
            })}
          </View>
          {!!errors.style && (
            <View style={styles.errorRow}>
              <AlertCircle size={12} color={C.danger} />
              <Text style={[styles.errorText, { color: C.danger }]}>{errors.style}</Text>
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
          icon={<FileText size={16} color={C.textTertiary} style={{ marginLeft: 14, marginRight: 8, marginTop: 14 }} />}
        />

        {/* Date picker field */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Preferred Date</Text>
          <TouchableOpacity
            onPress={() => {
              console.log("[BookAppointment] Date picker opened");
              setShowDatePicker(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Select preferred date"
          >
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: C.inputBg,
                  borderColor: errors.date ? C.danger : C.inputBorder,
                },
              ]}
            >
              <View style={styles.inputIcon}>
                <Calendar size={16} color={C.textTertiary} style={{ marginLeft: 14, marginRight: 8 }} />
              </View>
              <Text
                style={[
                  styles.input,
                  {
                    color: preferredDate ? C.text : C.textTertiary,
                    paddingLeft: 0,
                    height: 48,
                    lineHeight: 48,
                  },
                ]}
              >
                {preferredDate
                  ? preferredDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })
                  : "Select a date"}
              </Text>
            </View>
          </TouchableOpacity>
          {!!errors.date && (
            <View style={styles.errorRow}>
              <AlertCircle size={12} color={C.danger} />
              <Text style={[styles.errorText, { color: C.danger }]}>{errors.date}</Text>
            </View>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={preferredDate ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === "ios" ? true : false);
              if (date) {
                console.log("[BookAppointment] Date selected:", date.toISOString());
                setPreferredDate(date);
                setErrors((prev) => ({ ...prev, date: "" }));
                if (Platform.OS !== "ios") setShowDatePicker(false);
              } else {
                setShowDatePicker(false);
              }
            }}
          />
        )}
        {showDatePicker && Platform.OS === "ios" && (
          <TouchableOpacity
            onPress={() => setShowDatePicker(false)}
            style={[styles.submitBtn, { backgroundColor: C.surfaceSecondary, marginTop: 0, marginBottom: 16 }]}
          >
            <Text style={[styles.submitBtnText, { color: C.primary }]}>Done</Text>
          </TouchableOpacity>
        )}

        {/* Submit */}
        <AnimBtn
          onPress={handleSubmit}
          disabled={loading}
          style={[
            styles.submitBtn,
            { backgroundColor: loading ? "rgba(201,169,110,0.5)" : C.primary },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : (
            <Text style={[styles.submitBtnText, { color: "#0A0A0A" }]}>Send Booking Request</Text>
          )}
        </AnimBtn>

        <Text style={[styles.disclaimer, { color: C.textTertiary }]}>
          By submitting, you agree that Kyle may contact you via email or phone to discuss your appointment.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
    ...(Platform.OS === "ios" && { borderCurve: "continuous" as any }),
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
    ...(Platform.OS === "ios" && { borderCurve: "continuous" as any }),
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
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
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
  successBtn: {
    height: 56,
    borderRadius: 14,
    ...(Platform.OS === "ios" && { borderCurve: "continuous" as any }),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
    width: "100%",
  },
  successBtnText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
