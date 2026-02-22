/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        bengali: ['NotoSansBengali_400Regular'],
        'bengali-medium': ['NotoSansBengali_500Medium'],
        'bengali-semibold': ['NotoSansBengali_600SemiBold'],
        'bengali-bold': ['NotoSansBengali_700Bold'],
      },
      colors: {
        niyyah: {
          emerald: '#064E3B', // Deep Emerald
          emeraldDark: '#022C22', // Deeper shade for gradients
          gold: '#C4A35A',    // Crescent Gold
          goldLight: '#D4A847', // Rich Gold accent
          mosque: '#0D9488',  // Mosque Teal
          indigo: '#1E1B4B',  // Night Indigo
          dawn: '#FBC4AB',    // Dawn Rose
        }
      },
      boxShadow: {
        'soft': '0px 4px 20px 0px rgba(0, 0, 0, 0.05)',
        'glow': '0px 0px 20px 0px rgba(196, 163, 90, 0.3)',
        'float': '0px 10px 30px 0px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
