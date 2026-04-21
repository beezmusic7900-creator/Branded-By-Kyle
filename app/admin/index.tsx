import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  apiAdminGetBookings,
  apiAdminUpdateBookingStatus,
  apiAdminGetBlackoutDates,
  apiAdminCreateBlackoutDate,
  apiAdminDeleteBlackoutDate,
  type Booking,
  type BlackoutDate,
} from "@/utils/api";

const BG = require("../../assets/images/58f69f1a-4699-4acb-8d6c-e139c289ff00.webp");
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
const WARNING = "#F5A623";
const BORDER = "rgba(255,255,255,0.08)";

const ADMIN_EMAIL = "brandedbykyle@gmail.com";
const ADMIN_PASSWORD = "Kyleesdad2016!";

// In-memory session — works in Expo Go without native module issues
let adminSessionActive = false;

type TabName = "bookings" | "blackouts";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const color =
    status === "confirmed" ? SUCCESS : status === "pending_payment" ? WARNING : DANGER;
  const label =
    status === "confirmed" ? "Confirmed" : status === "pending_payment" ? "Pending" : "Cancelled";
  return (
    <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    console.log("[AdminLogin] Login pressed", { email });
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password.trim() === ADMIN_PASSWORD) {
        adminSessionActive = true;
        console.log("[AdminLogin] Login successful");
        onLogin();
      } else {
        console.warn("[AdminLogin] Invalid credentials");
        setError("Invalid email or password.");
      }
    } catch (err) {
      console.error("[AdminLogin] Error", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, password, onLogin]);

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.72)" }}>
        <View style={[styles.loginContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <Image source={logoImage} style={styles.loginLogo} contentFit="contain" />
          <Text style={styles.loginTitle}>Admin Login</Text>
          <Text style={[styles.loginSubtitle, { color: TEXT_SEC }]}>Branded By Kyle — Staff Only</Text>

          {!!error && (
            <View style={[styles.errorBanner, { backgroundColor: "rgba(255,69,58,0.1)", borderColor: "rgba(255,69,58,0.3)" }]}>
              <Text style={[styles.errorBannerText, { color: DANGER }]}>{error}</Text>
            </View>
          )}

          <View style={styles.loginForm}>
            <Text style={[styles.label, { color: TEXT_SEC }]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="admin@brandedbykyletattoo.com"
              placeholderTextColor={TEXT_TERT}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.loginInput, { color: TEXT, backgroundColor: SURFACE2, borderColor: BORDER }]}
            />
            <Text style={[styles.label, { color: TEXT_SEC, marginTop: 12 }]}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={TEXT_TERT}
              secureTextEntry
              style={[styles.loginInput, { color: TEXT, backgroundColor: SURFACE2, borderColor: BORDER }]}
            />
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginBtn, { backgroundColor: BLUE, opacity: loading ? 0.6 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingBlackouts, setLoadingBlackouts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Add blackout state
  const [showAddBlackout, setShowAddBlackout] = useState(false);
  const [newBlackoutDate, setNewBlackoutDate] = useState<Date>(new Date());
  const [newBlackoutReason, setNewBlackoutReason] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [addingBlackout, setAddingBlackout] = useState(false);

  const fetchBookings = useCallback(async () => {
    console.log("[AdminDashboard] Fetching bookings");
    setLoadingBookings(true);
    try {
      const data = await apiAdminGetBookings();
      console.log("[AdminDashboard] Bookings fetched", { count: data.length });
      setBookings(data);
    } catch (err) {
      console.error("[AdminDashboard] Failed to fetch bookings", err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchBlackouts = useCallback(async () => {
    console.log("[AdminDashboard] Fetching blackout dates");
    setLoadingBlackouts(true);
    try {
      const data = await apiAdminGetBlackoutDates();
      console.log("[AdminDashboard] Blackout dates fetched", { count: data.length });
      setBlackouts(data);
    } catch (err) {
      console.error("[AdminDashboard] Failed to fetch blackout dates", err);
    } finally {
      setLoadingBlackouts(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchBlackouts();
  }, [fetchBookings, fetchBlackouts]);

  const onRefresh = useCallback(async () => {
    console.log("[AdminDashboard] Pull-to-refresh triggered");
    setRefreshing(true);
    await Promise.all([fetchBookings(), fetchBlackouts()]);
    setRefreshing(false);
  }, [fetchBookings, fetchBlackouts]);

  const updateBookingStatus = useCallback(async (id: string, status: string) => {
    console.log("[AdminDashboard] Updating booking status", { id, status });
    try {
      const updated = await apiAdminUpdateBookingStatus(id, status);
      console.log("[AdminDashboard] Booking status updated", { id, status });
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      console.error("[AdminDashboard] Failed to update booking", err);
      Alert.alert("Error", "Failed to update booking status.");
    }
  }, []);

  const deleteBlackout = useCallback(async (id: string) => {
    console.log("[AdminDashboard] Deleting blackout date", { id });
    Alert.alert("Delete Blackout Date", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiAdminDeleteBlackoutDate(id);
            console.log("[AdminDashboard] Blackout date deleted", { id });
            setBlackouts((prev) => prev.filter((b) => b.id !== id));
          } catch (err) {
            console.error("[AdminDashboard] Failed to delete blackout", err);
            Alert.alert("Error", "Failed to delete blackout date.");
          }
        },
      },
    ]);
  }, []);

  const addBlackout = useCallback(async () => {
    console.log("[AdminDashboard] Adding blackout date", { date: newBlackoutDate.toISOString(), reason: newBlackoutReason });
    setAddingBlackout(true);
    try {
      const dateStr = newBlackoutDate.toISOString().split("T")[0];
      const data = await apiAdminCreateBlackoutDate(dateStr, newBlackoutReason.trim() || undefined);
      console.log("[AdminDashboard] Blackout date added", { id: data.id });
      setBlackouts((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)));
      setShowAddBlackout(false);
      setNewBlackoutReason("");
    } catch (err) {
      console.error("[AdminDashboard] Failed to add blackout", err);
      Alert.alert("Error", "Failed to add blackout date.");
    } finally {
      setAddingBlackout(false);
    }
  }, [newBlackoutDate, newBlackoutReason]);

  const blackoutDateDisplay = newBlackoutDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={[styles.dashContainer, { backgroundColor: BG_COLOR, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.dashHeader, { backgroundColor: SURFACE }]}>
        <Text style={styles.dashTitle}>Admin Dashboard</Text>
        <TouchableOpacity
          onPress={() => {
            console.log("[AdminDashboard] Logout pressed");
            onLogout();
          }}
          style={[styles.logoutBtn, { borderColor: DANGER }]}
        >
          <Text style={[styles.logoutBtnText, { color: DANGER }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: SURFACE2 }]}>
        {(["bookings", "blackouts"] as TabName[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === "bookings" ? "Bookings" : "Blackout Dates";
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                console.log("[AdminDashboard] Tab pressed:", tab);
                setActiveTab(tab);
              }}
              style={[styles.tabItem, isActive && { borderBottomColor: BLUE, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabLabel, { color: isActive ? BLUE : TEXT_SEC }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "bookings" && (
          <>
            {loadingBookings && !refreshing ? (
              <ActivityIndicator color={BLUE} style={{ marginTop: 40 }} />
            ) : bookings.length === 0 ? (
              <Text style={[styles.emptyText, { color: TEXT_SEC }]}>No bookings yet.</Text>
            ) : (
              bookings.map((booking) => {
                const dateDisplay = booking.preferred_date
                  ? new Date(booking.preferred_date + "T12:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <View key={booking.id} style={[styles.bookingCard, { backgroundColor: SURFACE2, borderColor: BORDER }]}>
                    <View style={styles.bookingCardHeader}>
                      <Text style={[styles.bookingName, { color: TEXT }]}>{booking.name}</Text>
                      <StatusBadge status={booking.status} />
                    </View>
                    <Text style={[styles.bookingDetail, { color: TEXT_SEC }]}>{dateDisplay}</Text>
                    <Text style={[styles.bookingDetail, { color: TEXT_SEC }]}>{booking.tattoo_style}</Text>
                    <Text style={[styles.bookingDetail, { color: TEXT_TERT }]}>{booking.email}</Text>
                    <View style={styles.bookingActions}>
                      {booking.status !== "confirmed" && (
                        <TouchableOpacity
                          onPress={() => updateBookingStatus(booking.id, "confirmed")}
                          style={[styles.actionBtn, { backgroundColor: SUCCESS + "22", borderColor: SUCCESS }]}
                        >
                          <Text style={[styles.actionBtnText, { color: SUCCESS }]}>Confirm</Text>
                        </TouchableOpacity>
                      )}
                      {booking.status !== "cancelled" && (
                        <TouchableOpacity
                          onPress={() => updateBookingStatus(booking.id, "cancelled")}
                          style={[styles.actionBtn, { backgroundColor: DANGER + "22", borderColor: DANGER }]}
                        >
                          <Text style={[styles.actionBtnText, { color: DANGER }]}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {activeTab === "blackouts" && (
          <>
            {/* Add blackout button */}
            <TouchableOpacity
              onPress={() => {
                console.log("[AdminDashboard] Add blackout date pressed");
                setShowAddBlackout(!showAddBlackout);
              }}
              style={[styles.addBlackoutBtn, { backgroundColor: BLUE }]}
            >
              <Text style={styles.addBlackoutBtnText}>
                {showAddBlackout ? "Cancel" : "+ Add Blackout Date"}
              </Text>
            </TouchableOpacity>

            {showAddBlackout && (
              <View style={[styles.addBlackoutForm, { backgroundColor: SURFACE2, borderColor: BORDER }]}>
                <Text style={[styles.label, { color: TEXT_SEC, marginBottom: 8 }]}>Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    console.log("[AdminDashboard] Blackout date picker opened");
                    setShowDatePicker(true);
                  }}
                  style={[styles.loginInput, { backgroundColor: SURFACE, borderColor: BORDER, justifyContent: "center" }]}
                >
                  <Text style={{ color: TEXT, fontSize: 15 }}>{blackoutDateDisplay}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={newBlackoutDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_, date) => {
                      if (Platform.OS !== "ios") setShowDatePicker(false);
                      if (date) {
                        console.log("[AdminDashboard] Blackout date selected:", date.toISOString());
                        setNewBlackoutDate(date);
                      }
                    }}
                  />
                )}
                {showDatePicker && Platform.OS === "ios" && (
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ alignItems: "center", marginTop: 8 }}>
                    <Text style={{ color: BLUE, fontWeight: "600" }}>Done</Text>
                  </TouchableOpacity>
                )}
                <Text style={[styles.label, { color: TEXT_SEC, marginTop: 12, marginBottom: 8 }]}>Reason (optional)</Text>
                <TextInput
                  value={newBlackoutReason}
                  onChangeText={setNewBlackoutReason}
                  placeholder="e.g. Convention, Vacation..."
                  placeholderTextColor={TEXT_TERT}
                  style={[styles.loginInput, { color: TEXT, backgroundColor: SURFACE, borderColor: BORDER }]}
                />
                <TouchableOpacity
                  onPress={addBlackout}
                  disabled={addingBlackout}
                  style={[styles.loginBtn, { backgroundColor: BLUE, opacity: addingBlackout ? 0.6 : 1, marginTop: 12 }]}
                >
                  {addingBlackout ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginBtnText}>Save Blackout Date</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {loadingBlackouts && !refreshing ? (
              <ActivityIndicator color={BLUE} style={{ marginTop: 40 }} />
            ) : blackouts.length === 0 ? (
              <Text style={[styles.emptyText, { color: TEXT_SEC }]}>No blackout dates.</Text>
            ) : (
              blackouts.map((b) => {
                const dateDisplay = b.date
                  ? new Date(b.date + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <View key={b.id} style={[styles.blackoutCard, { backgroundColor: SURFACE2, borderColor: BORDER }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.blackoutDate, { color: TEXT }]}>{dateDisplay}</Text>
                      {!!b.reason && (
                        <Text style={[styles.blackoutReason, { color: TEXT_SEC }]}>{b.reason}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteBlackout(b.id)}
                      style={[styles.deleteBtn, { borderColor: DANGER }]}
                    >
                      <Text style={[styles.deleteBtnText, { color: DANGER }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Main Admin Screen ────────────────────────────────────────────────────────
export default function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(adminSessionActive);

  const handleLogin = useCallback(() => {
    adminSessionActive = true;
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    console.log("[Admin] Logging out");
    adminSessionActive = false;
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

const styles = StyleSheet.create({
  // Login
  loginContainer: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  loginLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  loginSubtitle: {
    fontSize: 14,
    marginBottom: 32,
  },
  loginForm: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  loginInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    width: "100%",
  },
  errorBannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Dashboard
  dashContainer: {
    flex: 1,
  },
  dashHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  dashTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
    letterSpacing: -0.3,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
  // Booking card
  bookingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  bookingCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookingName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  bookingDetail: {
    fontSize: 13,
    marginBottom: 3,
  },
  bookingActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // Blackout
  addBlackoutBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  addBlackoutBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  addBlackoutForm: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  blackoutCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  blackoutDate: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  blackoutReason: {
    fontSize: 13,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 12,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
