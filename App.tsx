import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, StatusBar, Alert, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { theme } from './theme';
import { getItem, setItem, removeItem } from './utils/storage';
import { ToastProvider } from './context/ToastContext';
import { authEvents } from './utils/authEvents';
import { STORAGE_KEYS, REFRESH_TOKEN_MAX_AGE_MS } from './constants';

import Loader from './components/Loader';
import AuthScreen from './components/AuthScreen';

import HomeScreen from './components/HomeScreen';
import JobsScreen from './components/JobsScreen';
import JobApplyScreen from './components/JobApplyScreen';
import ServicesScreen from './components/ServicesScreen';
import ProfileScreen from './components/ProfileSection';
import WorkerSetupScreen from './components/WorkerSetupScreen';
import JobSetupScreen from './components/JobSetupScreen';
import KycScreen from './components/KycScreen';

import {
  Home,
  User,
  HandPlatter,
  BriefcaseBusiness,
} from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLoginSuccess = async (id: string) => {
    setUserId(id);
    await setItem('userId', id);
  };

  const handleLogout = useCallback(async () => {
    setUserId(null);
    await removeItem('userId');
    await removeItem('worker_profile');
    await removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await removeItem(STORAGE_KEYS.REFRESH_TOKEN_TIMESTAMP);
    await removeItem(STORAGE_KEYS.USER_DATA);
  }, []);

  // Listen for global force-logout events (e.g. refresh token expired, inactive account)
  useEffect(() => {
    const unsubscribe = authEvents.addLogoutListener((reason) => {
      handleLogout();
      if (reason === 'inactive') {
        Alert.alert(
          'Account Inactive',
          'Your account is inactive. Please contact admin.',
          [{ text: 'OK' }]
        );
      } else if (reason === 'refresh_token_expired') {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{ text: 'OK' }]
        );
      }
    });
    return unsubscribe;
  }, [handleLogout]);

  // Check token expiry on app load and when app returns to foreground
  useEffect(() => {
    const checkTokenExpiry = async () => {
      const refreshToken = await getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return;

      const timestamp = await getItem(STORAGE_KEYS.REFRESH_TOKEN_TIMESTAMP);
      if (!timestamp) return;

      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (elapsed > REFRESH_TOKEN_MAX_AGE_MS) {
        handleLogout();
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{ text: 'OK' }]
        );
      }
    };

    const checkAuth = async () => {
      setLoading(true);
      const accessToken = await getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        // Check if refresh token is expired before restoring session
        const timestamp = await getItem(STORAGE_KEYS.REFRESH_TOKEN_TIMESTAMP);
        if (timestamp) {
          const elapsed = Date.now() - parseInt(timestamp, 10);
          if (elapsed > REFRESH_TOKEN_MAX_AGE_MS) {
            await handleLogout();
            setLoading(false);
            return;
          }
        }
        const storedUserId = await getItem('userId');
        if (storedUserId) setUserId(storedUserId);
      }
      setLoading(false);
    };
    checkAuth();

    // Also check when app returns to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkTokenExpiry();
      }
    });

    return () => subscription.remove();
  }, [handleLogout]);

  if (loading) return <Loader />;

  /* ---------------- HOME STACK ---------------- */
  const HomeStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="JobApply" component={JobApplyScreen} />
    </Stack.Navigator>
  );

  /* ---------------- JOBS STACK (IMPORTANT) ---------------- */
  const JobsStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobsMain" component={JobsScreen} />
      <Stack.Screen name="JobApply" component={JobApplyScreen} />
    </Stack.Navigator>
  );

  /* ---------------- PROFILE STACK ---------------- */
  const ProfileStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain">
        {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
      </Stack.Screen>
      <Stack.Screen name="WorkerSetup" component={WorkerSetupScreen} />
      <Stack.Screen name="JobSetup" component={JobSetupScreen} />
      <Stack.Screen name="KycScreen" component={KycScreen} />
    </Stack.Navigator>
  );

  /* ---------------- MAIN TABS ---------------- */
  const MainTabs = () => (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Home
              size={24}
              strokeWidth={focused ? 0 : 1}
              fill={focused ? theme.colors.active : 'none'}
              color={focused ? theme.colors.active : theme.colors.inactive}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Jobs"
        component={JobsStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <BriefcaseBusiness
              size={24}
              strokeWidth={focused ? 0 : 1}
              fill={focused ? theme.colors.active : 'none'}
              color={focused ? theme.colors.active : theme.colors.inactive}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <HandPlatter
              size={24}
              strokeWidth={focused ? 0 : 1}
              fill={focused ? theme.colors.active : 'none'}
              color={focused ? theme.colors.active : theme.colors.inactive}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <User
              size={24}
              strokeWidth={focused ? 0 : 1}
              fill={focused ? theme.colors.active : 'none'}
              color={focused ? theme.colors.active : theme.colors.inactive}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <StatusBar
          backgroundColor={theme.colors.surface}
          barStyle="dark-content"
        />
        <NavigationContainer>
          {!userId ? (
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          ) : (
            <MainTabs />
          )}
        </NavigationContainer>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  text: { fontSize: 22, fontWeight: '600', color: theme.colors.text },
});