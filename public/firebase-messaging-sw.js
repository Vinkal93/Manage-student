// Firebase Cloud Messaging Service Worker
// Handles background push notifications
//
// NOTE: Service workers cannot access import.meta.env.
// The config is injected at build time by Vite's `define` or via the
// main app's `navigator.serviceWorker.controller.postMessage()`.
// For simplicity, this SW reads its config from a global that the
// main thread sets before registration via a generated config script.

// The main app injects firebase-config.js into /public at build time.
// Fallback: if firebaseConfig is not set, SW will log a warning.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Config will be injected by the build process (see vite.config.ts)
// eslint-disable-next-line no-restricted-globals
let swConfig = null;

// Listen for config from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    swConfig = event.data.config;
    initFirebase(swConfig);
  }
});

function initFirebase(config) {
  if (firebase.apps.length) return; // already initialized
  firebase.initializeApp(config);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);
    const notificationTitle = payload.notification?.title || 'InSuite Manage';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: payload.data,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
