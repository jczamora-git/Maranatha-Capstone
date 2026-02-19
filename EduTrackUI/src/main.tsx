import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Firebase and register service worker
import { requestPermission } from "./lib/firebase";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}

// Request FCM permission on app load (you can move this to a specific component if needed)
requestPermission();

createRoot(document.getElementById("root")!).render(<App />);
