import './global.css';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/navigation/types';

import { HomeScreen } from './src/screens/HomeScreen';
import { SettingScreen } from './src/screens/SettingScreen';
import { I18nProvider } from './src/i18n/I18nContext';
import { initDB } from './src/db/database';

// Initialize DB before any provider reads settings
initDB();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <I18nProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nProvider>
  );
}
