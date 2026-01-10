# Analytics Environment Variables

Copy relevant variables to your `.env.local` file to enable different analytics features.

## Firebase Analytics (Required - Already Configured)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Google Analytics (Optional)

Get your Measurement ID from [Google Analytics 4](https://analytics.google.com/)

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Custom Analytics Endpoint (Optional)

External endpoint for Web Vitals and custom metrics (your own analytics API or third-party service)

```bash
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://api.example.com/analytics
```

## Vercel Analytics (Optional)

Automatically enabled on Vercel deployments. No configuration needed.

## Sentry (Optional - Error Tracking)

Get your DSN from [Sentry.io](https://sentry.io/)

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## Feature Flags

```bash
# Enable/disable analytics in development
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Enable debug logging for analytics
NEXT_PUBLIC_ANALYTICS_DEBUG=false

# Sample rate for analytics (0.0 to 1.0)
# 1.0 = track all events, 0.5 = track 50% of events
NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE=1.0
```

## Google Site Verification

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```
