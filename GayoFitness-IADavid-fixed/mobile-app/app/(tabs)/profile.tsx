import {
  View, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getProfile, updateProfile, logoutUser, deleteAccount, User } from '@/services/api';

const GOALS = [
  { value: 'ganar_musculo', label: '💪 Músculo'    },
  { value: 'perdida_peso',  label: '🏃 Peso'        },
  { value: 'resistencia',   label: '🏅 Resistencia' },
];

export default function ProfileScreen() {
  const router              = useRouter();
  const [user, setUser]             = useState<User | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm]             = useState({
    name: '', peso: '', altura: '', edad: '', goal: 'ganar_musculo', bio: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const u = await getProfile();
      setUser(u);
      setForm({
        name:   u.name   ?? '',
        peso:   u.peso   ? String(u.peso)   : '',
        altura: u.altura ? String(u.altura) : '',
        edad:   u.edad   ? String(u.edad)   : '',
        goal:   u.goal   ?? 'ganar_musculo',
        bio:    u.bio    ?? '',
      });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name:   form.name   || undefined,
        peso:   form.peso   ? Number(form.peso)   : undefined,
        altura: form.altura ? Number(form.altura) : undefined,
        edad:   form.edad   ? Number(form.edad)   : undefined,
        goal:   form.goal   as User['goal'],
        bio:    form.bio    || undefined,
      });
      Alert.alert('✅ Guardado', 'Tu perfil ha sido actualizado');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      router.replace('/login');
    } catch (err: any) {
      setShowDeleteModal(false);
      Alert.alert('Error', err.message ?? 'No se pudo eliminar la cuenta');
    } finally {
      setDeleting(false);
    }
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  if (!user) return null;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.inner}>
        <ThemedText style={styles.title}>Mi perfil</ThemedText>
        <ThemedText style={styles.email}>{user.email}</ThemedText>

        <ThemedText style={styles.label}>Nombre</ThemedText>
        <TextInput style={styles.input} value={form.name}
          onChangeText={(v) => set('name', v)} placeholderTextColor="#9ca3af" />

        <View style={styles.row}>
          <View style={styles.half}>
            <ThemedText style={styles.label}>Peso (kg)</ThemedText>
            <TextInput style={styles.input} value={form.peso} keyboardType="numeric"
              onChangeText={(v) => set('peso', v)} placeholderTextColor="#9ca3af" />
          </View>
          <View style={styles.half}>
            <ThemedText style={styles.label}>Altura (cm)</ThemedText>
            <TextInput style={styles.input} value={form.altura} keyboardType="numeric"
              onChangeText={(v) => set('altura', v)} placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <ThemedText style={styles.label}>Edad</ThemedText>
        <TextInput style={styles.input} value={form.edad} keyboardType="numeric"
          onChangeText={(v) => set('edad', v)} placeholderTextColor="#9ca3af" />

        <ThemedText style={styles.label}>Bio</ThemedText>
        <TextInput style={[styles.input, { height: 80 }]} value={form.bio} multiline
          onChangeText={(v) => set('bio', v)} placeholderTextColor="#9ca3af" />

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

        <TouchableOpacity style={[styles.btn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving}>
          <ThemedText style={styles.btnText}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </ThemedText>
        </TouchableOpacity>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Eliminar cuenta */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <ThemedText style={styles.deleteText}>🗑️ Eliminar cuenta</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.deleteHint}>
          Borra tu cuenta y todos tus datos de forma permanente.
        </ThemedText>

      </ScrollView>

      {/* Modal de confirmación de borrado */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ThemedText style={styles.modalTitle}>⚠️ Eliminar cuenta</ThemedText>
            <ThemedText style={styles.modalBody}>
              Se borrarán todos tus datos permanentemente.{'\n'}Esta acción no se puede deshacer.
            </ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <ThemedText style={styles.modalCancelText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDelete, deleting && { opacity: 0.6 }]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <ThemedText style={styles.modalDeleteText}>Eliminar</ThemedText>
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
  inner:      { padding: 20, paddingTop: 52, gap: 4 },
  title:      { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  email:      { color: '#6b7280', marginBottom: 16, fontSize: 13 },
  label:      { fontSize: 13, color: '#6b7280', marginBottom: 4, marginTop: 8 },
  row:        { flexDirection: 'row', gap: 12 },
  half:       { flex: 1 },
  input: {
    backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: '#e5e7eb', fontSize: 15,
  },
  goals:      { flexDirection: 'row', gap: 8, marginTop: 4 },
  goalBtn:    { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#fff',
                borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  goalActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  goalOn:     { color: '#fff', fontWeight: '700', fontSize: 12 },
  goalOff:    { color: '#374151', fontSize: 12 },
  btn: {
    backgroundColor: '#ef4444', borderRadius: 12,
    padding: 15, alignItems: 'center', marginTop: 16,
  },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
  logout:     { alignItems: 'center', paddingVertical: 14 },
  logoutText: { color: '#6b7280', fontSize: 14 },

  separator:  { height: 1, backgroundColor: '#e5e7eb', marginVertical: 4 },

  deleteBtn: {
    borderWidth: 1, borderColor: '#fca5a5',
    borderRadius: 12, padding: 14,
    alignItems: 'center', backgroundColor: '#fff5f5',
  },
  deleteText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
  deleteHint: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 6, marginBottom: 24 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    width: '100%', shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 10, elevation: 10,
  },
  modalTitle:   { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#111827' },
  modalBody:    { fontSize: 14, color: '#6b7280', lineHeight: 22, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1, padding: 13, borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center',
  },
  modalCancelText: { color: '#374151', fontWeight: '600' },
  modalDelete: {
    flex: 1, padding: 13, borderRadius: 10,
    backgroundColor: '#dc2626', alignItems: 'center',
  },
  modalDeleteText: { color: '#fff', fontWeight: '700' },
});
