import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const C = {
  active:   '#ffffff',
  inactive: 'rgba(255,255,255,0.5)',
  bar:      '#e26a07',
}

function TabIcon({ name, focused, color }: any) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={22} color={color} />
      {focused && <View style={styles.activeDot} />}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.active,
        tabBarInactiveTintColor: C.inactive,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="dashboard" options={{
        title: 'Inicio',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
        ),
      }} />

      {/* Ocultos del footer pero accesibles desde Inicio */}
      <Tabs.Screen name="workout" options={{
        href: null,
      }} />
      <Tabs.Screen name="recipes" options={{
        href: null,
      }} />

      <Tabs.Screen name="gym-community" options={{
        title: 'Rutinas comunidad',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={focused ? 'trophy' : 'trophy-outline'} focused={focused} color={color} />
        ),
      }} />
      <Tabs.Screen name="community" options={{
        title: 'Recetas comunidad',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} color={color} />
        ),
      }} />
      <Tabs.Screen name="trainer" options={{
        title: 'IA',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={focused ? 'sparkles' : 'sparkles-outline'} focused={focused} color={color} />
        ),
      }} />
      <Tabs.Screen name="store" options={{
        title: 'Tienda',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={focused ? 'bag' : 'bag-outline'} focused={focused} color={color} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Perfil',
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
        ),
      }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: C.bar,
    borderTopWidth: 2,
    borderTopColor: '#111111',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    marginTop: 2,
  },
})
