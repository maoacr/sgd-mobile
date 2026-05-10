import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: '#687076',
        tabBarStyle: {
          height: 84,
          paddingTop: 8,
          paddingBottom: 28,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="venues"
        options={{
          title: 'Canchas',
          headerTitle: 'Mis Canchas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Más',
          headerTitle: 'Más opciones',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
      {/* Hide these from tab bar — accessed via "Más" menu */}
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="calendar" options={{ href: null }} />
    </Tabs>
  );
}