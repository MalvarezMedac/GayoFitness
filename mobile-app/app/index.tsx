import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setTimeout(() => {
        router.replace(token ? '/(tabs)/dashboard' : '/login');
      }, 100);
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f4f7' }}>
      <ActivityIndicator size="large" color="#ef4444" />
    </View>
  );
}
