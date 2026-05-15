/**
 * @file signup.tsx
 * @description Signup screen with comprehensive validation and API integration.
 * Features:
 * - Form handling with react-hook-form and zod.
 * - Supports name, email, username, phone, password, and bio.
 * - Role is defaulted to GUEST as per the API requirements.
 * - Real-time validation and error handling from the backend.
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
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bio: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const { register: signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      phone: '',
      password: '',
      bio: '',
    },
  });

  const onSignupSubmit = async (data: SignupForm) => {
    setServerError(null);
    try {
      // API expects role and potentially bio
      await signup({ 
        ...data, 
        role: 'GUEST',
        bio: data.bio || 'New traveler on Airbnb' 
      });
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Failed to create account. Please try again.');
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

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.title}>Finish signing up</ThemedText>
          
          <View style={styles.form}>
            {serverError && (
              <View style={styles.errorBanner}>
                <ThemedText style={styles.errorText}>{serverError}</ThemedText>
              </View>
            )}

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Full name</ThemedText>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="First and last name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && <ThemedText style={styles.fieldErrorText}>{errors.name.message}</ThemedText>}
            </View>

            {/* Email */}
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

            {/* Username */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.username && styles.inputError]}
                    placeholder="Choose a username"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.username && <ThemedText style={styles.fieldErrorText}>{errors.username.message}</ThemedText>}
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Phone Number</ThemedText>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="+250..."
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                  />
                )}
              />
              {errors.phone && <ThemedText style={styles.fieldErrorText}>{errors.phone.message}</ThemedText>}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <View style={styles.passwordWrapper}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { flex: 1, borderBottomWidth: 0 }, errors.password && styles.inputError]}
                      placeholder="Create a password"
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

            <ThemedText style={styles.policyText}>
              By selecting <ThemedText style={styles.boldText}>Agree and continue</ThemedText>, I agree to Airbnb's <ThemedText style={styles.linkText}>Terms of Service</ThemedText> and <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>.
            </ThemedText>

            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit(onSignupSubmit)}
              disabled={isLoading}
            >
              <ThemedText style={styles.signupButtonText}>
                {isLoading ? 'Creating account...' : 'Agree and continue'}
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
  policyText: {
    fontSize: 12,
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    lineHeight: 18,
    marginBottom: 32,
  },
  boldText: {
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  linkText: {
    color: '#0066FF',
    fontFamily: 'Figtree-SemiBold',
  },
  signupButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#FFB3C1',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
  },
});
