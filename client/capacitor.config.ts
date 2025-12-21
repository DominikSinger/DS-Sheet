import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dssheet.app',
  appName: 'DS-Sheet',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#1e1e1e',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#4CAF50',
    },
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    cleartext: true,
    allowNavigation: ['*'],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
