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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { chatIA, ChatHistoryMessage } from '../../services/api';

type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
};

export default function TrainerScreen() {
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

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/images/logo_GayoFitness.png')}
            style={styles.logo}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            Gayo Fitness
          </ThemedText>
        </View>
        <ThemedText style={styles.headerSubtitle}>
          Tu coach fitness personalizado
        </ThemedText>
      </View>

      {/* CHAT */}
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
            {/* 🔥 View normal en lugar de ThemedView */}
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

      {/* INPUT */}
      <View style={styles.chatInputBar}>
        <TextInput
          value={chatInput}
          onChangeText={setChatInput}
          placeholder="Pregúntame algo..."
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
  screen: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    height: '100vh' as any,
    display: 'flex' as any,
    flexDirection: 'column' as any,
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 90,
    height: 90,
  },
  headerTitle: {
    fontSize: 22,
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: 2,
    fontSize: 13,
  },
  chatArea: {
    flex: 1,
    overflow: 'scroll' as any,
  },
  chatContent: {
    padding: 14,
    paddingBottom: 160,
  },
  botRow: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  bubble: {
    borderRadius: 18,
    padding: 16,
    maxWidth: '85%',
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userBubble: {
    backgroundColor: '#ef4444',
  },
  botText: {
    color: '#1f2937',
  },
  userText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  chatInputBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    position: 'absolute' as any,
    bottom: 70,
    left: 0,
    right: 0,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 15,
    marginLeft: 10,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
});