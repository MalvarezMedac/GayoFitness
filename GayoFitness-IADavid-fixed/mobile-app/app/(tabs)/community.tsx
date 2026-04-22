import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, ScrollView, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import { getRecetas, Receta } from '@/services/api';

const FILTROS = ['Todos','Desayuno','Almuerzo','Cena','Snack','Batido'];
const CAT_EMOJI: Record<string,string> = {
  Desayuno: '🌅', Almuerzo: '🍽️', Cena: '🌙', Snack: '🥜', Batido: '🥤',
};

function RecetaCommunityCard({ item }: { item: Receta }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={{ fontSize: 40 }}>{CAT_EMOJI[item.categoria] ?? '🍽️'}</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        {/* Categoría + autor */}
        <View style={styles.cardTop}>
          <View style={styles.catChip}>
            <Text style={styles.catChipText}>{CAT_EMOJI[item.categoria]} {item.categoria}</Text>
          </View>
          <Text style={styles.autorText}>👤 {item.autorNombre}</Text>
        </View>

        {/* Título */}
        <Text style={styles.cardTitle}>{item.titulo}</Text>

        {/* Calorías */}
        <Text style={styles.cardCal}>🔥 {item.calorias} kcal</Text>

        {/* Ingredientes expandibles */}
        <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.expandBtn}>
          <Text style={styles.expandBtnText}>
            {expanded ? '▲ Ocultar ingredientes' : `▼ Ver ${item.ingredientes.length} ingredientes`}
          </Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.ingredientesList}>
            {item.ingredientes.map((ing, i) => (
              <Text key={i} style={styles.ingredienteItem}>• {ing}</Text>
            ))}
            {item.instrucciones ? (
              <>
                <Text style={styles.instruccionesLabel}>Preparación:</Text>
                <Text style={styles.instrucciones}>{item.instrucciones}</Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const [recetas, setRecetas]   = useState<Receta[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filtro, setFiltro]     = useState('Todos');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await getRecetas();
      setRecetas(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const filtered = recetas.filter(r => {
    const matchCat    = filtro === 'Todos' || r.categoria === filtro;
    const matchSearch = r.titulo.toLowerCase().includes(search.toLowerCase()) ||
                        r.autorNombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ThemedView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidad 🌍</Text>
        <Text style={styles.headerSub}>{recetas.length} recetas compartidas</Text>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Text>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar receta o usuario..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosRow}>
          {FILTROS.map(f => (
            <TouchableOpacity key={f}
              style={[styles.filtroChip, filtro === f && styles.filtroChipActive]}
              onPress={() => setFiltro(f)}>
              <Text style={[styles.filtroText, filtro === f && styles.filtroTextActive]}>
                {f === 'Todos' ? '🍴 Todos' : `${CAT_EMOJI[f]} ${f}`}
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
          <Text style={styles.emptyText}>No hay recetas</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={r => r._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <RecetaCommunityCard item={item} />}
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
  headerSub: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
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

  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  cardImage: { width: '100%', height: 180 },
  cardImagePlaceholder: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catChip: { backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  catChipText: { color: '#e26a07', fontSize: 11, fontWeight: '600' },
  autorText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardCal: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  expandBtn: { alignSelf: 'flex-start' },
  expandBtnText: { color: '#e26a07', fontSize: 12, fontWeight: '600' },
  ingredientesList: { marginTop: 10, gap: 4 },
  ingredienteItem: { fontSize: 13, color: '#374151' },
  instruccionesLabel: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 10 },
  instrucciones: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
});
