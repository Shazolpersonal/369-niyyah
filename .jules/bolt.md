
## 2024-04-18 - Memoizing DailyQuote and Achievements
**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2024-04-25 - Boolean Logic in Hot Loops
**Learning:** For progress status evaluation, using direct boolean logic (e.g., `progress.morning && progress.noon && progress.night`) performs significantly better (~16-30% improvement) in hot loops than numeric coercion/summation (e.g., `(progress.morning ? 1 : 0) + ...`).
**Action:** Always prefer direct boolean evaluation over numeric coercion when checking multi-state completeness, especially inside frequent loops like calendar rendering or stats calculation.
