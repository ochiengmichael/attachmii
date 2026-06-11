import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'; // Note standard expo import structure below
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as LocalAuthentication from 'expo-local-authentication';

import { Briefcase, MessageSquare, Bell, User as UserIcon, ShieldAlert } from 'lucide-react-native';

// Import Screens
import { AuthScreen } from './src/screens/AuthScreen';
import { StudentDashboard } from './src/screens/StudentDashboard';
import { EmployerDashboard } from './src/screens/EmployerDashboard';
import { ChatScreen } from './src/screens/ChatScreen';
import { SupportScreen } from './src/screens/SupportScreen';

import { getAccessToken, clearTokens, mobileApi } from './src/api/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardNavigator({ userRole }: { userRole: string }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Portal') {
            return <Briefcase size={size} color={color} />;
          } else if (route.name === 'Chats') {
            return <MessageSquare size={size} color={color} />;
          } else if (route.name === 'Alerts') {
            return <Bell size={size} color={color} />;
          } else {
            return <ShieldAlert size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#0F0F16',
          borderTopColor: 'rgba(255,255,255,0.06)',
          paddingBottom: 6,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#08080C',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#FFFFFF',
          fontSize: 16,
        },
        headerTintColor: '#FFF',
      })}
    >
      <Tab.Screen name="Portal">
        {() => userRole === 'employer' ? <EmployerDashboard /> : <StudentDashboard />}
      </Tab.Screen>
      <Tab.Screen name="Chats" component={ChatScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check cached session on startup & run biometrics checking
  useEffect(() => {
    checkCachedSession();
  }, []);

  const checkCachedSession = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        // Fetch current user from server
        const res = await mobileApi.getMe();
        if (res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
          
          // Trigger silent fingerprint prompt if enabled
          triggerBiometricVerification();
        } else {
          await clearTokens();
        }
      }
    } catch {
      console.log('API offline during startup. Allowing biometric mock login bypass.');
    } finally {
      setLoading(false);
    }
  };

  const triggerBiometricVerification = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const bioAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with FaceID / Fingerprint',
        fallbackLabel: 'Use password passcode',
      });
      if (bioAuth.success) {
        Alert.alert('Success', 'Biometric login successful. Session unlocked.');
      }
    }
  };

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading AttachME Native Secure Core...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="MainApp">
              {() => <DashboardNavigator userRole={user?.role || 'job_seeker'} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Auth">
              {() => <AuthScreen onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#08080C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 15,
    letterSpacing: 2,
  },
});
