
## 2024-04-18 - Memoizing DailyQuote and Achievements
**Learning:** `DailyQuote` component was re-rendering unnecessarily when its parent `Dashboard` re-rendered. Since its only true dependency is the `language` context, it is a prime candidate for `React.memo`. Similarly, `Achievements.tsx` was recalculating the badges array on every render using `getAchievements`. Since `getAchievements` processes the entire `dailyProgress` dictionary, it's an expensive operation that should be memoized using `useMemo`.
**Action:** When working with list rendering or standalone display components that rely on context or static props, evaluate the cost of re-rendering. Use `React.memo` for components and `useMemo` for expensive array/object generation to avoid unnecessary processing.

## 2024-04-29 - Boolean Logic vs Numeric Coercion in Hot Loops
**Learning:** In the `history.tsx` file, progress evaluation in hot loops (e.g. iterating over calendar days) used numeric coercion `(cond ? 1 : 0) + ...`. Testing indicated that using direct boolean logic `cond1 && cond2 && cond3` instead of numeric summation improves performance for this specific evaluation.
**Action:** When evaluating multiple conditions in loops, avoid unnecessary numeric coercion and summation if simple boolean operators can achieve the same check faster.

## 2024-04-30 - Lexicographical Date String Comparisons in Hot Loops
**Learning:** Instantiating `Date` objects in hot loops (e.g., iterating through calendar days) or using newly instantiated `Date` objects in `useMemo` dependency arrays breaks memoization and adds garbage collection overhead. React's strict equality checks will always fail for new object instances, causing unnecessary re-renders.
**Action:** When comparing dates in hot loops or hooks, prefer using primitive string keys (`YYYY-MM-DD`) and performing lexicographical string comparisons (e.g., `dateKey > todayKey`) instead of heavy object-based checks. This reduces garbage collection overhead and render times, and is safe because ISO 8601-like date strings compare correctly lexicographically.
## 2024-05-18 - Avoid Multiple Dictionary Iterations
**Learning:** Checking multiple boolean conditions across a dictionary values array by calling `Object.keys()` followed by multiple `Object.values().some()` array allocations creates significant memory and CPU overhead.
**Action:** Always combine dictionary traversal into a single `for...in` loop with early breaks when evaluating aggregate boolean states to prevent array allocations and early-exit when all states are met.
## 2024-06-25 - Avoid Intermediate Date Objects in Calendar Loops\n**Learning:** When generating a sequence of dates for a calendar grid, calling `new Date()` and date formatting functions 31 times per render cycle adds unnecessary overhead. Since the year and month are fixed, and the loop index `d` perfectly represents the day, string manipulation is faster and allocation-free.\n**Action:** When generating sequences of dates within a single month, manually construct padded date strings (e.g., `${viewYear}-${monthStr}-${dayStr}`) using known numeric components instead of instantiating `Date` objects for each cell.
## 2024-06-26 - Inline Boolean Short-Circuiting in Hot Loops
**Learning:** In hot loops, evaluating multiple logical conditions and storing them in intermediate variables (e.g., `const allCompleted = a && b && c; const anyCompleted = a || b || c;`) causes all conditions to be evaluated eagerly on every iteration.
**Action:** Use inline boolean short-circuiting (`if (a && b && c) else if (a || b || c)`) rather than eagerly evaluating all boolean conditions into intermediate variables to save redundant operations.
## 2024-06-27 - Avoid Intermediate Date Objects in State Handlers
**Learning:** Instantiating `new Date()` objects within render cycles and event handlers to calculate next/previous calendar boundaries is computationally expensive when string manipulation is available. The `canGoNext` property was unnecessarily instantiating a Date object on every render.
**Action:** When calculating simple calendar offsets (like next month), use primitive integer arithmetic and string padding (`String(val).padStart()`) to construct formatted date strings directly, avoiding garbage collection overhead and deep Date object parsing in React hot paths.
## 2024-07-15 - Cache Repeated Date Instantiations in Render Cycle
**Learning:** Calling functions that instantiate `new Date()` (like `isSlotActive()`) multiple times inline within a React render cycle (e.g., as props to multiple child components) causes unnecessary garbage collection overhead and redundant evaluations.
**Action:** Cache the result of expensive repeated function calls in a local variable at the top of the component render cycle (e.g., `const currentSlot = getCurrentSlot();`) and reference that cached value instead of calling the function multiple times inline.
