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

import {
  getLocalUser,
  getTodayStats,
  getWeeklyStats,
  getRecommendations,
  saveTodayProgress,
} from '@/services/api';

// Calorías quemadas según pasos (fórmula estándar)
function caloriasFromPasos(pasos: number, pesoKg: number = 70): number {
  return Math.round(pasos * 0.0005 * pesoKg);
}

// 🔴 PROGRESS RING
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

// 🔴 WEEKLY BARS
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

// 🔴 STAT BOX
function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <ThemedText style={styles.statIcon}>{icon}</ThemedText>
      <ThemedText style={styles.statNumber}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

// 🔴 QUICK CARD
function QuickCard({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress}>
      <ThemedText style={styles.quickIcon}>{icon}</ThemedText>
      <ThemedText style={styles.quickText}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

// 🔴 RECOMMEND CARD
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

// 🔥 DASHBOARD PRINCIPAL
export default function Dashboard() {
  const router = useRouter();

  const [user, setUser]                   = useState<any>({ name: '', goal: '', peso: 70 });
  const [todayStats, setTodayStats]       = useState<any>({ calorias: 0, pasos: 0, minutosActivos: 0, porcentaje: 0 });
  const [weeklyStats, setWeeklyStats]     = useState<number[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Modal de pasos
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
      // Progreso: 10.000 pasos = 100%
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
      {/* HEADER */}
      <View style={styles.header}>
        <ThemedText style={styles.greeting}>¡Buenos días,</ThemedText>
        <ThemedText style={styles.name}>{user.name}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ACTIVIDAD */}
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

          {/* Info calorías */}
          {(todayStats?.pasos ?? 0) > 0 && (
            <View style={styles.caloriasBanner}>
              <ThemedText style={styles.caloriasBannerText}>
                🔥 {todayStats?.calorias ?? 0} kcal quemadas con {todayStats?.pasos ?? 0} pasos
              </ThemedText>
            </View>
          )}
        </View>

        {/* WEEKLY */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Progreso semanal</ThemedText>
          <WeeklyBars data={weeklyStats} />
        </View>

        {/* QUICK */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Acceso rápido</ThemedText>
          <View style={styles.quickGrid}>
            <QuickCard icon="🏋️" label="Entrenamientos" onPress={() => router.navigate('/workout')} />
            <QuickCard icon="🍽️" label="Recetas" onPress={() => router.navigate('/recipes')} />
            <QuickCard icon="🛒" label="Carrito" onPress={() => router.replace('/store')} />
          </View>
        </View>

        {/* RECOMMEND */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Recomendado para ti</ThemedText>
          <ScrollView horizontal>
            {recommendations.map((item, i) => (
              <RecommendCard key={i} item={item} />
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* MODAL PASOS */}
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

            {/* Preview calorías */}
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
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  greeting: { fontSize: 13, color: '#6b7280' },
  name: { fontSize: 22, fontWeight: '600', marginTop: 2 },
  content: { padding: 16, paddingBottom: 20, gap: 14 },

  card: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 14 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },

  // Botón registrar pasos
  stepsBtn: {
    backgroundColor: '#fef2f2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#fca5a5',
  },
  stepsBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },

  // Anillo
  ringPercent: { fontSize: 28, fontWeight: '700', color: '#ef4444' },
  ringLabel: { fontSize: 15, color: '#94a3b8', marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: '#f8fafc', borderRadius: 12 },
  statDivider: { width: 8 },
  statIcon: { fontSize: 23, marginBottom: 4 },
  statNumber: { fontSize: 20, fontWeight: '600' },
  statLabel: { fontSize: 18, color: '#6b7280', marginTop: 2 },

  // Banner calorías
  caloriasBanner: {
    marginTop: 12, backgroundColor: '#fff7ed', borderRadius: 10,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#fed7aa',
  },
  caloriasBannerText: { color: '#ea580c', fontSize: 13, fontWeight: '600' },

  // Barras semanales
  barValue: { fontSize: 12, marginBottom: 4, color: '#374151' },
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
  barLabel: { fontSize: 15, color: '#9ca3af' },
  barLabelActive: { color: '#ef4444', fontWeight: '600' },

  // Acceso rápido
  quickGrid: { flexDirection: 'row', gap: 20 },
  quickCard: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 40, alignItems: 'center', gap: 6 },
  quickIcon: { fontSize: 30 },
  quickText: { fontSize: 15, textAlign: 'center', color: '#6b7280' },

  // Recomendaciones
  recommendCard: { width: 280, marginRight: 12 },
  recommendImagePlaceholder: {
    height: 180, borderRadius: 12, backgroundColor: '#f1f5f9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  recommendEmoji: { fontSize: 32 },
  recommendType: { fontSize: 18, color: '#ef4444', marginBottom: 2 },
  recommendTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  recommendKcal: { fontSize: 14, color: '#6b7280' },

  // Modal
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
