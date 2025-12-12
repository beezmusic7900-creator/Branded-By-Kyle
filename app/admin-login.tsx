
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      router.replace('/admin-panel');
    } else {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
      style={commonStyles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <IconSymbol 
              ios_icon_name="xmark.circle.fill" 
              android_material_icon_name="cancel" 
              size={32} 
              color={colors.text} 
            />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <IconSymbol 
                ios_icon_name="lock.shield.fill" 
                android_material_icon_name="admin_panel_settings" 
                size={64} 
                color={colors.primary} 
              />
              <Text style={commonStyles.title}>Admin Login</Text>
              <Text style={[commonStyles.text, commonStyles.textCenter]}>
                Enter your credentials to access the admin panel
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={commonStyles.label}>Email</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="admin@brandedbykyle.com"
                placeholderTextColor={colors.grey}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={commonStyles.label}>Password</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.grey}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity 
                style={[buttonStyles.primaryButton, styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={buttonStyles.primaryButtonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.infoText}>
                Default credentials: admin@brandedbykyle.com / BrandedByKyle2025!
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
});
