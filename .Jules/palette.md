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

## 2025-05-19 - Adding accessibility attributes to TextInput
**Learning:** In React Native, `TextInput` components often lack sufficient context for screen readers when relying solely on the `placeholder` prop. A placeholder may not always be read correctly or sufficiently describe the field's purpose or expected input format.
**Action:** Always ensure `TextInput` components include an explicit `accessibilityLabel` that leverages the application's translation functions to accurately describe the field to visually impaired users.

## 2025-05-19 - Adding accessibility attributes to Navigation Buttons and Input Components
**Learning:** In React Native, `Pressable` components with complex child views (like `LinearGradient` combined with `Text`) often fail to be grouped properly by screen readers, leading to confusing or incomplete announcements. They must be explicitly marked with `accessibilityRole="button"` and a clear `accessibilityLabel`. Additionally, ensuring input components don't have duplicated or overridden accessibility props is essential for accurate descriptions.
**Action:** Always include `accessibilityRole="button"` and a corresponding translation-powered `accessibilityLabel` on interactive wrapper elements like `Pressable`. Double-check component props for accidental duplications that might mask accessibility labels.

## 2026-05-20 - Fix Duplicate Screen Reader Announcements on Interactive Cards
**Learning:** When conditionally rendering a React Native `Pressable` (where it acts as a button when active, and a generic `View` when inactive), screen readers may announce the content twice if both the inner `View` and outer `Pressable` try to manage the accessible state simultaneously, or if inner `Text` nodes are not explicitly hidden.
**Action:** Always conditionally attach the `accessibilityRole` and `accessibilityLabel` exclusively to the outermost active element (e.g., `Pressable` if `onPress` exists, otherwise the container `View`). Crucially, apply `importantForAccessibility="no"` to any child `Text` nodes to prevent screen readers from redundantly reading the text after already reading the custom `accessibilityLabel` from the parent.

## 2026-05-20 - Adding accessibility attributes to Crash/Error Boundaries
**Learning:** During critical error states (handled by `ErrorBoundary.tsx`), it's essential that the recovery UI is fully accessible so screen reader users can navigate out of the crash state. The `TouchableOpacity` buttons for "Retry" and "Factory Reset" lacked explicit `accessibilityRole` and `accessibilityLabel` properties, making recovery unintuitive.
**Action:** When building fallback UIs or error boundaries, explicitly set `accessibilityRole="button"` and `accessibilityLabel` (using translated or clear descriptive strings) on all recovery action components.
## 2024-05-24 - Explicit Disabled State for Calendar Navigation
**Learning:** Screen readers (VoiceOver/TalkBack) do not always infer a "disabled" state solely from the `disabled={boolean}` prop on a React Native `TouchableOpacity` if `accessibilityState` is not explicitly set.
**Action:** When functionally disabling an interactive element, always combine the `disabled` prop with `accessibilityState={{ disabled: boolean }}` to guarantee the disabled status is explicitly announced to visually impaired users.
