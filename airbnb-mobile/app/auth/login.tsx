/**
 * @file login.tsx
 * @description Login screen with validation and API integration.
 * Features:
 * - Form handling using react-hook-form and zod validation.
 * - Integration with useAuth for authentication logic.
 * - Visual feedback for loading and error states.
 * - Navigation to Signup and Reset Password.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Validation Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await login(data);
    } catch (error: any) {
      // Covers: our GUEST-only gate (error.message) + API errors (error.response?.data?.message)
      setServerError(error.message || error.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#222222" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText style={styles.title}>Log in to Airbnb</ThemedText>
          
          <View style={styles.form}>
            {/* Server Error Message */}
            {serverError && (
              <View style={styles.errorBanner}>
                <ThemedText style={styles.errorText}>{serverError}</ThemedText>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter your email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                )}
              />
              {errors.email && <ThemedText style={styles.fieldErrorText}>{errors.email.message}</ThemedText>}
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <View style={styles.passwordWrapper}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { flex: 1, borderBottomWidth: 0 }, errors.password && styles.inputError]}
                      placeholder="Enter your password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#717171" /> : <Eye size={20} color="#717171" />}
                </TouchableOpacity>
              </View>
              <View style={[styles.border, errors.password && { backgroundColor: '#FF385C' }]} />
              {errors.password && <ThemedText style={styles.fieldErrorText}>{errors.password.message}</ThemedText>}
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={styles.linkText}>Forgot password?</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit(onLoginSubmit)}
              disabled={isLoading}
            >
              <ThemedText style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Continue'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <ThemedText style={styles.dividerText}>or</ThemedText>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.socialButton} onPress={loginWithGoogle}>
               <ThemedText style={styles.socialButtonText}>Continue with Google</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupLink}
              onPress={() => router.push('/auth/signup')}
            >
              <ThemedText style={styles.footerText}>
                Don't have an account? <ThemedText style={styles.linkText}>Sign up</ThemedText>
              </ThemedText>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Figtree-Bold',
    color: '#222222',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  errorBanner: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF385C',
  },
  errorText: {
    color: '#FF385C',
    fontSize: 14,
    fontFamily: 'Figtree-Medium',
  },
  fieldErrorText: {
    color: '#FF385C',
    fontSize: 12,
    fontFamily: 'Figtree-Regular',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#717171',
    fontFamily: 'Figtree-Medium',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Figtree-Regular',
    color: '#222222',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  inputError: {
    borderBottomColor: '#FF385C',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  border: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginTop: -1,
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  linkText: {
    color: '#222222',
    fontFamily: 'Figtree-SemiBold',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#FFB3C1',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#717171',
    fontSize: 12,
    fontFamily: 'Figtree-Regular',
  },
  socialButton: {
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  socialButtonText: {
    color: '#222222',
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#717171',
    fontSize: 14,
    fontFamily: 'Figtree-Regular',
  },
});
