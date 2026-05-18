const iosMapsKey = process.env.GOOGLE_MAPS_IOS_API_KEY;
const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

if (!iosMapsKey || !androidMapsKey) {
  console.warn(
    '[Eco Quest] Missing GOOGLE_MAPS_IOS_API_KEY or GOOGLE_MAPS_ANDROID_API_KEY in .env. ' +
      'Google Maps will not work until both are set and you run `npx expo prebuild`.'
  );
}

/** @type {import('expo/config').ExpoConfig} */
export default {
  expo: {
    name: 'Eco Quest',
    slug: 'eco-quest-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'ecoquest',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: 'com.ecoquest.mobile',
    },
    android: {
      package: 'com.ecoquest.mobile',
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FFFFFF',
        },
      ],
      'expo-secure-store',
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: iosMapsKey,
          androidGoogleMapsApiKey: androidMapsKey,
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Eco Quest uses your location to show nearby cleanup routes and track active routes.',
        },
      ],
    ],
    experiments: {
      reactCompiler: true,
    },
  },
};
