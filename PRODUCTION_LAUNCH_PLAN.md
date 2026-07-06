# MedTrack AI - Production Launch Plan

## 1. Infrastructure Readiness
### Database (Supabase)
- [ ] **Environment Promotion**: Migrate from staging to production project.
- [ ] **Migration Execution**: Run all SQL migrations (`supabase/migrations/*.sql`) on the production instance.
- [ ] **RLS Verification**: Audit Row Level Security policies to ensure strict data isolation.
- [ ] **Backup Strategy**: 
    - Enable daily automated backups via Supabase.
    - Schedule weekly manual snapshots for archival.
    - Verify Point-In-Time Recovery (PITR) configuration.

### API & Secrets
- [ ] **Environment Variables**: Configure `.env.production` on the build server.
- [ ] **Edge Function Secrets**: Set secrets for `OPENOCR_API_KEY`, `GROK_API_KEY`, and `OPENFDA_API_KEY` in Supabase Dashboard.

## 2. Operational Monitoring
### Error Tracking & Crash Reporting
- [ ] **Sentry Integration**: 
    - Install `@sentry/react-native`.
    - Initialize Sentry in `app/_layout.tsx`.
    - Replace `console.error` in `src/utils/logger.ts` with `Sentry.captureException()`.
- [ ] **Crashlytics**: Configure Firebase Crashlytics for Android/iOS native crash reporting.

### Analytics
- [ ] **Event Tracking**: 
    - Implement core funnel events: `onboarding_complete`, `prescription_scanned`, `dose_logged`.
    - Integrate a lightweight analytics provider (e.g., Mixpanel or Amplitude).

## 3. Deployment Pipeline
### Build Process
- [ ] **iOS Build**: Run `eas build --platform ios --profile production`.
- [ ] **Android Build**: Run `eas build --platform android --profile production`.
- [ ] **Artifact Testing**: Install production builds on physical devices to verify performance and stability.

### Store Submission
- [ ] **Metadata**: Upload descriptions and release notes from `STORE_ASSETS_RC1.md`.
- [ ] **Visuals**: Upload screenshots based on the `STORE_ASSETS_RC1.md` checklist.
- [ ] **Review**: Submit to App Store Connect and Google Play Console.

## 4. Post-Launch Validation
- [ ] **Smoke Test**: Perform a full end-to-end walk-through of the app on production.
- [ ] **Monitor Logs**: Watch Sentry and Supabase logs for the first 48 hours of launch.
- [ ] **User Feedback**: Establish a channel for early user reports.
