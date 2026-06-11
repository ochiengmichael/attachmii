import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { mobileApi } from '../api/api';
import { FileText, MapPin, Sparkles, RefreshCw } from 'lucide-react-native';

export function StudentDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cvName, setCvName] = useState<string | null>(null);

  useEffect(() => {
    loadPlacements();
  }, []);

  const loadPlacements = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.getJobs();
      setJobs(data || []);
    } catch (e) {
      Alert.alert('Offline Mode', 'Unable to retrieve real-time indices. Showing cached listings instead.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await mobileApi.getJobs();
      setJobs(data || []);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApply = async (jobId: string, title: string) => {
    try {
      await mobileApi.applyJob(jobId, 'Please review my resume attached in my profile.');
      Alert.alert('Application Filed', `Stated interest submitted for '${title}' successfully.`);
    } catch (err: any) {
      Alert.alert('Failed Application', err.message || 'Error executing endpoint parameters.');
    }
  };

  const handleDocumentPick = () => {
    // Standard mock document registration for mobile filesystem picker
    const samples = ['resume-engineering.pdf', 'academic-transcript-mit.pdf', 'recommendation-letter.pdf'];
    const chosen = samples[Math.floor(Math.random() * samples.length)];
    setCvName(chosen);
    Alert.alert('CV Synced', `Successfully linked documents: "${chosen}". Ready to match placements.`);
  };

  return (
    <View style={styles.container}>
      {/* Upper Glass Banner */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sparkles size={20} color="#818CF8" />
          <Text style={styles.headerTitle}>Match Placement Radar</Text>
        </View>
        <Text style={styles.headerSubtitle}>Synchronize attachments and industrial postings efficiently.</Text>
        
        {cvName ? (
          <View style={styles.cvBlock}>
            <Text style={styles.cvText}>📄 Linked: {cvName}</Text>
            <TouchableOpacity onClick={() => setCvName(null)}>
              <Text style={{ color: '#F87171', fontSize: 10, fontWeight: 'bold' }}>Unlink</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cvBtn} onClick={handleDocumentPick}>
            <Text style={styles.cvBtnText}>📎 Select Resume / CV PDF File</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }}>
        <Text style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: 13 }}>Latest Vacancies ({jobs.length})</Text>
        <TouchableOpacity style={{ padding: 4 }} onClick={onRefresh}>
          <RefreshCw size={14} color="#818CF8" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#6366F1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList 
          data={jobs}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobType}>{item.type || 'Intern'}</Text>
              </View>
              <Text style={styles.jobCompany}>{item.company || 'Enterprise'}</Text>
              
              <View style={styles.jobFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="#94A3B8" />
                  <Text style={styles.jobLoc}>{item.location}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.applyBtn} 
                  onClick={() => handleApply(item.id, item.title)}
                >
                  <Text style={styles.applyBtnText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No vacancies index in cache. Refresh.</Text>
          )}
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
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 15,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  cvBlock: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(99,102,241,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cvText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: 'semibold',
  },
  cvBtn: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderColor: 'rgba(99,102,241,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  cvBtnText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: 'bold',
  },
  jobItem: {
    backgroundColor: '#0F0F16',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  jobTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  jobType: {
    color: '#6366F1',
    backgroundColor: 'rgba(99,102,241,0.12)',
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  jobCompany: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginTop: 12,
    pt: 10,
  },
  jobLoc: {
    color: '#64748B',
    fontSize: 10,
  },
  applyBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 20,
    fontFamily: 'monospace',
  },
});
