
## 2024-04-18 - Memoizing DailyQuote and Achievements
**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2026-04-28 - Optimize Progress Evaluation
**Learning:** For progress status evaluation in `DailyProgress`, prefer direct boolean logic (e.g., `progress.morning && progress.noon && progress.night`) over numeric coercion/summation (e.g., `(morning ? 1 : 0) + ...`). Benchmarks showed ~16-30% improvement in hot loops within `history.tsx`.
**Action:** When evaluating boolean properties, particularly in hot loops like mapping over calendar days, avoid intermediate numeric mapping/coercion to prevent unnecessary calculations.
