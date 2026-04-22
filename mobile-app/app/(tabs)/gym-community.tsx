import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, ScrollView, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import { getEntrenamientos, Entrenamiento } from '@/services/api';

const FILTROS = ['Todos','Fuerza','Cardio','Hipertrofia','Resistencia','Flexibilidad','Full Body'];
const CAT_EMOJI: Record<string,string> = {
  Fuerza:'💪', Cardio:'🏃', Hipertrofia:'🏋️', Resistencia:'🏅', Flexibilidad:'🧘', 'Full Body':'⚡',
};
const DIF_COLOR: Record<string,string> = {
  Principiante:'#22c55e', Intermedio:'#f59e0b', Avanzado:'#ef4444',
};

function EntrenamientoCommunityCard({ item }: { item: Entrenamiento }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImgPlaceholder]}>
          <Text style={{ fontSize: 48 }}>{CAT_EMOJI[item.categoria] ?? '🏋️'}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.catChip}>
            <Text style={styles.catChipText}>{CAT_EMOJI[item.categoria]} {item.categoria}</Text>
          </View>
          <Text style={styles.autorText}>👤 {item.autorNombre}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.titulo}</Text>
        {item.descripcion ? <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text> : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>⏱ {item.duracion} min</Text>
          <Text style={[styles.metaItem, { color: DIF_COLOR[item.dificultad] ?? '#6b7280', fontWeight: '600' }]}>
            ● {item.dificultad}
          </Text>
          <Text style={styles.metaItem}>📋 {item.ejercicios.length} ejercicios</Text>
        </View>

        <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.expandBtn}>
          <Text style={styles.expandBtnText}>
            {expanded ? '▲ Ocultar ejercicios' : `▼ Ver ${item.ejercicios.length} ejercicios`}
          </Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.ejerciciosList}>
            {item.ejercicios.map((ej, i) => (
              <View key={i} style={styles.ejercicioRow}>
                <Text style={styles.ejercicioNum}>{i + 1}</Text>
                <View style={styles.ejercicioInfo}>
                  <Text style={styles.ejercicioNombre}>{ej.nombre}</Text>
                  <Text style={styles.ejercicioMeta}>
                    {ej.series} series · {ej.reps} reps · {ej.descanso} descanso
                  </Text>
                  {ej.notas ? <Text style={styles.ejercicioNotas}>{ej.notas}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function GymCommunityScreen() {
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filtro,  setFiltro]  = useState('Todos');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setEntrenamientos(await getEntrenamientos()); }
    catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const filtered = entrenamientos.filter(e => {
    const matchCat    = filtro === 'Todos' || e.categoria === filtro;
    const matchSearch = e.titulo.toLowerCase().includes(search.toLowerCase()) ||
                        e.autorNombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rutinas comunidad 🏋️</Text>
        <Text style={styles.headerSub}>{entrenamientos.length} rutinas compartidas</Text>

        <View style={styles.searchBar}>
          <Text>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar rutina o usuario..."
            placeholderTextColor="#9ca3af"
            value={search} onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
          {FILTROS.map(f => (
            <TouchableOpacity key={f}
              style={[styles.filtroChip, filtro === f && styles.filtroChipActive]}
              onPress={() => setFiltro(f)}>
              <Text style={[styles.filtroText, filtro === f && styles.filtroTextActive]}>
                {f === 'Todos' ? '⚡ Todos' : `${CAT_EMOJI[f]} ${f}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#e26a07" size="large" /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={styles.emptyText}>No hay rutinas</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={e => e._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <EntrenamientoCommunityCard item={item} />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f4f7' },
  header: {
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingTop: 20, paddingBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  headerSub:   { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f2f4f7', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 9, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },
  clearBtn: { color: '#9ca3af', fontSize: 13 },
  filtrosRow: { gap: 8, paddingRight: 4 },
  filtroChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb',
  },
  filtroChipActive: { backgroundColor: '#e26a07', borderColor: '#e26a07' },
  filtroText: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
  filtroTextActive: { color: '#fff', fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 15, color: '#9ca3af' },
  list: { padding: 12, paddingBottom: 32, gap: 12 },

  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardImage: { width: '100%', height: 180 },
  cardImgPlaceholder: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catChip: { backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  catChipText: { color: '#e26a07', fontSize: 11, fontWeight: '600' },
  autorText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardDesc:  { fontSize: 13, color: '#6b7280', marginBottom: 8, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  metaItem: { fontSize: 12, color: '#6b7280' },
  expandBtn: { alignSelf: 'flex-start' },
  expandBtnText: { color: '#e26a07', fontSize: 12, fontWeight: '600' },

  ejerciciosList: { marginTop: 10, gap: 8 },
  ejercicioRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  ejercicioNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#e26a07',
    color: '#fff', textAlign: 'center', lineHeight: 24, fontSize: 11, fontWeight: '700',
  },
  ejercicioInfo: { flex: 1 },
  ejercicioNombre: { fontSize: 14, fontWeight: '600', color: '#111827' },
  ejercicioMeta: { fontSize: 12, color: '#6b7280' },
  ejercicioNotas: { fontSize: 11, color: '#9ca3af', fontStyle: 'italic' },
});
