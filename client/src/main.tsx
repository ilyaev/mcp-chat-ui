import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/common/ThemeProvider";

// Add global type for window.google
declare global {
  interface Window {
    google?: {
      accounts: {
        id?: {
          initialize: (options: unknown) => void;
          prompt: (callback: unknown) => void;
          renderButton: (element: HTMLElement | null, options: unknown) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
