import { createContext, useContext, useEffect, useState } from "react";
import { jsx as _jsx } from "react/jsx-runtime";
const ThemeContext = /*#__PURE__*/createContext({
  theme: "light",
  toggleTheme: () => {}
});
export function ThemeProvider({
  children
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("proconnect-theme") || "light";
    }
    return "light";
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("proconnect-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");
  return /*#__PURE__*/_jsx(ThemeContext.Provider, {
    value: {
      theme,
      toggleTheme
    },
    children: children
  });
}
export const useTheme = () => useContext(ThemeContext);