import {
  View, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Text, Image,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { loginUser, registerUser } from '@/services/api';

const GOALS = [
  { value: 'ganar_musculo', label: '💪 Músculo' },
  { value: 'perdida_peso', label: '🏃 Perder peso' },
  { value: 'resistencia', label: '🏅 Resistencia' },
];

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    peso: '', altura: '', edad: '', goal: 'ganar_musculo',
  });

  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!form.email) return setErrors({ email: 'Introduce tu correo' });
    if (!form.password) return setErrors({ password: 'Introduce tu contraseña' });

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(form.email, form.password);
      } else {
        if (!form.name) return setErrors({ general: 'El nombre es obligatorio' });
        await registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
          peso: form.peso ? Number(form.peso) : undefined,
          altura: form.altura ? Number(form.altura) : undefined,
          edad: form.edad ? Number(form.edad) : undefined,
          goal: form.goal,
        });
      }
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      const msg: string = err.message ?? 'Error desconocido';
      if (msg.includes('correo') || msg.includes('email') || msg.includes('registrado')) {
        setErrors({ email: msg });
      } else if (msg.includes('contraseña') || msg.includes('password')) {
        setErrors({ password: msg });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.inner, { paddingTop: insets.top + 40 }]}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/logo_GayoFitness.png')} style={styles.logo} />
          <ThemedText style={styles.companyName}>GayoFitness</ThemedText>
        </View>
        <ThemedText style={styles.title}>
          {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </ThemedText>

        {mode === 'register' && (
          <>
            <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#9ca3af"
              value={form.name} onChangeText={(v) => set('name', v)} />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.half]} placeholder="Peso (kg)"
                placeholderTextColor="#9ca3af" keyboardType="numeric"
                value={form.peso} onChangeText={(v) => set('peso', v)} />
              <TextInput style={[styles.input, styles.half]} placeholder="Altura (cm)"
                placeholderTextColor="#9ca3af" keyboardType="numeric"
                value={form.altura} onChangeText={(v) => set('altura', v)} />
            </View>
            <TextInput style={styles.input} placeholder="Edad" placeholderTextColor="#9ca3af"
              keyboardType="numeric" value={form.edad} onChangeText={(v) => set('edad', v)} />
            <ThemedText style={styles.label}>Objetivo</ThemedText>
            <View style={styles.goals}>
              {GOALS.map((g) => (
                <TouchableOpacity key={g.value}
                  style={[styles.goalBtn, form.goal === g.value && styles.goalActive]}
                  onPress={() => set('goal', g.value)}>
                  <ThemedText style={form.goal === g.value ? styles.goalOn : styles.goalOff}>
                    {g.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => set('email', v)}
        />
        {errors.email && <Text style={styles.errorText}>⚠️ {errors.email}</Text>}

        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => set('password', v)}
        />
        {errors.password && <Text style={styles.errorText}>⚠️ {errors.password}</Text>}

        {errors.general && <Text style={styles.errorText}>⚠️ {errors.general}</Text>}

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit} disabled={loading}>
          <ThemedText style={styles.btnText}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}>
          <ThemedText style={styles.toggle}>
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f4f7' },
  inner: { padding: 24, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logo: { width: 44, height: 44, resizeMode: 'contain' },
  companyName: { fontSize: 20, fontWeight: '700', color: '#f59e0b' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12, color: '#000000' },
  label: { fontSize: 13, color: '#6b7280' },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  input: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, borderWidth: 1, borderColor: '#e5e7eb',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: -6,
  },
  goals: { flexDirection: 'row', gap: 8 },
  goalBtn: {
    flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center',
  },
  goalActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  goalOn: { color: '#fff', fontWeight: '700', fontSize: 12 },
  goalOff: { color: '#374151', fontSize: 12 },
  btn: {
    backgroundColor: '#ef4444', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggle: { textAlign: 'center', color: '#6b7280', marginTop: 12, fontSize: 14 },
});