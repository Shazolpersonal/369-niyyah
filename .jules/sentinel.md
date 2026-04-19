## 2024-05-24 - Fix Console Warnings Exposure
**Vulnerability:** Error messages were being logged using `console.warn` across various utility and component files (e.g. `AdBanner.tsx`, `useInterstitialAd.ts`, `notificationAnalytics.ts`, `backgroundTasks.ts`). In production, this can leak sensitive stack trace details or API error specifics.
**Learning:** React Native logging mechanisms like `console.warn` are visible in device logs (like logcat or Console.app) in production if not stripped or sanitized, which can inadvertently leak application structure or environment data.
**Prevention:** Always use the centralized `logger` utility (e.g., `logger.warn` or `logger.error`), which handles environment-specific logging (i.e. sanitization in production).
