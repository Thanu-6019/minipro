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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/features/auth/services/auth.service';

export default function MedTrackLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await authService.signIn(email.trim(), password);
      if (signInError) {
        setError(signInError.message || 'Invalid email or password.');
      }
      // Auth state change listener in root layout will redirect to /(tabs)
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Please enter your email address first.');
      return;
    }
    try {
      const { error: resetError } = await authService.forgotPassword(email.trim());
      if (resetError) {
        Alert.alert('Reset Password', resetError.message || 'Failed to send reset email.');
      } else {
        Alert.alert('Reset Password', 'Check your email for a password reset link.');
      }
    } catch {
      Alert.alert('Reset Password', 'Something went wrong. Please try again.');
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

        <View style={styles.contentContainer}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../assets/logo.png')} style={styles.logoImage} accessibilityLabel="MedTrack AI logo" />
            </View>
            <Text style={styles.logoTitle}>MedTrack AI</Text>
            <Text style={styles.logoSubtitle}>Your intelligent medical companion.</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>

            {error !== '' && (
              <Text style={styles.errorText}>{error}</Text>
            )}

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
                autoComplete="password"
                returnKeyType="done"
              />
              <Text style={[styles.floatingLabel, (password !== '') && styles.floatingLabelActive]}>
                Password
              </Text>
            </View>

            {/* Actions Row */}
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                accessibilityLabel="Remember me"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Pressable onPress={handleForgotPassword} accessibilityLabel="Forgot password">
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Sign In Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              accessibilityLabel="Sign In"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialContainer}>
              <Pressable style={({ pressed }) => [styles.socialButton, styles.googleButton, pressed && styles.socialButtonPressed]} accessibilityLabel="Sign in with Google" accessibilityRole="button">
                <GoogleIcon />
                <Text style={styles.socialButtonText}>Google</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.socialButton, styles.appleButton, pressed && styles.socialButtonPressed]} accessibilityLabel="Sign in with Apple" accessibilityRole="button">
                <AppleIcon />
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>Apple</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Don&apos;t have an account?{' '}
              <Text style={styles.footerLink} onPress={() => router.push('/(auth)/register')} accessibilityLabel="Create account">
                Create one
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// --- SVG Components ---
const GoogleIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={{ uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" fill="%23555"/></svg>' }} style={{ width: 20, height: 20 }} />
  </View>
);

const AppleIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={{ uri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.05,20.28c-.98.95-2.05,1.8-3.08,1.8-1.09,0-1.46-.66-2.67-.66-1.22,0-1.63.66-2.66.66-1.08,0-2.04-.84-3.13-1.87-2.65-2.52-4.52-7.14-3.56-10.96.44-1.74,1.61-3.2,3.31-3.95,1.21-.54,2.53-.4,3.58,0,.76.3,1.4.74,1.94,1.25.56-.51,1.21-.96,2.02-1.27,1.16-.43,2.5-.52,3.69-.17,1.86.54,3.22,1.89,3.61,3.28-2.66,1.06-3.14,4.25-1.02,5.82-.69,2.03-1.75,4.01-2.03,4.07Zm-3.1-17.78c-.52.59-1.24,1.01-2.04,1.14-.15-1.23.36-2.45,1.24-3.26.54-.49,1.28-.85,2.04-1.02.16,1.25-.4,2.44-1.24,3.14Z" fill="%23ffffff"/></svg>' }} style={{ width: 20, height: 20 }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb', // surface
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
    backgroundColor: '#d8e2ff', // primary-fixed
    opacity: 0.4,
    transform: [{ scale: 0.8 }],
    // Blur is achieved via view hierarchy, but for native we use opacity/color to simulate
  },
  blob2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    backgroundColor: '#f6d9ff', // tertiary-fixed
    opacity: 0.3,
    transform: [{ scale: 0.8 }],
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // margin-mobile
    zIndex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  // --- Logo Section ---
  logoSection: {
    alignItems: 'center',
    marginBottom: 24, // mb-xl
  },
  logoWrapper: {
    width: 64, // w-16
    height: 64,
    borderRadius: 12, // rounded-xl
    backgroundColor: '#0070eb', // primary-container
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
    fontSize: 28, // display-lg-mobile
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#0058bc', // primary
    marginBottom: 4, // mb-xs
  },
  logoSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15, // body-md
    lineHeight: 20,
    fontWeight: '400',
    color: '#414755', // on-surface-variant
  },
  // --- Card ---
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12, // rounded-xl
    padding: 24, // p-lg
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    // Glass effect approximated
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 5,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22, // headline-md
    lineHeight: 28,
    fontWeight: '600',
    color: '#1b1b1d', // on-surface
    marginBottom: 16, // mb-lg
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
    marginBottom: 16, // space-y-md
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(246, 243, 245, 0.6)', // input-glass bg
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 16, // px-md
    paddingTop: 24, // for floating label space
    paddingBottom: 8,
    fontSize: 15, // body-md
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#1b1b1d', // on-surface
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.4)', // outline-variant opacity
  },
  floatingLabel: {
    position: 'absolute',
    top: '50%',
    left: 16,
    transform: [{ translateY: -10 }], // Adjusted for smoother transition
    fontSize: 13, // label-md
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    color: '#717786', // outline
    pointerEvents: 'none',
  },
  floatingLabelActive: {
    top: 8,
    transform: [{ translateY: 0 }],
    fontSize: 12,
    color: '#0058bc', // primary
  },
  // --- Actions ---
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4, // mt-sm
    marginBottom: 16, // mb-lg
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16, // w-4
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c1c6d7', // outline-variant
    backgroundColor: '#ffffff', // surface-container-lowest
    marginRight: 8, // space-x-2
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0058bc', // primary
    borderColor: '#0058bc',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 13, // label-md
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    color: '#414755', // on-surface-variant
  },
  forgotPasswordText: {
    fontSize: 13, // label-md
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    color: '#0058bc', // primary
  },
  // --- Submit Button ---
  primaryButton: {
    width: '100%',
    backgroundColor: '#0058bc', // primary
    paddingVertical: 12, // py-sm
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#004493', // on-primary-fixed-variant (darker blue)
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff', // on-primary
    fontSize: 20, // title-lg
    lineHeight: 25,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
  },
  // --- Divider ---
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24, // mt-lg
    marginBottom: 24, // mb-lg
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(193, 198, 215, 0.3)', // outline-variant opacity
  },
  dividerText: {
    paddingHorizontal: 12, // px-sm
    fontSize: 11, // label-sm
    lineHeight: 13,
    letterSpacing: 0.06,
    fontWeight: '600',
    color: '#717786', // outline
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
  },
  // --- Socials ---
  socialContainer: {
    gap: 12, // space-y-sm
    width: '100%',
  },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8, // rounded-lg
  },
  socialButtonPressed: {
    opacity: 0.7,
  },
  googleButton: {
    backgroundColor: '#ffffff', // surface-container-lowest
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.5)', // outline-variant opacity
  },
  appleButton: {
    backgroundColor: '#303032', // inverse-surface
  },
  socialButtonText: {
    fontSize: 13, // label-md
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    color: '#1b1b1d', // on-surface
    marginLeft: 8,
  },
  appleButtonText: {
    color: '#f3f0f2', // inverse-on-surface
  },
  iconContainer: {
    marginRight: 8,
  },
  // --- Footer ---
  footerContainer: {
    marginTop: 24, // mt-lg
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15, // body-md
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#414755', // on-surface-variant
  },
  footerLink: {
    color: '#0058bc', // primary
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
  },
});