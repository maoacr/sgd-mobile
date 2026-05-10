import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

export default function SuperadminLayout() {
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
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
      }}
    >
      <Tabs.Screen
        name="(tournaments)"
        options={{
          title: 'Torneos',
          headerTitle: 'Torneos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(teams)"
        options={{
          title: 'Equipos',
          headerTitle: 'Equipos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(players)"
        options={{
          title: 'Jugadores',
          headerTitle: 'Jugadores',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="football" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(referees)"
        options={{
          title: 'Árbitros',
          headerTitle: 'Árbitros',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: 'Ajustes',
          headerTitle: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}