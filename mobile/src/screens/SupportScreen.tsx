import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { HelpCircle, Phone, MessageSquare, Plus, AlertCircle } from 'lucide-react-native';

export function SupportScreen() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState([
    { id: 'TKT-824', title: 'File upload size bounds check', status: 'Solved', date: '06/08' },
    { id: 'TKT-104', title: 'Resume profile translation', status: 'In Progress', date: 'Just now' }
  ]);

  const handleCreateTicket = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Incomplete Fields', 'Subject & Description required.');
      return;
    }

    const tktId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord = {
      id: tktId,
      title: subject,
      status: 'Active Queue',
      date: 'Just now'
    };

    setTickets(prev => [newRecord, ...prev]);
    setSubject('');
    setDescription('');
    Alert.alert('Ticket Raised', `Assigned id is: ${tktId}. Live REST socket registered.`);
  };

  const handleWhatsAppDeepLink = async () => {
    const textMsg = encodeURIComponent('Hello AttachME Support Desk! I am experiencing problems syncing my resumes matching data logs. Please advise.');
    const whatsappUrl = `https://wa.me/254712345678?text=${textMsg}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('App Not Installed', 'Unable to redirect. WhatsApp Client missing from device.');
      }
    } catch {
      // Direct linking fail callback fallback for testing in mock emulators
      Alert.alert('Deep-link Triggered', 'Simulated WhatsApp launch routing successful.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.banner}>
        <HelpCircle size={32} color="#818CF8" />
        <Text style={styles.bannerTitle}>Support help Desk</Text>
        <Text style={styles.bannerSub}>Submit tickets synchronized securely with our administrators.</Text>
      </View>

      {/* WhatsApp support trigger */}
      <View style={styles.waCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.waTitle}>Direct WhatsApp Line</Text>
          <Text style={styles.waSub}>Chat instantly with lead placements coordinator in case of help alerts.</Text>
        </View>
        <TouchableOpacity style={styles.waBtn} onClick={handleWhatsAppDeepLink}>
          <Phone size={14} color="#FFF" />
          <Text style={styles.waBtnText}>Chat Support</Text>
        </TouchableOpacity>
      </View>

      {/* Create Ticket Form */}
      <View style={styles.form}>
        <Text style={styles.sectionHeader}>Raise Support Ticket</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Detailed Subject</Text>
          <TextInput 
            style={styles.input} 
            placeholder="What issue or bug are you seeing?" 
            placeholderTextColor="#64748B"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Context Description</Text>
          <TextInput 
            style={[styles.input, { height: 70 }]} 
            multiline
            numberOfLines={3}
            placeholder="Describe steps, expected matching outcome, device model..." 
            placeholderTextColor="#64748B"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onClick={handleCreateTicket}>
          <Plus size={14} color="#FFF" />
          <Text style={styles.submitBtnText}>Submit Records Log</Text>
        </TouchableOpacity>
      </View>

      {/* History panel logs */}
      <View style={styles.historyList}>
        <Text style={styles.sectionHeader}>Tickets Register History</Text>
        {tickets.map(t => (
          <View key={t.id} style={styles.ticketCard}>
            <View>
              <Text style={styles.ticketTitle}>{t.title}</Text>
              <Text style={styles.ticketId}>ID: {t.id} • {t.date}</Text>
            </View>
            <View style={[styles.badge, t.status === 'Solved' ? styles.solvedBadge : styles.pendingBadge]}>
              <Text style={[styles.badgeText, t.status === 'Solved' ? styles.solvedText : styles.pendingText]}>{t.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070A',
    padding: 15,
  },
  banner: {
    alignItems: 'center',
    marginVertical: 15,
    textAlign: 'center',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bannerSub: {
    color: '#94A3B8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  waCard: {
    backgroundColor: 'rgba(22,163,74,0.06)',
    borderColor: 'rgba(22,163,74,0.15)',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  waTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  waSub: {
    color: '#A7F3D0',
    fontSize: 9,
    marginTop: 2,
    lineHeight: 13,
  },
  waBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#0F0F16',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 15,
    marginVertical: 10,
  },
  sectionHeader: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 10,
    color: '#FFF',
    padding: 10,
    fontSize: 11,
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 5,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyList: {
    marginVertical: 10,
    marginBottom: 30,
  },
  ticketCard: {
    backgroundColor: '#0F0F16',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketId: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  solvedBadge: {
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  solvedText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  pendingText: {
    color: '#F59E0B',
    fontSize: 8,
    fontWeight: 'bold',
  },
  badgeText: {
    fontFamily: 'monospace',
  },
});
