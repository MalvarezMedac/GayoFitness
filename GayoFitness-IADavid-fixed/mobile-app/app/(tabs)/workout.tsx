import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import {
  getMisEntrenamientos, crearEntrenamiento, eliminarEntrenamiento,
  Entrenamiento, Ejercicio,
} from '@/services/api';

const CATEGORIAS  = ['Fuerza','Cardio','Hipertrofia','Resistencia','Flexibilidad','Full Body'];
const DIFICULTADES = ['Principiante','Intermedio','Avanzado'];

const CAT_EMOJI: Record<string,string> = {
  Fuerza:'💪', Cardio:'🏃', Hipertrofia:'🏋️', Resistencia:'🏅', Flexibilidad:'🧘', 'Full Body':'⚡',
};
const DIF_COLOR: Record<string,string> = {
  Principiante:'#22c55e', Intermedio:'#f59e0b', Avanzado:'#ef4444',
};

function EntrenamientoCard({ item, onDelete }: { item: Entrenamiento; onDelete: (id:string)=>void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImgPlaceholder]}>
          <Text style={{ fontSize: 42 }}>{CAT_EMOJI[item.categoria] ?? '🏋️'}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.catChip}>
            <Text style={styles.catChipText}>{CAT_EMOJI[item.categoria]} {item.categoria}</Text>
          </View>
          <TouchableOpacity onPress={() => onDelete(item._id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>{item.titulo}</Text>
        {item.descripcion ? <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text> : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>⏱ {item.duracion} min</Text>
          <Text style={[styles.metaItem, { color: DIF_COLOR[item.dificultad] ?? '#6b7280' }]}>
            ● {item.dificultad}
          </Text>
          <Text style={styles.metaItem}>📋 {item.ejercicios.length} ejercicios</Text>
        </View>

        <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.expandBtn}>
          <Text style={styles.expandBtnText}>
            {expanded ? '▲ Ocultar ejercicios' : '▼ Ver ejercicios'}
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

// ── FORMULARIO EJERCICIO ──
function EjercicioForm({ onAdd }: { onAdd: (e: Ejercicio) => void }) {
  const [nombre,   setNombre]   = useState('');
  const [series,   setSeries]   = useState('3');
  const [reps,     setReps]     = useState('10');
  const [descanso, setDescanso] = useState('60s');
  const [notas,    setNotas]    = useState('');

  const handle = () => {
    if (!nombre.trim()) return Alert.alert('Error', 'El nombre del ejercicio es obligatorio');
    onAdd({ nombre: nombre.trim(), series: Number(series) || 3, reps, descanso, notas });
    setNombre(''); setSeries('3'); setReps('10'); setDescanso('60s'); setNotas('');
  };

  return (
    <View style={styles.ejForm}>
      <Text style={styles.ejFormTitle}>➕ Añadir ejercicio</Text>
      <TextInput style={styles.input} placeholder="Nombre del ejercicio"
        placeholderTextColor="#9ca3af" value={nombre} onChangeText={setNombre} />
      <View style={styles.ejRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.subLabel}>Series</Text>
          <TextInput style={styles.input} keyboardType="numeric"
            placeholderTextColor="#9ca3af" value={series} onChangeText={setSeries} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.subLabel}>Reps</Text>
          <TextInput style={styles.input} placeholder="10"
            placeholderTextColor="#9ca3af" value={reps} onChangeText={setReps} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.subLabel}>Descanso</Text>
          <TextInput style={styles.input} placeholder="60s"
            placeholderTextColor="#9ca3af" value={descanso} onChangeText={setDescanso} />
        </View>
      </View>
      <TextInput style={styles.input} placeholder="Notas (opcional)"
        placeholderTextColor="#9ca3af" value={notas} onChangeText={setNotas} />
      <TouchableOpacity style={styles.ejAddBtn} onPress={handle}>
        <Text style={styles.ejAddBtnText}>+ Añadir</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function WorkoutScreen() {
  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);

  const [titulo,     setTitulo]     = useState('');
  const [descripcion,setDescripcion]= useState('');
  const [imagen,     setImagen]     = useState('');
  const [categoria,  setCategoria]  = useState('Fuerza');
  const [dificultad, setDificultad] = useState('Intermedio');
  const [duracion,   setDuracion]   = useState('45');
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setEntrenamientos(await getMisEntrenamientos()); }
    catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setTitulo(''); setDescripcion(''); setImagen('');
    setCategoria('Fuerza'); setDificultad('Intermedio');
    setDuracion('45'); setEjercicios([]);
  };

  const handleGuardar = async () => {
    if (!titulo.trim()) return Alert.alert('Error', 'El título es obligatorio');
    if (ejercicios.length === 0) return Alert.alert('Error', 'Añade al menos un ejercicio');
    setSaving(true);
    try {
      const nuevo = await crearEntrenamiento({
        titulo: titulo.trim(), descripcion: descripcion.trim(),
        imagen: imagen.trim(), categoria, dificultad,
        duracion: Number(duracion) || 45, ejercicios,
      });
      setEntrenamientos(prev => [nuevo, ...prev]);
      setShowModal(false); resetForm();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('¿Eliminar entrenamiento?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await eliminarEntrenamiento(id);
          setEntrenamientos(prev => prev.filter(e => e._id !== id));
        } catch (err: any) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis entrenamientos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#e26a07" size="large" /></View>
      ) : entrenamientos.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 42 }}>🏋️</Text>
          <Text style={styles.emptyText}>Aún no tienes entrenamientos</Text>
          <Text style={styles.emptyHint}>Pulsa "+ Nuevo" para crear tu primera rutina</Text>
        </View>
      ) : (
        <FlatList
          data={entrenamientos}
          keyExtractor={e => e._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EntrenamientoCard item={item} onDelete={handleDelete} />
          )}
        />
      )}

      {/* MODAL */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuevo entrenamiento</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">

            <Text style={styles.fieldLabel}>Título *</Text>
            <TextInput style={styles.input} placeholder="Ej: Día de pecho"
              placeholderTextColor="#9ca3af" value={titulo} onChangeText={setTitulo} />

            <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
            <TextInput style={[styles.input, { height: 70 }]} multiline
              placeholder="Describe tu rutina..."
              placeholderTextColor="#9ca3af" value={descripcion} onChangeText={setDescripcion} />

            <Text style={styles.fieldLabel}>URL de imagen (opcional)</Text>
            <TextInput style={styles.input} placeholder="https://..."
              placeholderTextColor="#9ca3af" value={imagen} onChangeText={setImagen}
              autoCapitalize="none" />

            <Text style={styles.fieldLabel}>Duración estimada (min)</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="45"
              placeholderTextColor="#9ca3af" value={duracion} onChangeText={setDuracion} />

            <Text style={styles.fieldLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATEGORIAS.map(cat => (
                <TouchableOpacity key={cat}
                  style={[styles.chipBtn, categoria === cat && styles.chipBtnActive]}
                  onPress={() => setCategoria(cat)}>
                  <Text style={[styles.chipText, categoria === cat && styles.chipTextActive]}>
                    {CAT_EMOJI[cat]} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Dificultad</Text>
            <View style={styles.difRow}>
              {DIFICULTADES.map(d => (
                <TouchableOpacity key={d}
                  style={[styles.difBtn, dificultad === d && { backgroundColor: DIF_COLOR[d], borderColor: DIF_COLOR[d] }]}
                  onPress={() => setDificultad(d)}>
                  <Text style={[styles.difText, dificultad === d && { color: '#fff', fontWeight: '700' }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Lista ejercicios añadidos */}
            {ejercicios.length > 0 && (
              <View style={styles.ejListPreview}>
                <Text style={styles.fieldLabel}>Ejercicios añadidos ({ejercicios.length})</Text>
                {ejercicios.map((ej, i) => (
                  <View key={i} style={styles.ejPreviewRow}>
                    <Text style={styles.ejPreviewText}>
                      {i+1}. {ej.nombre} — {ej.series}×{ej.reps}
                    </Text>
                    <TouchableOpacity onPress={() => setEjercicios(prev => prev.filter((_,idx) => idx !== i))}>
                      <Text style={styles.ejPreviewDel}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <EjercicioForm onAdd={ej => setEjercicios(prev => [...prev, ej])} />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleGuardar} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Guardar entrenamiento</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f4f7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  addBtn: { backgroundColor: '#e26a07', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptyHint: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 32 },

  list: { padding: 12, paddingBottom: 32, gap: 12 },

  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  cardImage: { width: '100%', height: 160 },
  cardImgPlaceholder: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catChip: { backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  catChipText: { color: '#e26a07', fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6b7280', marginBottom: 8, lineHeight: 18 },
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

  // Modal
  modalScreen: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 20, color: '#6b7280', padding: 4 },
  modalBody: { padding: 20, gap: 4, paddingBottom: 60 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  subLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  input: {
    backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 4,
  },
  chipBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb',
  },
  chipBtnActive: { backgroundColor: '#e26a07', borderColor: '#e26a07' },
  chipText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  difRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  difBtn: {
    flex: 1, padding: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
  },
  difText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  ejListPreview: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginTop: 8, gap: 6 },
  ejPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ejPreviewText: { fontSize: 13, color: '#374151', flex: 1 },
  ejPreviewDel: { color: '#9ca3af', fontSize: 14, paddingLeft: 8 },

  ejForm: { backgroundColor: '#fff7ed', borderRadius: 12, padding: 14, marginTop: 8, gap: 4, borderWidth: 1, borderColor: '#fed7aa' },
  ejFormTitle: { fontSize: 13, fontWeight: '700', color: '#e26a07', marginBottom: 6 },
  ejRow: { flexDirection: 'row', gap: 8 },
  ejAddBtn: { backgroundColor: '#e26a07', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4 },
  ejAddBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  saveBtn: { backgroundColor: '#e26a07', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
