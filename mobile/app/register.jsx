import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { auth } from '../src/services/firebase';
import api from '../src/services/api';
import { getFirebaseAuthErrorMessage } from '../src/utils/authErrors';
import { colors, spacing, radius } from '../src/constants/theme';

function getPasswordStrength(password) {
  const hasLetter = /[a-z]/i.test(password);
  const hasNumber = /\d/.test(password);
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!password) {
    return {
      bars: 0,
      label: 'Weak',
      color: '#E5E7EB',
    };
  }

  if (hasLetter && hasNumber && hasCapital && hasSpecial) {
    return {
      bars: 4,
      label: 'Strong',
      color: '#16A34A',
    };
  }

  if (hasLetter && hasNumber && hasCapital) {
    return {
      bars: 3,
      label: 'Good',
      color: '#22C55E',
    };
  }

  if (hasLetter && hasNumber) {
    return {
      bars: 2,
      label: 'Weak',
      color: '#EAB308',
    };
  }

  return {
    bars: 1,
    label: 'Weak',
    color: '#EF4444',
  };
}

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Your passwords do not match.');
      return;
    }

    if (!termsAgreed) {
      Alert.alert('Terms required', 'Please agree to the terms before creating an account.');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      await api.post('/auth/sync-user', {
        fullName: fullName.trim(),
        email: email.trim(),
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.log('Register error:', error);
      Alert.alert(
        'Registration failed',
        getFirebaseAuthErrorMessage(error, 'Unable to create your account right now.')
      );
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
          
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Feather name="chevron-left" size={24} color="#111827" />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Start your eco journey today</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Input 
              label="Full Name"
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Feather name="user" size={20} color="#9CA3AF" />}
            />
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
            <Input 
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Feather name="lock" size={20} color="#9CA3AF" />}
            />
            
            <View style={styles.passwordStrengthContainer}>
              {[1, 2, 3, 4].map((bar) => (
                <View
                  key={bar}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        bar <= passwordStrength.bars ? passwordStrength.color : '#E5E7EB',
                    },
                  ]}
                />
              ))}
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setTermsAgreed(!termsAgreed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, termsAgreed && styles.checkboxChecked]}>
                {termsAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button 
              title="Create Account" 
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
              textStyle={styles.registerButtonText}
            />

            <Button 
              title="Continue with Google" 
              variant="outline"
              onPress={() => {}} 
              style={styles.googleButton}
              textStyle={styles.googleButtonText}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.promptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.promptAction}>Sign In</Text>
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
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  formContainer: {
    marginBottom: spacing.sm,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingRight: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: '#14532D',
    borderColor: '#14532D',
  },
  termsText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    color: '#16A34A',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
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
