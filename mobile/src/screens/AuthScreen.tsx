import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { mobileApi } from '../api/api';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthProps {
  onLoginSuccess: (user: any) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAuthSubmit = async () => {
    if (!email || !password || (!isLoginTab && !name)) {
      Alert.alert('Validation Error', 'Please complete all required forms.');
      return;
    }

    setSubmitting(true);
    try {
      if (isLoginTab) {
        // Log in of user
        const res = await mobileApi.login({ email, password });
        onLoginSuccess(res.user);
        Alert.alert('Authenticated', `Welcome back, ${res.user.name}!`);
      } else {
        // Register of user
        await mobileApi.register({ email, password, name, role: 'job_seeker' });
        Alert.alert('Account Created', 'Registration successful. Please log in.');
        setIsLoginTab(true);
      }
    } catch (error: any) {
      Alert.alert('Authentication Denied', error.message || 'Server error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert('Not Supported', 'Biometric hardware sensor missing from emulator device.');
      return;
    }

    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in utilizing biometric keychain passcode',
    });

    if (authResult.success) {
      // Mock login to demo profile
      const demoUser = { id: 'u1', name: 'Student J. Seeker', email: 'demo@attachme.com', role: 'job_seeker', profile: { avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Demo' } };
      onLoginSuccess(demoUser);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>Attach<Text style={{ color: '#6366F1' }}>ME</Text></Text>
        <Text style={styles.subtext}>Securing industrial placements and attachments</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, isLoginTab && styles.activeTab]} 
          onClick={() => setIsLoginTab(true)}
        >
          <Text style={[styles.tabText, isLoginTab && styles.activeTabText]}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, !isLoginTab && styles.activeTab]} 
          onClick={() => setIsLoginTab(false)}
        >
          <Text style={[styles.tabText, !isLoginTab && styles.activeTabText]}>Register</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {!isLoginTab && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. David Kim" 
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. candidate@attachme.com" 
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Private Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Min 6 characters" 
            placeholderTextColor="#64748B"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitBtn} 
          onClick={handleAuthSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{isLoginTab ? 'Access Dashboard' : 'Create Account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bioBtn} 
          onClick={handleInstantBiometrics}
        >
          <Text style={styles.bioBtnText}>🔓 Fast Touch/Face ID Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07070A',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  subtext: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  tabText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#818CF8',
  },
  card: {
    backgroundColor: '#0F0F16',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    shadowColor: '#6366F1',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#94A3B8',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bioBtn: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  bioBtnText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: 'semibold',
  },
});
