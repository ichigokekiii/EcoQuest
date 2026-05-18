import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { auth } from '../src/services/firebase';
import api from '../src/services/api';
import { colors, spacing, radius } from '../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      try {
        await api.get('/users/me');
      } catch (profileError) {
        if (profileError.response?.status !== 404) {
          throw profileError;
        }

        await api.post('/auth/sync-user', {
          fullName: email.trim().split('@')[0],
          email: email.trim(),
        });
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Login failed', error.response?.data?.message || error.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image 
              source={require('../assets/ecoquest/ecoquest.svg')} 
              style={styles.logo} 
              contentFit="contain" 
            />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your eco quest</Text>
          </View>

          <View style={styles.formContainer}>
            <Input 
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Feather name="mail" size={20} color="#9CA3AF" />}
            />
            <Input 
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Feather name="lock" size={20} color="#9CA3AF" />}
            />
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button 
              title="Sign In" 
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <Button 
              title="Continue with Google" 
              variant="outline"
              onPress={() => {}} 
              style={styles.googleButton}
              textStyle={styles.googleButtonText}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.promptText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.promptAction}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  loginButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  googleButton: {
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    position: 'relative',
  },
  googleButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: spacing.sm,
  },
  promptText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  promptAction: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
