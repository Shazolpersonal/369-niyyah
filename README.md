# 🌙 369 Niyyah (৩৬৯ নিয়্যাহ)

<div align="center">
  <img src="assets/splash-icon.png" alt="369 Niyyah Logo" width="150" height="150" />

  ### *Set your intentions. Write them down. Reflect on your life.*
  ### *নিয়ত করুন। লিখুন। জীবনে প্রতিফলিত করুন।*

  [![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## 📖 Overview | পরিচিতি

**369 Niyyah** is a beautifully crafted, bilingual (English & Bengali) mobile application built with React Native and Expo. It uniquely combines the popular **369 manifestation method** with the Islamic concept of **Niyyah (Intention)**.

The app guides users to write down their core intentions (Niyyah) consistently throughout the day to build spiritual and mental focus:
- **☀️ Morning:** 3 times
- **🌤️ Afternoon:** 6 times
- **🌙 Night:** 9 times

This 369-day journey helps users stay mindful, build strong habits, and track their spiritual growth.

---

## ✨ Features | বৈশিষ্ট্যসমূহ

- **🤲 The 369 Method:** Structured daily tasks divided into Morning, Afternoon, and Night slots.
- **🌍 Bilingual Support:** Seamlessly switch between English and Bengali (`i18n` integration).
- **📊 Progress Tracking:** Visual journey progress rings, daily streaks, and achievement badges.
- **📜 Daily Quotes:** Inspiring Islamic quotes (Quranic verses and Hadiths) to keep you motivated.
- **🔔 Smart Notifications:** Local reminders perfectly timed for your daily slots.
- **🎨 Beautiful UI & Animations:** Crafted with `NativeWind` (Tailwind CSS) and fluid animations using `react-native-reanimated`.
- **🌙 Offline First:** All your data stays securely on your device using `AsyncStorage`.
- **💰 Monetization Ready:** Integrated with Google AdMob for banner ads.

---

## 🛠️ Tech Stack | প্রযুক্তি

- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & Expo Haptics
- **Storage:** `@react-native-async-storage/async-storage`
- **Fonts:** Expo Google Fonts (Inter & Noto Sans Bengali)
- **Icons:** [Lucide React Native](https://lucide.dev/)

---

## 🚀 Getting Started | শুরু করার নিয়ম

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Bun](https://bun.sh/) installed. You will also need the [Expo Go](https://expo.dev/client) app on your phone or a configured simulator/emulator.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shazolpersonal/369-niyyah.git
   cd 369-niyyah
   ```

2. **Install dependencies:**
   *(The project uses Bun as its package manager)*
   ```bash
   bun install
   ```

3. **Start the Expo development server:**
   ```bash
   bun run start
   ```

4. **Run the app:**
   - Scan the QR code in your terminal using the Expo Go app.
   - Or press `a` to open on an Android emulator.
   - Or press `i` to open on an iOS simulator.

---

## 📁 Project Structure | ফাইলের কাঠামো

```text
369-niyyah/
├── app/                  # Expo Router navigation and screens
│   ├── (tabs)/           # Bottom tab navigation (Dashboard, History)
│   ├── _layout.tsx       # Root layout and context providers
│   └── ...
├── components/           # Reusable UI components (TaskCard, DailyQuote, etc.)
├── contexts/             # React Contexts (Language, Progress)
├── data/                 # Static data (Quotes list)
├── i18n/                 # Translation files (en.ts, bn.ts)
├── types/                # TypeScript type definitions
├── utils/                # Helper functions (time slots, animations, theme)
└── assets/               # Images, fonts, and icons
```

---

## 🤝 Contributing | অবদান

Contributions, issues, and feature requests are welcome!
If you want to improve the app, please feel free to fork the repository, make your changes, and submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License | লাইসেন্স

This project is licensed under the MIT License.
