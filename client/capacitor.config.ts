import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dssheet.app',
  appName: 'DS-Sheet',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e1e1e',
      showSpinner: false,
    },
  },
  server: {
    // For local standalone mode
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
};

export default config;
