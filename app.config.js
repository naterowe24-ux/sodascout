// Dynamic config — extends app.json with env-var injection for API keys.
// Expo reads EXPO_PUBLIC_* from .env.local automatically during `expo start`.
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    },
  },
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  plugins: [
    'expo-router',
    'expo-status-bar',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'SodaScout uses your location to find the best fountain soda nearby.',
      },
    ],
  ],
});
