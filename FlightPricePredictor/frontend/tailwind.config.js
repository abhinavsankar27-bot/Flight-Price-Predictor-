module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 1s ease-in-out",
        fadeInSlow: "fadeIn 2s ease-in-out",
        float: "float 3s infinite ease-in-out",
        slideUp: "slideUp 0.5s ease-out",
        zoomIn: "zoomIn 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        zoomIn: { "0%": { transform: "scale(0.8)" }, "100%": { transform: "scale(1)" } },
        float: {
          "0%, 100%": { transform: "translateY(-5px)" },
          "50%": { transform: "translateY(5px)" }
        }
      }
    }
  }
}
