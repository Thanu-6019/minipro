# MedTrack AI - Deployment Checklist

## 1. Supabase Production Setup
- [ ] Configure Environment Variables (`.env.production`)
- [ ] Set up Edge Function secrets using Supabase CLI:
    ```bash
    supabase secrets set OPENOCR_API_KEY=your_key
    supabase secrets set GROK_API_KEY=your_key
    supabase secrets set OPENFDA_API_KEY=your_key
    ```
- [ ] Run all migrations on production database
- [ ] Configure Auth redirect URLs in Supabase Dashboard

## 2. Store Submission Preparation
- [ ] **Icons & Splash**: Ensure `assets/icon.png` and `assets/splash.png` match requirements (1024x1024 / high-res).
- [ ] **Privacy Policy**: Host a valid URL for the privacy policy.
- [ ] **App Store**:
    - [ ] Create App Store Connect record.
    - [ ] Generate Provisioning Profiles/Certificates via EAS.
- [ ] **Play Store**:
    - [ ] Create Google Play Console record.
    - [ ] Generate App Signing Key via EAS.

## 3. Build & Submission
- [ ] Run `eas build --platform ios --profile production`
- [ ] Run `eas build --platform android --profile production`
- [ ] Test production builds on physical devices.
- [ ] Submit to App Store Connect / Play Console.
