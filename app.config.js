export default {
  expo: {
    name: 'Medication Tracker',
    slug: 'meditrack',
    scheme: 'medication-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logo.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.medicationtracker.app',
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.medicationtracker.app',
      permissions: [
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'WAKE_LOCK',
      ],
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-camera',
      'expo-image-picker',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#FF231F7C',
          defaultChannel: 'medication-reminders',
          enableBackgroundRemoteNotifications: true,
          iosDisplayInForeground: true,
          mode: 'production',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "90a5481d-bcda-4e4e-af96-619fb62f71fe",
      },
    },
    owner: 'thanmaiya',
  },
};
