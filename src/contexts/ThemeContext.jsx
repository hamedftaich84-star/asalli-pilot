import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("asalli-theme") || "light";
  });

  const [primaryHue, setPrimaryHue] = useState(() => {
    return localStorage.getItem("asalli-brand-hue") || "220";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("asalli-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary-hue", primaryHue);
    localStorage.setItem("asalli-brand-hue", primaryHue);
  }, [primaryHue]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const updateBrandColor = (hue) => {
    setPrimaryHue(hue.toString());
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        primaryHue,
        updateBrandColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
