import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/themed-view';
import { getMisRecetas, crearReceta, eliminarReceta, Receta } from '@/services/api';

const CATEGORIAS = ['Desayuno','Almuerzo','Cena','Snack','Batido'];

const CAT_EMOJI: Record<string,string> = {
  Desayuno: '🌅', Almuerzo: '🍽️', Cena: '🌙', Snack: '🥜', Batido: '🥤',
};

function RecetaCard({ item, onDelete }: { item: Receta; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={{ fontSize: 36 }}>{CAT_EMOJI[item.categoria] ?? '🍽️'}</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.catChip}>
            <Text style={styles.catChipText}>{CAT_EMOJI[item.categoria]} {item.categoria}</Text>
          </View>
          <TouchableOpacity onPress={() => onDelete(item._id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardCal}>🔥 {item.calorias} kcal</Text>

        <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.expandBtn}>
          <Text style={styles.expandBtnText}>{expanded ? '▲ Ocultar' : '▼ Ver ingredientes'}</Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.ingredientesList}>
            {item.ingredientes.map((ing, i) => (
              <Text key={i} style={styles.ingredienteItem}>• {ing}</Text>
            ))}
            {item.instrucciones ? (
              <Text style={styles.instrucciones}>{item.instrucciones}</Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

export default function RecipesScreen() {
  const [recetas, setRecetas]       = useState<Receta[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);

  // Form fields
  const [titulo, setTitulo]           = useState('');
  const [calorias, setCalorias]       = useState('');
  const [imagen, setImagen]           = useState('');
  const [categoria, setCategoria]     = useState('Almuerzo');
  const [instrucciones, setInstrucciones] = useState('');
  const [ingredienteInput, setIngredienteInput] = useState('');
  const [ingredientes, setIngredientes] = useState<string[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await getMisRecetas();
      setRecetas(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const addIngrediente = () => {
    const ing = ingredienteInput.trim();
    if (!ing) return;
    setIngredientes(prev => [...prev, ing]);
    setIngredienteInput('');
  };

  const removeIngrediente = (i: number) =>
    setIngredientes(prev => prev.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setTitulo(''); setCalorias(''); setImagen('');
    setCategoria('Almuerzo'); setInstrucciones('');
    setIngredienteInput(''); setIngredientes([]);
  };

  const handleGuardar = async () => {
    if (!titulo.trim()) return Alert.alert('Error', 'El título es obligatorio');
    if (!calorias || isNaN(Number(calorias))) return Alert.alert('Error', 'Introduce las calorías');
    if (ingredientes.length === 0) return Alert.alert('Error', 'Añade al menos un ingrediente');
    setSaving(true);
    try {
      const nueva = await crearReceta({
        titulo: titulo.trim(),
        calorias: Number(calorias),
        ingredientes,
        imagen: imagen.trim() || '',
        instrucciones: instrucciones.trim(),
        categoria,
      });
      setRecetas(prev => [nueva, ...prev]);
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('¿Eliminar receta?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await eliminarReceta(id);
          setRecetas(prev => prev.filter(r => r._id !== id));
        } catch (err: any) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis recetas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#e26a07" size="large" /></View>
      ) : recetas.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>🍽️</Text>
          <Text style={styles.emptyText}>Aún no tienes recetas</Text>
          <Text style={styles.emptyHint}>Pulsa "+ Nueva" para añadir tu primera receta</Text>
        </View>
      ) : (
        <FlatList
          data={recetas}
          keyExtractor={r => r._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RecetaCard item={item} onDelete={handleDelete} />
          )}
        />
      )}

      {/* MODAL NUEVA RECETA */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva receta</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">

            <Text style={styles.fieldLabel}>Título *</Text>
            <TextInput style={styles.input} placeholder="Ej: Batido de proteínas"
              placeholderTextColor="#9ca3af" value={titulo} onChangeText={setTitulo} />

            <Text style={styles.fieldLabel}>Calorías *</Text>
            <TextInput style={styles.input} placeholder="Ej: 450" keyboardType="numeric"
              placeholderTextColor="#9ca3af" value={calorias} onChangeText={setCalorias} />

            <Text style={styles.fieldLabel}>URL de imagen (opcional)</Text>
            <TextInput style={styles.input} placeholder="https://..."
              placeholderTextColor="#9ca3af" value={imagen} onChangeText={setImagen}
              autoCapitalize="none" />

            <Text style={styles.fieldLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATEGORIAS.map(cat => (
                <TouchableOpacity key={cat}
                  style={[styles.catBtn, categoria === cat && styles.catBtnActive]}
                  onPress={() => setCategoria(cat)}>
                  <Text style={[styles.catBtnText, categoria === cat && styles.catBtnTextActive]}>
                    {CAT_EMOJI[cat]} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Ingredientes *</Text>
            <View style={styles.ingRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Ej: 200g pechuga de pollo"
                placeholderTextColor="#9ca3af"
                value={ingredienteInput} onChangeText={setIngredienteInput}
                onSubmitEditing={addIngrediente} returnKeyType="done" />
              <TouchableOpacity style={styles.ingAddBtn} onPress={addIngrediente}>
                <Text style={styles.ingAddBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            {ingredientes.map((ing, i) => (
              <View key={i} style={styles.ingChip}>
                <Text style={styles.ingChipText}>• {ing}</Text>
                <TouchableOpacity onPress={() => removeIngrediente(i)}>
                  <Text style={styles.ingChipDel}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.fieldLabel}>Instrucciones (opcional)</Text>
            <TextInput style={[styles.input, { height: 90 }]} multiline
              placeholder="Describe los pasos de preparación..."
              placeholderTextColor="#9ca3af"
              value={instrucciones} onChangeText={setInstrucciones} />

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleGuardar} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Guardar receta</Text>
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
  cardImagePlaceholder: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catChip: { backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  catChipText: { color: '#e26a07', fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardCal: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  expandBtn: { alignSelf: 'flex-start' },
  expandBtnText: { color: '#e26a07', fontSize: 12, fontWeight: '600' },
  ingredientesList: { marginTop: 8, gap: 3 },
  ingredienteItem: { fontSize: 13, color: '#374151' },
  instrucciones: { marginTop: 8, fontSize: 13, color: '#6b7280', lineHeight: 20 },

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
  input: {
    backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 4,
  },
  catBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb',
  },
  catBtnActive: { backgroundColor: '#e26a07', borderColor: '#e26a07' },
  catBtnText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  catBtnTextActive: { color: '#fff', fontWeight: '700' },
  ingRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  ingAddBtn: { backgroundColor: '#e26a07', borderRadius: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  ingAddBtnText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  ingChip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 4,
  },
  ingChipText: { color: '#374151', fontSize: 13, flex: 1 },
  ingChipDel: { color: '#9ca3af', fontSize: 14, paddingLeft: 8 },
  saveBtn: { backgroundColor: '#e26a07', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
