import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../src/services/firebase';

const publicPaths = new Set(['/', '/login', '/register']);
const protectedPrefixes = ['/(tabs)', '/route-details', '/active-route', '/camera', '/trash-confirm', '/route-complete'];

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const isPublicPath = publicPaths.has(pathname);
    const isProtectedPath = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (!currentUser && isProtectedPath) {
      router.replace('/');
      return;
    }

    if (currentUser && isPublicPath) {
      router.replace('/(tabs)');
    }
  }, [authReady, currentUser, pathname, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!authReady ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#16A34A" size="large" />
        </View>
      ) : (
        <Slot />
      )}
    </GestureHandlerRootView>
  );
}
