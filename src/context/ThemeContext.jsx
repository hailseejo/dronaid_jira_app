import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Start with dark theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("dronaid-theme");

    return savedTheme || "dark";
  });

  // Apply theme whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("dronaid-theme", theme);
  }, [theme]);

  // Switch dark <-> light
  const toggleTheme = () => {
    setTheme((currentTheme) => {
      if (currentTheme === "dark") {
        return "light";
      }

      return "dark";
    });
  };

  // Directly change theme
  const changeTheme = (newTheme) => {
    if (newTheme === "dark" || newTheme === "light") {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        changeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using the theme
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}