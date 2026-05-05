## 2025-04-18 - Added Accessibility attributes to Header Icons\n**Learning:** The home dashboard `app/(tabs)/index.tsx` contained touchable icon elements (language toggle, guide) that completely lacked screen reader accessibility labels, hiding functionality from visually impaired users. In React Native apps, use `accessibilityRole="button"`, `accessibilityLabel`, and `accessibilityHint` instead of standard web ARIA attributes.\n**Action:** Remember to explicitly define React Native accessibility props on all icon-only `TouchableOpacity` or `Pressable` components, utilizing the existing i18n implementation (`useLanguage() -> t`) where appropriate to ensure translations are respected.

## 2026-04-19 - Adding accessibility attributes to Navigation Buttons

**Learning:** Icon-only navigation buttons in React Native must utilize explicit , , and props rather than standard web ARIA attributes. I added these across multiple screens (, , and ) along with corresponding i18n values.
**Action:** Verify that all icon-only buttons include comprehensive accessibility labels leveraging the application's translation functions.

## 2026-04-19 - Adding accessibility attributes to Navigation Buttons

**Learning:** Icon-only navigation buttons in React Native must utilize explicit `accessibilityRole="button"`, `accessibilityLabel`, and `accessibilityHint` props rather than standard web ARIA attributes. I added these across multiple screens (`history.tsx`, `guide.tsx`, and `task/[slot].tsx`) along with corresponding i18n values.
**Action:** Verify that all icon-only buttons include comprehensive accessibility labels leveraging the application's translation functions.

## 2026-04-19 - Adding accessibility attributes to TaskCards

**Learning:** React Native's `Pressable` components don't inherently convey their interactive state or purpose to screen readers. For dynamic components like `TaskCard`, it's critical to explicitly define `accessibilityRole="button"`, `accessibilityState={{ disabled: boolean }}`, and a comprehensive `accessibilityLabel` that combines all relevant visual information (e.g., label, time range, repetition count) into a single, localized string.
**Action:** When building interactive cards or lists, ensure all state variations (active, completed, locked) have appropriate `accessibilityRole`, `accessibilityState`, and descriptive `accessibilityLabel` props that utilize the app's `t()` translation function.

## 2026-04-29 - Adding accessibility attributes to Expandable Components

**Learning:** Screen readers cannot inherently determine if an expandable view (like an Accordion) is open or closed based purely on visual animations. It is crucial to utilize the `accessibilityState={{ expanded: boolean }}` prop on the wrapper `Pressable` or `TouchableOpacity` to explicitly announce the state toggle.
**Action:** Always include `accessibilityRole="button"`, `accessibilityLabel`, and `accessibilityState={{ expanded: boolean }}` on custom expandable UI components.

## 2025-05-19 - Adding accessibility attributes to Custom Achievement Badges and BottomSheet
**Learning:** Complex visual elements like achievement badges or overlay backdrops often combine distinct visual parts (e.g., emojis + text for locks, transparent backgrounds) that screen readers interpret confusingly or completely ignore.
**Action:** Always wrap complex non-interactive states (like a locked badge) in a container with `accessible={true}` and a descriptive `accessibilityLabel`, whilst setting decorative children to `importantForAccessibility="no"`. Additionally, transparent overlay `Pressable`s (like a bottom sheet backdrop) MUST include explicit `accessibilityRole="button"` and `accessibilityLabel` so visually impaired users know they can interact with the empty space to dismiss the view.

## 2025-05-19 - Adding accessibility attributes to TextInput Components

**Learning:** In React Native, screen readers often do not announce the `placeholder` prop sufficiently for `TextInput` components, which can leave visually impaired users without context on what to input.
**Action:** Always ensure `TextInput` components include an explicit `accessibilityLabel` prop, typically mirroring or elaborating on the placeholder text using the app's translation function `t()`, to provide clear guidance for screen reader users.
