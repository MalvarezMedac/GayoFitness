import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getLocalUser,
  getTodayStats,
  getWeeklyStats,
  getRecommendations,
  saveTodayProgress,
} from '@/services/api';

function caloriasFromPasos(pasos: number, pesoKg: number = 70): number {
  return Math.round(pasos * 0.0005 * pesoKg);
}

function ProgressRing({ percent }: { percent: number }) {
  const SIZE = 120;
  const BORDER = 10;
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: BORDER,
          borderColor: '#e5e7eb',
          borderTopColor: '#ef4444',
          borderRightColor: clamped > 25 ? '#ef4444' : '#e5e7eb',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ThemedText style={styles.ringPercent}>{clamped}%</ThemedText>
        <ThemedText style={styles.ringLabel}>completado</ThemedText>
      </View>
    </View>
  );
}

function WeeklyBars({ data }: { data: number[] }) {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const values = data.length ? data : [0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...values, 1);
  const BAR_MAX_HEIGHT = 140;
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <View style={styles.barContainer}>
      {days.map((day, i) => {
        const barHeight = Math.max(8, Math.round((values[i] / maxVal) * BAR_MAX_HEIGHT));
        const isToday = i === todayIndex;
        const animatedHeight = useRef(new Animated.Value(0)).current;

        useEffect(() => {
          Animated.timing(animatedHeight, {
            toValue: barHeight,
            duration: 600,
            useNativeDriver: false,
          }).start();
        }, [barHeight]);

        return (
          <View key={i} style={styles.barItem}>
            <ThemedText style={styles.barValue}>{values[i]}%</ThemedText>
            <View style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  { height: animatedHeight, backgroundColor: isToday ? '#ef4444' : '#94a3b8' },
                ]}
              />
            </View>
            <ThemedText style={[styles.barLabel, isToday && styles.barLabelActive]}>
              {day}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <ThemedText style={styles.statIcon}>{icon}</ThemedText>
      <ThemedText style={styles.statNumber}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function QuickCard({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress}>
      <ThemedText style={styles.quickIcon}>{icon}</ThemedText>
      <ThemedText style={styles.quickText}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

function RecommendCard({ item }: { item: any }) {
  return (
    <View style={styles.recommendCard}>
      <View style={styles.recommendImagePlaceholder}>
        <ThemedText style={styles.recommendEmoji}>{item?.emoji || '🔥'}</ThemedText>
      </View>
      <ThemedText style={styles.recommendType}>{item?.type || 'Fitness'}</ThemedText>
      <ThemedText style={styles.recommendTitle}>{item?.title || 'Recomendación'}</ThemedText>
      <ThemedText style={styles.recommendKcal}>{item?.kcal || ''}</ThemedText>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser]                   = useState<any>({ name: '', goal: '', peso: 70 });
  const [todayStats, setTodayStats]       = useState<any>({ calorias: 0, pasos: 0, minutosActivos: 0, porcentaje: 0 });
  const [weeklyStats, setWeeklyStats]     = useState<number[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [showStepsModal, setShowStepsModal] = useState(false);
  const [inputPasos, setInputPasos]         = useState('');
  const [saving, setSaving]                 = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [userData, today, weekly, recs] = await Promise.all([
        getLocalUser(),
        getTodayStats(),
        getWeeklyStats(),
        getRecommendations(),
      ]);
      setUser(userData ?? { name: '', goal: '', peso: 70 });
      setTodayStats(today ?? { calorias: 0, pasos: 0, minutosActivos: 0, porcentaje: 0 });
      setWeeklyStats(weekly.map((d: any) => d.progress));
      setRecommendations(recs);
    } catch (err) {
      console.log('ERROR LOAD DATA:', err);
    }
  };

  const handleGuardarPasos = async () => {
    const pasos = parseInt(inputPasos, 10);
    if (isNaN(pasos) || pasos < 0) {
      Alert.alert('Error', 'Introduce un número de pasos válido');
      return;
    }

    setSaving(true);
    try {
      const pesoKg    = user?.peso ?? 70;
      const calorias  = caloriasFromPasos(pasos, pesoKg);
      const porcentaje = Math.min(100, Math.round((pasos / 10000) * 100));

      await saveTodayProgress({ pasos, calorias, porcentaje });

      setTodayStats((prev: any) => ({ ...prev, pasos, calorias, porcentaje }));
      setShowStepsModal(false);
      setInputPasos('');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <ThemedText style={styles.greeting}>¡Buenos días,</ThemedText>
        <ThemedText style={styles.name}>{user.name}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <ThemedText style={styles.cardTitle}>Actividad diaria</ThemedText>
            <TouchableOpacity style={styles.stepsBtn} onPress={() => {
              setInputPasos(String(todayStats?.pasos ?? ''));
              setShowStepsModal(true);
            }}>
              <ThemedText style={styles.stepsBtnText}>👟 Registrar pasos</ThemedText>
            </TouchableOpacity>
          </View>

          <ProgressRing percent={todayStats?.porcentaje ?? 0} />

          <View style={styles.statsRow}>
            <StatBox icon="🔥" value={String(todayStats?.calorias ?? 0)} label="kcal" />
            <View style={styles.statDivider} />
            <StatBox icon="👟" value={String(todayStats?.pasos ?? 0)} label="pasos" />
            <View style={styles.statDivider} />
            <StatBox icon="⏱" value={String(todayStats?.minutosActivos ?? 0)} label="activo" />
          </View>

          {(todayStats?.pasos ?? 0) > 0 && (
            <View style={styles.caloriasBanner}>
              <ThemedText style={styles.caloriasBannerText}>
                🔥 {todayStats?.calorias ?? 0} kcal quemadas con {todayStats?.pasos ?? 0} pasos
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Progreso semanal</ThemedText>
          <WeeklyBars data={weeklyStats} />
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Acceso rápido</ThemedText>
          <View style={styles.quickGrid}>
            <QuickCard icon="🏋️" label="Entrenamientos" onPress={() => router.navigate('/workout')} />
            <QuickCard icon="🍽️" label="Recetas" onPress={() => router.navigate('/recipes')} />
            <QuickCard icon="🛒" label="Carrito" onPress={() => router.replace('/store')} />
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Recomendado para ti</ThemedText>
          <ScrollView horizontal>
            {recommendations.map((item, i) => (
              <RecommendCard key={i} item={item} />
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      <Modal
        visible={showStepsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStepsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ThemedText style={styles.modalTitle}>👟 Registrar pasos</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Introduce los pasos de hoy y calcularemos automáticamente las calorías quemadas.
            </ThemedText>

            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Ej: 8500"
              placeholderTextColor="#9ca3af"
              value={inputPasos}
              onChangeText={setInputPasos}
              autoFocus
            />

            {inputPasos !== '' && !isNaN(parseInt(inputPasos, 10)) && (
              <View style={styles.previewBox}>
                <ThemedText style={styles.previewText}>
                  🔥 {caloriasFromPasos(parseInt(inputPasos, 10), user?.peso ?? 70)} kcal estimadas
                </ThemedText>
                <ThemedText style={styles.previewSub}>
                  📊 {Math.min(100, Math.round((parseInt(inputPasos, 10) / 10000) * 100))}% del objetivo diario (10.000 pasos)
                </ThemedText>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => { setShowStepsModal(false); setInputPasos(''); }}
                disabled={saving}
              >
                <ThemedText style={styles.modalCancelText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, saving && { opacity: 0.6 }]}
                onPress={handleGuardarPasos}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <ThemedText style={styles.modalSaveText}>Guardar</ThemedText>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f4f7' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 2, color: '#111827' },
  content: { padding: 16, paddingBottom: 20, gap: 14 },

  card: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14, color: '#111827' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },

  stepsBtn: {
    backgroundColor: '#fef2f2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#fca5a5',
  },
  stepsBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },

  ringPercent: { fontSize: 28, fontWeight: '800', color: '#ef4444' },
  ringLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2, fontWeight: '500' },

  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
  statDivider: { width: 8 },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  caloriasBanner: {
    marginTop: 12, backgroundColor: '#fff7ed', borderRadius: 10,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#fed7aa',
  },
  caloriasBannerText: { color: '#ea580c', fontSize: 13, fontWeight: '700' },

  barValue: { fontSize: 11, marginBottom: 4, color: '#6b7280', fontWeight: '600' },
  barContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    height: 180, marginTop: 8, paddingHorizontal: 4,
  },
  barItem: { flex: 1, alignItems: 'center', paddingHorizontal: 5 },
  barTrack: {
    width: '100%', height: 150, backgroundColor: '#f1f5f9',
    borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 3,
  },
  barFill: { width: '100%', borderRadius: 18 },
  barActive: { backgroundColor: '#ef4444' },
  barInactive: { backgroundColor: '#cbd5e1' },
  barLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  barLabelActive: { color: '#ef4444', fontWeight: '700' },

  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  quickIcon: { fontSize: 28 },
  quickText: { fontSize: 12, textAlign: 'center', color: '#374151', fontWeight: '600' },

  recommendCard: { width: 180, marginRight: 12 },
  recommendImagePlaceholder: {
    height: 120, borderRadius: 12, backgroundColor: '#f1f5f9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  recommendEmoji: { fontSize: 32 },
  recommendType: { fontSize: 11, color: '#ef4444', marginBottom: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  recommendTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2, color: '#111827' },
  recommendKcal: { fontSize: 12, color: '#6b7280', fontWeight: '500' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, color: '#111827' },
  modalSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  modalInput: {
    backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 28, fontWeight: '700',
    color: '#111827', textAlign: 'center', marginBottom: 16,
  },
  previewBox: {
    backgroundColor: '#fff7ed', borderRadius: 12, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: '#fed7aa', gap: 4,
  },
  previewText: { color: '#ea580c', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  previewSub: { color: '#9a3412', fontSize: 12, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center',
  },
  modalCancelText: { color: '#374151', fontWeight: '600' },
  modalSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center' },
  modalSaveText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  redText: { color: '#ef4444', fontSize: 12, fontWeight: '500' },
});