/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",   // if using /app router
        "./components/**/*.{js,jsx,ts,tsx}",
    ],

  


    theme: {
        screens: {
            xs: "560px",    // custom breakpoint
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
        extend: {},
    },
    plugins: [],
};