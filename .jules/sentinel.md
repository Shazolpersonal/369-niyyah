## 2024-05-24 - Fix Console Warnings Exposure
**Vulnerability:** Error messages were being logged using `console.warn` across various utility and component files (e.g. `AdBanner.tsx`, `useInterstitialAd.ts`, `notificationAnalytics.ts`, `backgroundTasks.ts`). In production, this can leak sensitive stack trace details or API error specifics.
**Learning:** React Native logging mechanisms like `console.warn` are visible in device logs (like logcat or Console.app) in production if not stripped or sanitized, which can inadvertently leak application structure or environment data.
**Prevention:** Always use the centralized `logger` utility (e.g., `logger.warn` or `logger.error`), which handles environment-specific logging (i.e. sanitization in production).
## 2025-02-21 - [DoS Risk Mitigation in TextInput]
**Vulnerability:** The primary `TextInput` component used for affirmations lacked an explicit length limit (`maxLength`).
**Learning:** This exposes the application to a potential Denial of Service (DoS) vector where users could paste excessively large strings (megabytes of text), causing the React Native validation loop, text comparison logic (`getValidationInfo`, `getHighlightSegments`), and rendering to consume excessive CPU and memory, potentially freezing or crashing the device.
**Prevention:** Always enforce reasonable bounds on user input using the `maxLength` prop on all `TextInput` components, particularly those triggering complex operations on every keystroke.
## 2025-02-21 - Insecure Random Number Generator Fallback
**Vulnerability:** The `secureRandom` utility in `utils/crypto.ts` silently fell back to `Math.random()` if the Web Crypto API was unavailable. `Math.random()` is not cryptographically secure and can be easily predicted, compromising any security mechanisms relying on this randomness.
**Learning:** Silently degrading security features (like CSPRNG) to insecure alternatives is a critical anti-pattern. Systems should "fail securely" rather than continue operating in an insecure state without warning.
**Prevention:** Remove fallback mechanisms for critical security functions. Explicitly throw an error if secure dependencies (like `crypto.getRandomValues`) are unavailable, forcing the environment to be configured correctly rather than silently failing open.
## 2025-05-19 - Missing HTTP Security Headers for Web Artifacts
**Vulnerability:** The static `privacy-policy.html` served via Vercel lacked basic HTTP security headers like `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and `Referrer-Policy`.
**Learning:** Even static HTML pages on domains associated with a mobile application can be targets for attacks like clickjacking or MIME sniffing if appropriate headers are missing, and missing them violates defense-in-depth principles.
**Prevention:** Always ensure hosting configurations (like `vercel.json` or `netlify.toml`) enforce standard HTTP security headers for all web routes, even if the application is predominantly a mobile app offline client.
## 2024-07-04 - Fix Push Notification Payload Validation
**Vulnerability:** The push notification interaction handler blindly processed `data.slot` from the notification payload (`response.notification.request.content.data.slot`) and passed it directly to `recordNotificationInteraction` without validating it against the expected `TimeSlot` type.
**Learning:** Push notification payload data is untrusted external input. Even if the application logic generates the notifications locally, relying on the OS to pass the payload back without validation breaks the principle of least privilege and trust boundaries. A malicious or malformed payload could cause unexpected application states, errors, or trigger logic bypasses.
**Prevention:** Always explicitly validate data extracted from push notification payloads (e.g., using allowlists or schema validation) before processing it in internal application logic.
