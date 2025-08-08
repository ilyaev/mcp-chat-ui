import React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

function getDefaultDarkMode() {
  const hour = new Date().getHours();
  return false;
  return hour >= 19 || hour < 7;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [dark] = React.useState(() => getDefaultDarkMode());

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return children;
}
