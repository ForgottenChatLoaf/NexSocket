import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartoutlet.app',
  appName: 'NexSocket',
  webDir: 'dist',
  android: {
    // Allow cleartext on localhost for local dev builds
    // Production APK distributes the bundled web assets, so no network needed
    allowMixedContent: false,
    // Status bar overlays the WebView for edge-to-edge Obsidian look
    backgroundColor: '#0E1117',
    // Capacitor BLE plugin requires the app to handle BT permissions explicitly
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#0E1117',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    BluetoothLe: {
      // displayStrings: defined in plugin defaults
    },
  },
};

export default config;
