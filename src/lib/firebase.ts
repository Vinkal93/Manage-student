import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDLURuU1Y_HWNPv9moAzxsg1TzgFeUXM4A",
  authDomain: "student-manage-54e0f.firebaseapp.com",
  databaseURL: "https://student-manage-54e0f-default-rtdb.us-central1.firebasedatabase.app",
  projectId: "student-manage-54e0f",
  storageBucket: "student-manage-54e0f.firebasestorage.app",
  messagingSenderId: "779050157881",
  appId: "1:779050157881:web:e9aa91d6f8f4045f0c4ae8",
  measurementId: "G-PT38288SH7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const rtdb = getDatabase(app);

// Analytics (only in browser, not SSR)
let analytics: ReturnType<typeof getAnalytics> | null = null;
isAnalyticsSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, auth, rtdb, analytics };
export default app;
