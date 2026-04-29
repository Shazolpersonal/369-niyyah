
## 2024-04-18 - Memoizing DailyQuote and Achievements
**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2024-04-29 - Boolean Logic vs Numeric Coercion in Hot Loops
**Learning:** In the `history.tsx` file, progress evaluation in hot loops (e.g. iterating over calendar days) used numeric coercion `(cond ? 1 : 0) + ...`. Testing indicated that using direct boolean logic `cond1 && cond2 && cond3` instead of numeric summation improves performance for this specific evaluation.
**Action:** When evaluating multiple conditions in loops, avoid unnecessary numeric coercion and summation if simple boolean operators can achieve the same check faster.
