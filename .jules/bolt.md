
## 2024-04-18 - Memoizing DailyQuote and Achievements
**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2024-04-26 - Boolean Logic over Numeric Coercion
**Learning:** Checking the daily progress for three separate slots (`morning`, `noon`, `night`) using numeric coercion `(progress.morning ? 1 : 0) + ...` inside a component's hot loop causes a measurable performance drop in Javascript. Converting these exact conditions into short-circuited boolean checks (`progress.morning && progress.noon && progress.night`) offers a cleaner way to evaluate and improves hot loop runtime.
**Action:** When evaluating flags or combinations of simple boolean states in performance-critical loops (such as building calendar days), directly use boolean algebra rather than computing numerical totals.
