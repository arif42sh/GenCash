import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor={colors.surface} />
          <AppNavigator />
        </View>
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
