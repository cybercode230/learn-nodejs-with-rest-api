import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      await login(email, password);
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
          <ThemedText style={styles.title}>Log in to Airbnb</ThemedText>
          
          <View style={styles.form}>
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
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#717171" /> : <Eye size={20} color="#717171" />}
                </TouchableOpacity>
              </View>
              <View style={styles.border} />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={styles.linkText}>Forgot password?</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, (!email || !password || isLoading) && styles.disabledButton]}
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
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

            <TouchableOpacity style={styles.socialButton}>
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
