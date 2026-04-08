import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';

const OBJECTIVES = [
  { id: 'peso',        label: 'Pérdida de Peso', icon: '📉' },
  { id: 'musculo',     label: 'Ganar Músculo',   icon: '💪' },
  { id: 'resistencia', label: 'Resistencia',     icon: '🏃' },
];

export default function SignUpScreen() {
  const [nombre,          setNombre]          = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [selectedObj,     setSelectedObj]     = useState(null);
  const [termsAccepted,   setTermsAccepted]   = useState(false);

  const isFormValid =
    nombre.trim() !== '' &&
    email.trim()  !== '' &&
    password.trim() !== '' &&
    selectedObj !== null &&
    termsAccepted;

  const handleSignUp = () => {
    if (!isFormValid) return;
    const objLabel = OBJECTIVES.find(o => o.id === selectedObj)?.label;
    Alert.alert(
      '¡Cuenta creada! 🎉',
      `Nombre: ${nombre}\nEmail: ${email}\nObjetivo: ${objLabel}`,
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={styles.logo}>
        <Text style={styles.logoText}>GF</Text>
      </View>

      {/* Títulos */}
      <Text style={styles.title}>Crea tu Cuenta</Text>
      <Text style={styles.subtitle}>Comienza tu viaje fitness hoy</Text>

      {/* Nombre */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputIcon}>👤</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          placeholderTextColor="#b0b5c8"
          value={nombre}
          onChangeText={setNombre}
          autoComplete="name"
        />
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputIcon}>✉️</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#b0b5c8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      {/* Contraseña */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput
          style={[styles.input, { paddingRight: 44 }]}
          placeholder="Contraseña"
          placeholderTextColor="#b0b5c8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
        />
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setShowPassword(prev => !prev)}
        >
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Objetivo */}
      <Text style={styles.sectionTitle}>Selecciona tu Objetivo</Text>
      <Text style={styles.sectionSub}>Elige el objetivo principal de tu entrenamiento</Text>

      <View style={styles.objectives}>
        {OBJECTIVES.map(obj => (
          <TouchableOpacity
            key={obj.id}
            style={[styles.objCard, selectedObj === obj.id && styles.objCardSelected]}
            onPress={() => setSelectedObj(obj.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.objIcon}>{obj.icon}</Text>
            <Text style={styles.objLabel}>{obj.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Términos */}
      <View style={styles.terms}>
        <TouchableOpacity
          style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
          onPress={() => setTermsAccepted(prev => !prev)}
        >
          {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          Acepto los{' '}
          <Text style={styles.termsLink}>Términos y Condiciones</Text>
          {' '}y la{' '}
          <Text style={styles.termsLink}>Política de Privacidad</Text>
        </Text>
      </View>

      {/* Botón */}
      <Pressable
        style={[styles.btnCreate, !isFormValid && styles.btnDisabled]}
        onPress={handleSignUp}
        disabled={!isFormValid}
      >
        <Text style={styles.btnText}>Crear Cuenta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f2f4f8',
    padding: 24,
    paddingBottom: 40,
  },

  // Logo
  logo: {
    width: 72,
    height: 72,
    backgroundColor: '#e53935',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Títulos
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#8a8fa8',
    marginBottom: 24,
  },

  // Inputs
  inputGroup: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfd',
    borderWidth: 1.5,
    borderColor: '#e5e8f0',
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14.5,
    color: '#2c2c3e',
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 17,
  },

  // Sección objetivo
  sectionTitle: {
    width: '100%',
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a2e',
    marginTop: 8,
    marginBottom: 3,
  },
  sectionSub: {
    width: '100%',
    fontSize: 12.5,
    color: '#8a8fa8',
    marginBottom: 14,
  },

  // Tarjetas objetivo
  objectives: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  objCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e5e8f0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#fafbfd',
  },
  objCardSelected: {
    borderColor: '#e53935',
    backgroundColor: '#fff5f5',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  objIcon: {
    fontSize: 26,
    marginBottom: 7,
  },
  objLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2c2c3e',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Términos
  terms: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 22,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#b0b5c8',
    borderRadius: 4,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#e53935',
    borderColor: '#e53935',
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  termsText: {
    flex: 1,
    fontSize: 12.5,
    color: '#6b7280',
    lineHeight: 20,
  },
  termsLink: {
    color: '#e53935',
    fontWeight: '700',
  },

  // Botón
  btnCreate: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#e53935',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: '#fff',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});