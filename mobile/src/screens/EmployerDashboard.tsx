import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Star, Trash2, CheckCircle, Share2 } from 'lucide-react-native';

export function EmployerDashboard() {
  const [candidates, setCandidates] = useState([
    { id: '1', name: 'James Omondi', course: 'BSc. Computer Science', university: 'Jawat University', status: 'Pending Review' },
    { id: '2', name: 'Achieng Maria', course: 'Diploma in Web Development', university: 'Metropolitan Tech College', status: 'Shortlisted' },
    { id: '3', name: 'Sophia Chen', course: 'BSc. Cyber Security', university: 'Technical Institute', status: 'Pending Review' }
  ]);

  const [evaluationCart, setEvaluationCart] = useState<string[]>(['2']);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');

  const toggleCart = (id: string, name: string) => {
    if (evaluationCart.includes(id)) {
      setEvaluationCart(prev => prev.filter(item => item !== id));
      Alert.alert('Cart Action', `${name} removed from your selection ledger.`);
    } else {
      setEvaluationCart(prev => [...prev, id]);
      Alert.alert('Cart Action', `${name} added to shortlist evaluation queue.`);
    }
  };

  const submitFeedback = () => {
    if (!review.trim()) {
      Alert.alert('Form Incomplete', 'Provide reference remarks before submission.');
      return;
    }
    Alert.alert('Feedback Registered', `Stored review with ${stars}/5 rating. Database sync active.`);
    setSelectedCandidate(null);
    setReview('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryTitle}>Enterprise Intake Screen</Text>
          <Text style={styles.summarySub}>Logged as Recruiting Admin Manager</Text>
        </View>
        <View style={styles.cartCountContainer}>
          <Text style={styles.cartCountText}>{evaluationCart.length} Queue</Text>
        </View>
      </View>

      {/* Candidates List Header */}
      <Text style={styles.sectionHeader}>Applicants Registry ({candidates.length})</Text>

      {selectedCandidate ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Grade: {selectedCandidate.name}</Text>
          <Text style={styles.formDesc}>{selectedCandidate.university}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(st => (
              <TouchableOpacity key={st} onClick={() => setStars(st)}>
                <Star size={24} color={st <= stars ? '#FBBF24' : '#475569'} fill={st <= stars ? '#FBBF24' : 'transparent'} />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput 
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Add comments, recommended departments..."
            placeholderTextColor="#64748B"
            value={review}
            onChangeText={setReview}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.submitBtn} onClick={submitFeedback}>
              <Text style={styles.btnText}>Complete Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onClick={() => setSelectedCandidate(null)}>
              <Text style={[styles.btnText, { color: '#FFF' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList 
          data={candidates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const inCart = evaluationCart.includes(item.id);
            return (
              <View style={styles.candItem}>
                <View>
                  <Text style={styles.candName}>{item.name}</Text>
                  <Text style={styles.candSub}>{item.course}</Text>
                  <Text style={styles.candUniv}>{item.university}</Text>
                </View>

                <View style={styles.candActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, inCart && styles.activeActionBtn]}
                    onClick={() => toggleCart(item.id, item.name)}
                  >
                    <Text style={[styles.actionBtnText, inCart && styles.activeActionBtnText]}>
                      {inCart ? '★ Shortlisted' : '☆ Select Entry'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.reviewBtn}
                    onClick={() => setSelectedCandidate(item)}
                  >
                    <Text style={styles.reviewBtnText}>Feedback</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070A',
    padding: 15,
  },
  summaryBar: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summarySub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  cartCountContainer: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cartCountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  candItem: {
    backgroundColor: '#0F0F16',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  candName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  candSub: {
    color: '#818CF8',
    fontSize: 10,
    marginTop: 2,
    fontWeight: 'semibold',
  },
  candUniv: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  candActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 10,
  },
  actionBtn: {
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  activeActionBtn: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.3)',
  },
  actionBtnText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 'bold',
  },
  activeActionBtnText: {
    color: '#818CF8',
  },
  reviewBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  reviewBtnText: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#0F0F16',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  formTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  formDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 15,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 12,
    color: '#FFF',
    padding: 12,
    fontSize: 12,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
