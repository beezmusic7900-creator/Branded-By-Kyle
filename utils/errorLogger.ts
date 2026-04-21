// Minimal error logger — safe version that does NOT override console methods
// to avoid maximum call stack recursion in React Native / Expo Go

import { Platform } from 'react-native';
import Constants from 'expo-constants';

declare const __DEV__: boolean;

let logServerUrl: string | null = null;

function getLogUrl(): string | null {
  if (logServerUrl !== null) return logServerUrl;
  try {
    const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).manifest?.hostUri;
    if (hostUri) {
      const protocol = hostUri.includes('ngrok') || hostUri.includes('.io') ? 'https' : 'http';
      logServerUrl = `${protocol}://${hostUri.split('/')[0]}/natively-logs`;
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      logServerUrl = `${window.location.origin}/natively-logs`;
    }
  } catch {}
  return logServerUrl;
}

function sendLog(level: string, message: string) {
  const url = getLogUrl();
  if (!url) return;
  // Use the original fetch directly — do NOT go through any intercepted path
  const originalFetch = (globalThis as any).__originalFetch ?? fetch;
  originalFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level,
      message,
      source: '',
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    }),
  }).catch(() => {});
}

export const setupErrorLogging = () => {
  if (!__DEV__) return;

  // Store originals BEFORE any override
  const origLog = console.log.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);

  // Save original fetch so sendLog can use it even after any polyfill
  (globalThis as any).__originalFetch = fetch;

  console.log = (...args: any[]) => {
    origLog(...args);
    try {
      const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      sendLog('log', msg);
    } catch {}
  };

  console.warn = (...args: any[]) => {
    origWarn(...args);
    try {
      const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      sendLog('warn', msg);
    } catch {}
  };

  console.error = (...args: any[]) => {
    origError(...args);
    try {
      const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      sendLog('error', msg);
    } catch {}
  };
};

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  setupErrorLogging();
}
