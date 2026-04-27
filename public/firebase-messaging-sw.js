// Firebase Cloud Messaging Service Worker
// Handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDLURuU1Y_HWNPv9moAzxsg1TzgFeUXM4A",
  authDomain: "student-manage-54e0f.firebaseapp.com",
  projectId: "student-manage-54e0f",
  storageBucket: "student-manage-54e0f.firebasestorage.app",
  messagingSenderId: "779050157881",
  appId: "1:779050157881:web:e9aa91d6f8f4045f0c4ae8",
  measurementId: "G-PT38288SH7"
});

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
