1. **Optimize `canGoNext` and `handleNextMonth` in `app/(tabs)/history.tsx` to prevent unnecessary `Date` instantiations.**
   - By calculating `nextMonthKey` without using `new Date()` and `formatLocalDateKey`, we can significantly speed up the `canGoNext` check. This optimization addresses the hot path inside the React render cycle where `canGoNext` is evaluated on every re-render.
   - Example optimization:
     ```javascript
     const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
     const nextM = viewMonth === 11 ? '01' : String(viewMonth + 2).padStart(2, '0');
     const nextMonthKey = `${nextY}-${nextM}-01`;
     const canGoNext = nextMonthKey <= todayKey;
     ```

2. **Run tests & verification.**
   - Ensure the `bun test` passes.
   - `pre_commit_instructions` will be executed to make sure proper testing, verification, review, and reflection are done before committing.
