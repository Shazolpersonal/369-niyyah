1. **Refactor `getValidationInfo` to avoid array spread operations.**
   - Change `[...normalizedInput]` and `[...normalizedTarget]` to use native string methods (e.g. `startsWith()`) and `while`/`for` loops checking `charCodeAt()` to avoid O(N) array allocation, correctly skipping surrogate pairs for emojis.

2. **Refactor `getHighlightSegments` to avoid array spread operations.**
   - Similarly, avoid spreading the strings into arrays (`[...normalizedInput]`, etc.). Traverse both input and target strings by code point using `charCodeAt()`, keeping track of string indices so we can accurately `substring()` the final display string based on matched code points. This eliminates array allocations in the hot typing loop.

3. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run lints, types, and the test suite (`bun test`).

4. **Add journal entry.**
   - Add a journal entry to `.jules/bolt.md` reflecting on the optimization: avoiding `[...str]` spread allocations for string iterations and using native string loops correctly.

5. **Submit.**
   - Commit and submit changes with PR formatted for Bolt.
