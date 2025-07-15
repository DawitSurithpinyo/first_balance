import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import CredentialProvider from '@/lib/credentialsContext';
import RecordProvider from '@/lib/recordContext';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    // put GoogleOAuthProvider on outermost, so the Google OAuth flow works properly
    <GoogleOAuthProvider clientId='1081957400734-gd6krhrfpapk4063derrrfc7pibu0mm1.apps.googleusercontent.com'>
      <CredentialProvider>
        <RecordProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="signIn" options={{ headerShown: false }} />
              <Stack.Screen name="signUp" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </RecordProvider>
      </CredentialProvider>
    </GoogleOAuthProvider>
  );
}
