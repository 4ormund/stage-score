/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
          './app/**/*.{js,ts,jsx,tsx,mdx}',
        ],
    theme: {
          extend: {
                  colors: {
                            'stage-purple': '#A18EFD',
                  },
          },
    },
    plugins: [],
}
