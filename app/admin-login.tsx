
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('Admin login attempt:', { email });
    
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        console.log('Admin login successful');
        Alert.alert('Success', 'Welcome back, Kyle!', [
          {
            text: 'OK',
            onPress: () => {
              try {
                router.replace('/admin-panel');
              } catch (error) {
                console.log('Error navigating to admin panel:', error);
              }
            },
          },
        ]);
      } else {
        console.log('Admin login failed');
        Alert.alert('Error', 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.log('Admin login error:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    }
  };

  const handleBack = () => {
    console.log('AdminLogin: Navigating back');
    try {
      router.back();
    } catch (error) {
      console.log('AdminLogin: Error navigating back:', error);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
      style={commonStyles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow_back" 
              size={28} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Image
            source={require('@/assets/images/f576c74c-16da-4b4e-91f3-c2170f4b4d92.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <IconSymbol 
            ios_icon_name="lock.shield.fill" 
            android_material_icon_name="security" 
            size={64} 
            color={colors.primary} 
          />
          <Text style={commonStyles.title}>Admin Login</Text>
          <Text style={[commonStyles.text, commonStyles.textCenter, styles.subtitle]}>
            Enter your credentials to access the admin panel
          </Text>

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
            />

            <Text style={commonStyles.label}>Password</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.grey}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[buttonStyles.primaryButton, styles.loginButton]}
              onPress={handleLogin}
            >
              <Text style={buttonStyles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <IconSymbol 
              ios_icon_name="info.circle" 
              android_material_icon_name="info" 
              size={20} 
              color={colors.grey} 
            />
            <Text style={styles.infoText}>
              Admin access is restricted to authorized personnel only.
            </Text>
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
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  subtitle: {
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  loginButton: {
    marginTop: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
  },
});
