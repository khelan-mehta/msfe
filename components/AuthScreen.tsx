import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './registerScreen';
import ProfileScreen from './ProfileSection';

const Stack = createNativeStackNavigator();

interface AuthScreenProps {
  onLoginSuccess?: (userId: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess = () => {} }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onLogout={() => {}} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthScreen;
