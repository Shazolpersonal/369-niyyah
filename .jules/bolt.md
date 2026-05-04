## 2024-04-18 - Memoizing DailyQuote and Achievements

**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2024-04-29 - Boolean Logic vs Numeric Coercion in Hot Loops

**Learning:** In the `history.tsx` file, progress evaluation in hot loops (e.g. iterating over calendar days) used numeric coercion `(cond ? 1 : 0) + ...`. Testing indicated that using direct boolean logic `cond1 && cond2 && cond3` instead of numeric summation improves performance for this specific evaluation.
**Action:** When evaluating multiple conditions in loops, avoid unnecessary numeric coercion and summation if simple boolean operators can achieve the same check faster.

## 2024-04-30 - Lexicographical Date String Comparisons in Hot Loops

**Learning:** Instantiating `Date` objects in hot loops (e.g., iterating through calendar days) or using newly instantiated `Date` objects in `useMemo` dependency arrays breaks memoization and adds garbage collection overhead. React's strict equality checks will always fail for new object instances, causing unnecessary re-renders.
**Action:** When comparing dates in hot loops or hooks, prefer using primitive string keys (`YYYY-MM-DD`) and performing lexicographical string comparisons (e.g., `dateKey > todayKey`) instead of heavy object-based checks. This reduces garbage collection overhead and render times, and is safe because ISO 8601-like date strings compare correctly lexicographically.

## 2024-05-15 - Optimizing Dictionary Iteration in Progress Evaluation

**Learning:** Using `Object.keys()` and `Object.values().some()` on the large `dailyProgress` dictionary in `utils/achievements.ts` caused multiple full iterations and unnecessary array allocations. Benchmarks showed that replacing these with a single `for...in` loop that evaluates all conditions and breaks early can improve performance by ~9-30% depending on the data size and early return hit rate.
**Action:** To optimize performance when evaluating multiple boolean flags across a dictionary (e.g., dailyProgress), use a single `for...in` loop with early `break` conditions instead of multiple `Object.keys()` and `Object.values().some()` calls to avoid unnecessary array allocations.
