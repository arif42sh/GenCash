import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/constants/colors';

export default function App() {
  useEffect(() => {
    // Inject Plus Jakarta Sans & Inter fonts for web rendering
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const fontLinkId = 'gencash-web-fonts';
      if (!document.getElementById(fontLinkId)) {
        const link = document.createElement('link');
        link.id = fontLinkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.id = 'gencash-global-typography';
        style.textContent = `
          * {
            font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
          }
          input, textarea {
            user-select: auto !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

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
    backgroundColor: '#EDF7F4',
  },
});

