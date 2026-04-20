
## 2024-04-18 - Memoizing DailyQuote and Achievements
**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2026-04-20 - Avoiding Date object instantiations in render loops
**Learning:** Instantiating new \`Date\` objects within tight iteration loops inside \`useMemo\` or render methods (like calculating stats for all days in a month) creates significant performance overhead due to high memory allocation and garbage collection.
**Action:** When doing calendar/time calculations in loops, compute a timestamp once outside the loop (using \`.getTime()\`) and compare it using direct arithmetic against simple timestamp calculations instead of allocating new \`Date\` objects in every iteration.
