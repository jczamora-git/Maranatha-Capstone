import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

// Request permission and get token
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
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

// Handle incoming messages when app is in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      resolve(payload);
    });
  });