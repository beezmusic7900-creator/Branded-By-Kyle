
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import React from 'react';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <ImageBackground
        source={require('@/assets/images/f17fedc1-b2a1-4b83-8bc6-33e74e0d6fa7.png')}
        style={commonStyles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Image
              source={require('@/assets/images/f576c74c-16da-4b4e-91f3-c2170f4b4d92.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={64}
              color={colors.primary}
            />
            <Text style={styles.title}>Page Not Found</Text>
            <Text style={styles.message}>
              The page you&apos;re looking for doesn&apos;t exist.
            </Text>
            <Link href="/(tabs)/(home)/" style={styles.link}>
              <View style={styles.linkButton}>
                <IconSymbol
                  ios_icon_name="house.fill"
                  android_material_icon_name="home"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.linkText}>Go to Home</Text>
              </View>
            </Link>
          </View>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textBright,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  link: {
    width: '100%',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
