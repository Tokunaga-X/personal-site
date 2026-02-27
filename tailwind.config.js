/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      body: ["Poppins", "sans-serif"],
      special: ["Mulish", "sans-serif"],
    },
    extend: {
      colors: {
        "grey-bg": "#f9f9f9",
        "font-blue": "#147efb",
      },
      keyframes: {
        morph: {
          "0%": {
            borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%",
          },
          "50%": {
            borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%",
          },
          "100%": {
            borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%",
          },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(40deg)" },
        },
      },
      animation: {
        morph: "morph 8s ease-in-out infinite",
        wiggle: "wiggle 2s ease-in-out infinite",
        "spin-slow": "spin 10s linear infinite",
      },
    },
  },
  plugins: [],
};
