import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    try {
      await signup(name, email, password);
      router.replace('/(tabs)');
    } catch (error) {
      console.error(error);
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
          <ThemedText style={styles.title}>Finish signing up</ThemedText>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Full name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="First and last name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <ThemedText style={styles.policyText}>
              By selecting <ThemedText style={styles.boldText}>Agree and continue</ThemedText>, I agree to Airbnb's <ThemedText style={styles.linkText}>Terms of Service</ThemedText> and <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>.
            </ThemedText>

            <TouchableOpacity 
              style={[styles.signupButton, (!name || !email || !password || isLoading) && styles.disabledButton]}
              onPress={handleSignup}
              disabled={!name || !email || !password || isLoading}
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
    marginBottom: 24,
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
