import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { theme } from './theme';
import { getItem, setItem, removeItem } from './utils/storage';
import { ToastProvider } from './context/ToastContext';

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

  const handleLogout = async () => {
    setUserId(null);
    await removeItem('userId');
    await removeItem('worker_profile');
    await removeItem('access_token');
    await removeItem('user_data');
  };

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const accessToken = await getItem('access_token');
      if (accessToken) {
        const storedUserId = await getItem('userId');
        if (storedUserId) setUserId(storedUserId);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

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