# MedTrack AI - Release Candidate 1 (RC1) Checklist

## 1. Build Verification
- [ ] **Production Build (EAS)**: `eas build --platform ios --profile production` succeeds.
- [ ] **Android Build (EAS)**: `eas build --platform android --profile production` succeeds.
- [ ] **iOS Build (EAS)**: `eas build --platform ios --profile production` succeeds.
- [ ] **Artifact Verification**: Verify `.ipa` and `.aab` files are generated correctly.

## 2. Environment & Configuration
- [ ] **Environment Variables**: `.env.production` is configured with correct production secrets.
- [ ] **Supabase Secrets**: Edge function secrets (OCR, Grok, FDA) are set in the Supabase production dashboard.
- [ ] **App Config**: `app.json` (or `app.config.js`) has correct `bundleIdentifier` and `package` names.
- [ ] **Deep Linking**: Custom URI scheme is verified for production.

## 3. Integration & Stability
- [ ] **Automated Tests**: All unit and E2E tests pass in the CI/CD pipeline.
- [ ] **API Connectivity**: Verified connectivity to production Supabase instance.
- [ ] **Third-Party Services**: OCR, Grok, and FDA integrations are functioning in the production environment.
- [ ] **Data Integrity**: Migration scripts have been run on the production database.

## 4. Store Readiness
- [ ] **Assets**: `icon.png` and `splash.png` are high-resolution and meet store requirements.
- [ ] **Metadata**: App name, description, and screenshots are prepared for App Store/Play Store.
- [ ] **Legal**: Privacy Policy URL is hosted and valid.
- [ ] **Accounts**: App Store Connect and Google Play Console accounts are active.

## 5. Post-Build Validation
- [ ] **Physical Device Testing**: Production builds are installed and tested on actual devices.
- [ ] **Performance**: App responsiveness and battery usage are within acceptable limits.
- [ ] **Error Monitoring**: Logging and error tracking (e.g., Sentry) are active in production.
