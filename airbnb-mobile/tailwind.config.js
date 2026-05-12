/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree-Regular"],
        figtree: ["Figtree-Regular"],
        "figtree-bold": ["Figtree-Bold"],
        "figtree-medium": ["Figtree-Medium"],
        "figtree-semibold": ["Figtree-SemiBold"],
        "figtree-light": ["Figtree-Light"],
      },
    },
  },
  plugins: [],
}
