import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import type { ColorValue } from 'react-native';
import { colors } from '../../constants/theme';

type TabIconProps = { color: ColorValue; focused: boolean; size: number };

export default function TabLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.grayMid,
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }: TabIconProps) => <Text style={{ color: color as string, fontSize: 20 }}>🗺</Text>,
        }}
      />
      <Tabs.Screen
        name="top-sips"
        options={{
          title: 'Top Sips',
          tabBarIcon: ({ color }: TabIconProps) => <Text style={{ color: color as string, fontSize: 20 }}>⭐</Text>,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color }: TabIconProps) => <Text style={{ color: color as string, fontSize: 24 }}>＋</Text>,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }: TabIconProps) => <Text style={{ color: color as string, fontSize: 20 }}>🔖</Text>,
        }}
      />
      <Tabs.Screen
        name="travel"
        options={{
          title: 'Travel',
          tabBarIcon: ({ color }: TabIconProps) => <Text style={{ color: color as string, fontSize: 20 }}>✈️</Text>,
        }}
      />
    </Tabs>
  );
}
