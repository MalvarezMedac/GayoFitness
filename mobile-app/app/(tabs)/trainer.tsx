import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { chatIA, ChatHistoryMessage } from '../../services/api';

type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
};

export default function TrainerScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Ey mi gallo 🐔💪 aquí no venimos a flojear… venimos a ponernos fuertes 😈 ¿qué quieres entrenar hoy?'
    },
  ]);

  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatHistoryMessage[]>([]);

  const scrollRef = useRef<ScrollView>(null);

  const typeMessage = async (text: string) => {
    let current = '';
    setMessages(prev => [...prev, { role: 'ai', text: '' }]);

    for (let i = 0; i < text.length; i++) {
      current += text[i];
      await new Promise(res => setTimeout(res, 10));
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].text = current;
        return updated;
      });
    }
  };

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    const updatedHistory: ChatHistoryMessage[] = [
      ...history,
      { role: 'user', content: text },
    ];

    try {
      const res = await chatIA(text, updatedHistory);
      const reply = res?.reply || '🤖 No tengo respuesta ahora mismo.';
      setHistory([...updatedHistory, { role: 'assistant', content: reply }]);
      await typeMessage(reply);
    } catch (error) {
      console.log('ERROR CHAT:', error);
      await typeMessage('❌ Error conectando con la IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Image
              source={require('../../assets/images/logo_GayoFitness.png')}
              style={styles.avatarImage}
            />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerTitle}>Gayo Fitness AI</ThemedText>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <ThemedText style={styles.onlineText}>Activo ahora</ThemedText>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={msg.role === 'user' ? styles.userRow : styles.botRow}
          >
            <View
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <ThemedText
                style={msg.role === 'user' ? styles.userText : styles.botText}
              >
                {msg.text}
              </ThemedText>
            </View>
          </View>
        ))}

        {loading && (
          <View style={styles.botRow}>
            <View style={[styles.bubble, styles.botBubble]}>
              <ActivityIndicator color="#e26a07" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.chatInputBar, { bottom: 70 + insets.bottom }]}>
        <TextInput
          value={chatInput}
          onChangeText={setChatInput}
          placeholder="Pregúntame algo..."
          placeholderTextColor="#9ca3af"
          style={styles.chatInput}
          onSubmitEditing={handleChatSend}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={handleChatSend} style={styles.sendButton}>
          <ThemedText style={styles.sendButtonText}>Enviar</ThemedText>
        </TouchableOpacity>
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0f2f5' },

  header: {
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42, height: 42,
    backgroundColor: '#ef4444',
    borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 42, height: 42, resizeMode: 'contain' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  onlineText: { fontSize: 12, color: '#22c55e', fontWeight: '600' },

  chatArea: { flex: 1 },
  chatContent: { padding: 14, paddingBottom: 160 },
  botRow: { alignItems: 'flex-start', marginBottom: 12 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  bubble: { borderRadius: 18, padding: 14, maxWidth: '85%' },
  botBubble: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' },
  userBubble: { backgroundColor: '#ef4444' },
  botText: { color: '#111827', fontSize: 15, lineHeight: 22 },
  userText: { color: '#ffffff', fontSize: 15, fontWeight: '700', lineHeight: 22 },
  chatInputBar: {
    flexDirection: 'row', padding: 10,
    backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb',
    position: 'absolute' as any, left: 0, right: 0,
  },
  chatInput: {
    flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#111827',
  },
  sendButton: {
    backgroundColor: '#ef4444', paddingHorizontal: 16,
    marginLeft: 10, borderRadius: 12, justifyContent: 'center',
  },
  sendButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});