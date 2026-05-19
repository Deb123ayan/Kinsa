import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mobile app initialization
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Initialize mobile plugins
if (Capacitor.isNativePlatform()) {
  // Set status bar style
  StatusBar.setStyle({ style: Style.Default });
  
  // Hide splash screen after app loads
  SplashScreen.hide();
}

// Disable browser zooming actions (pinch-to-zoom on iOS/Android & Ctrl shortcuts on Desktop)
if (typeof window !== "undefined") {
  document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
  });

  document.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && (e.key === "=" || e.key === "-" || e.key === "+" || e.key === "0")) {
      e.preventDefault();
    }
  });

  document.addEventListener("wheel", (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
}

createRoot(document.getElementById("root")!).render(<App />);
