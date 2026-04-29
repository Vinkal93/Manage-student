import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// Import Firebase to ensure it initializes on app load
import './lib/firebase';

// Import and run initial sync (localStorage → Firebase migration)
import { fbInitialSync } from './lib/firebaseStore';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Run initial sync once authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    fbInitialSync().then(() => {
      console.log('🔥 Firebase initial sync complete');
    });
  }
});

// Register FCM service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => console.log('FCM SW registered:', reg.scope))
    .catch(err => console.warn('FCM SW registration failed:', err));
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
