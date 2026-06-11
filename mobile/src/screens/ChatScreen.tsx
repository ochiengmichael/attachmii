import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Send, User as UserIcon } from 'lucide-react-native';

export function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Me', text: 'Hello Sophia, I noticed your interest entry for our cybersecurity placement. Are you familiar with Node web security audits?', isMe: true, time: '11:10 AM' },
    { id: '2', sender: 'Sophia Chen', text: 'Hi! Yes indeed, I completed an internship program covering secure JWT session protocols. I would love to talk further.', isMe: false, time: '11:15 AM' }
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: String(messages.length + 1),
      sender: 'Me',
      text: inputText,
      isMe: true,
      time: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate reactive mock responder brief
    setTimeout(() => {
      const resp = {
        id: String(messages.length + 2),
        sender: 'Recruiting Office',
        text: 'Thanks for replying! Let\'s hook up real coordinates in the AttachME chat dashboard on Wednesday afternoon for matching details.',
        isMe: false,
        time: 'Just now'
      };
      setMessages(prev => [...prev, resp]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <UserIcon size={14} color="#818CF8" />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerName}>Sophia Chen</Text>
          <Text style={styles.headerStatus}>Active Direct Signal Channel</Text>
        </View>
      </View>

      <FlatList 
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => (
          <View style={[styles.msgWrapper, item.isMe ? styles.meAlign : styles.peerAlign]}>
            <View style={[styles.bubble, item.isMe ? styles.meBubble : styles.peerBubble]}>
              <Text style={item.isMe ? styles.meText : styles.peerText}>{item.text}</Text>
            </View>
            <Text style={styles.msgTime}>{item.time}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.textInput}
          placeholder="Compose secure thread message..."
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onClick={sendMessage}>
          <Send size={15} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#0F0F16',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: '#10B981',
    fontSize: 9,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  messagesContainer: {
    padding: 15,
  },
  msgWrapper: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  meAlign: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  peerAlign: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  meBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 2,
  },
  peerBubble: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderBottomLeftRadius: 2,
  },
  meText: {
    color: '#FFF',
    fontSize: 12,
    lineHeight: 16,
  },
  peerText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  msgTime: {
    color: '#475569',
    fontSize: 8,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#0F0F16',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 12,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
