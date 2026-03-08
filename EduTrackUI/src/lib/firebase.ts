import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const isBrowser = typeof window !== 'undefined';

const isSecureOriginForPush = () => {
  if (!isBrowser) return false;
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  return window.isSecureContext || isLocalhost;
};

let messagingInstance: Messaging | null = null;
let hasCheckedMessagingSupport = false;
let messagingSupported = false;

const getMessagingIfSupported = async (): Promise<Messaging | null> => {
  if (!isBrowser) return null;

  if (!isSecureOriginForPush()) {
    console.warn('[FCM] Disabled: Firebase Messaging requires HTTPS (or localhost).');
    return null;
  }

  if (!hasCheckedMessagingSupport) {
    try {
      messagingSupported = await isSupported();
    } catch {
      messagingSupported = false;
    }
    hasCheckedMessagingSupport = true;
  }

  if (!messagingSupported) {
    console.warn('[FCM] Disabled: Browser does not support Firebase Messaging APIs.');
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }

  return messagingInstance;
};

// Request permission and get token
export const requestPermission = async () => {
  try {
    if (!isBrowser || !('Notification' in window)) {
      console.warn('[FCM] Notification API is not available in this environment.');
      return;
    }

    const messaging = await getMessagingIfSupported();
    if (!messaging) {
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn('[FCM] Missing VITE_FIREBASE_VAPID_KEY, skipping token request.');
        return;
      }

      const token = await getToken(messaging, {
        vapidKey,
      });
      if (token) {
        console.log('FCM Token:', token);
        // Send token to backend
        await registerFCMToken(token);
      } else {
        console.log('No registration token available.');
      }
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error getting permission or token:', error);
  }
};

// Register FCM token with backend
const registerFCMToken = async (token: string) => {
  try {
    const response = await fetch('/api/users/register-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth headers if needed
      },
      body: JSON.stringify({ token }),
    });
    if (response.ok) {
      console.log('FCM token registered successfully');
    } else {
      console.error('Failed to register FCM token');
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
};

// Handle incoming messages when app is in foreground (one-shot, kept for legacy use)
export const onMessageListener = () =>
  new Promise((resolve) => {
    void (async () => {
      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        resolve(null);
        return;
      }

      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        resolve(payload);
      });
    })();
  });

/**
 * Subscribe to foreground FCM messages persistently.
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 *
 * @param callback - called every time a foreground push arrives
 */
export const subscribeFCMMessages = (callback: (payload: any) => void) => {
  let unsubscribe = () => {};

  void (async () => {
    const messaging = await getMessagingIfSupported();
    if (!messaging) return;

    unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);
      callback(payload);
    });
  })();

  return () => {
    unsubscribe();
  };
};