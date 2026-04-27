/**
 * Firebase Cloud Messaging (FCM) setup
 * Handles push notification permission and token storage
 */

import { fbSaveFCMToken } from './firebaseStore';
import { getFirebaseUser } from './auth';

/**
 * Request notification permission and get FCM token
 * Uses the Firebase Messaging SDK
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Dynamically import messaging to avoid issues in unsupported browsers
    const { getMessaging, getToken } = await import('firebase/messaging');
    const { app } = await import('./firebase');
    
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: '' // Add VAPID key if needed later
    });

    if (token) {
      const user = getFirebaseUser();
      if (user) {
        await fbSaveFCMToken(user.uid, token);
      }
      console.log('FCM Token:', token);
      return token;
    }

    return null;
  } catch (err) {
    console.error('FCM setup error:', err);
    return null;
  }
}

/**
 * Setup foreground message listener
 */
export async function setupForegroundMessaging(onMessage: (payload: any) => void): Promise<void> {
  try {
    const { getMessaging, onMessage: fbOnMessage } = await import('firebase/messaging');
    const { app } = await import('./firebase');
    
    const messaging = getMessaging(app);
    fbOnMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);
      onMessage(payload);
    });
  } catch (err) {
    console.error('Foreground messaging setup error:', err);
  }
}
