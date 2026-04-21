
## 2024-04-18 - Memoizing DailyQuote and Achievements
**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2026-04-21 - Memoizing Dashboard Callbacks and JourneyProgressRing
**Learning:** The `Dashboard` component triggers frequent re-renders due to `useProgress` updates and timer-based local states. The `TaskCard` components were memoized with `React.memo`, but they were still re-rendering because their `onPress` prop (`handleTaskPress`) was re-created on every render. Similarly, `JourneyProgressRing` was unnecessarily re-rendering on `Dashboard` updates.
**Action:** Always memoize callback functions (with `useCallback`) passed to memoized child components, and ensure display components without complex state like `JourneyProgressRing` are wrapped in `React.memo()` to preserve rendering efficiency.
