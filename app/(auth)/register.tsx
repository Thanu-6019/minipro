import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/features/auth/services/auth.service';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword || !gender) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await authService.signUp(email.trim(), password, {
        full_name: name.trim(),
        gender,
      });

      if (signUpError) {
        setError(signUpError.message || 'Something went wrong. Please try again.');
        return;
      }

      // Navigate to complete-profile to collect gender
      router.replace('/(auth)/complete-profile');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Abstract Background Elements */}
        <View style={styles.bgContainer}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
        </View>

        <View style={styles.scrollContent}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../assets/logo.png')} style={styles.logoImage} accessibilityLabel="MedTrack AI logo" />
            </View>
            <Text style={styles.logoTitle}>MedTrack AI</Text>
            <Text style={styles.logoSubtitle}>Create your intelligent medical companion.</Text>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>

            {error !== '' && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="transparent"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
                accessibilityLabel="Full Name"
                autoComplete="name"
                returnKeyType="next"
              />
              <Text style={[styles.floatingLabel, (name !== '') && styles.floatingLabelActive]}>
                Full Name
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="transparent"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessibilityLabel="Email Address"
                autoComplete="email"
                returnKeyType="next"
              />
              <Text style={[styles.floatingLabel, (email !== '') && styles.floatingLabelActive]}>
                Email Address
              </Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="transparent"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                accessibilityLabel="Password"
                autoComplete="new-password"
                returnKeyType="next"
              />
              <Text style={[styles.floatingLabel, (password !== '') && styles.floatingLabelActive]}>
                Password
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="transparent"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                accessibilityLabel="Confirm Password"
                autoComplete="new-password"
                returnKeyType="done"
              />
              <Text style={[styles.floatingLabel, (confirmPassword !== '') && styles.floatingLabelActive]}>
                Confirm Password
              </Text>
            </View>

            {/* Gender Selection */}
            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonSelected,
                    pressed && styles.genderButtonPressed,
                  ]}
                  onPress={() => setGender('male')}
                  disabled={loading}
                  accessibilityLabel="Select Male"
                  accessibilityRole="radio"
                  accessibilityState={{ selected: gender === 'male' }}
                >
                  <Text style={[
                    styles.genderIcon,
                    gender === 'male' && styles.genderIconSelected,
                  ]}>♂</Text>
                  <Text style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextSelected,
                  ]}>Male</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonSelected,
                    pressed && styles.genderButtonPressed,
                  ]}
                  onPress={() => setGender('female')}
                  disabled={loading}
                  accessibilityLabel="Select Female"
                  accessibilityRole="radio"
                  accessibilityState={{ selected: gender === 'female' }}
                >
                  <Text style={[
                    styles.genderIcon,
                    gender === 'female' && styles.genderIconSelected,
                  ]}>♀</Text>
                  <Text style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextSelected,
                  ]}>Female</Text>
                </Pressable>
              </View>
            </View>

            {/* Sign Up Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              accessibilityLabel="Sign Up"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </Pressable>
          </View>

          {/* Footer Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink} onPress={() => router.push('/(auth)/login')} accessibilityLabel="Log in">
                Log in
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb',
  },
  bgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  blob1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '60%',
    height: '60%',
    borderRadius: 999,
    backgroundColor: '#d8e2ff',
    opacity: 0.4,
    transform: [{ scale: 0.8 }],
  },
  blob2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    backgroundColor: '#f6d9ff',
    opacity: 0.3,
    transform: [{ scale: 0.8 }],
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  // --- Logo Section ---
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#0070eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  logoTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#0058bc',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#414755',
  },
  // --- Card ---
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 5,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 16,
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 13,
    lineHeight: 18,
    color: '#ba1a1a',
    marginBottom: 12,
  },
  // --- Inputs ---
  inputGroup: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(246, 243, 245, 0.6)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.4)',
  },
  floatingLabel: {
    position: 'absolute',
    top: '50%',
    left: 16,
    transform: [{ translateY: -10 }],
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    color: '#717786',
    pointerEvents: 'none',
  },
  floatingLabelActive: {
    top: 8,
    transform: [{ translateY: 0 }],
    fontSize: 12,
    color: '#0058bc',
  },
  // --- Gender ---
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#717786',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246, 243, 245, 0.6)',
    borderRadius: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.4)',
  },
  genderButtonSelected: {
    backgroundColor: 'rgba(0, 112, 235, 0.08)',
    borderColor: '#0058bc',
  },
  genderButtonPressed: {
    opacity: 0.7,
  },
  genderIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#717786',
  },
  genderIconSelected: {
    color: '#0058bc',
  },
  genderButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 15,
    fontWeight: '500',
    color: '#414755',
  },
  genderButtonTextSelected: {
    color: '#0058bc',
  },
  // --- Submit Button ---
  primaryButton: {
    width: '100%',
    backgroundColor: '#0058bc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 48,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#004493',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
  },
  // --- Footer ---
  footerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#414755',
  },
  footerLink: {
    color: '#0058bc',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
  },
});
