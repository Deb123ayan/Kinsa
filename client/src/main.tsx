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

createRoot(document.getElementById("root")!).render(<App />);
