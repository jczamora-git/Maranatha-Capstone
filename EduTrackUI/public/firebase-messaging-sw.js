importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBqzSYcI1o4KBP-HP0d00ytunedAZtdOIM",
  authDomain: "marantha-tokens.firebaseapp.com",
  projectId: "marantha-tokens",
  storageBucket: "marantha-tokens.firebasestorage.app",
  messagingSenderId: "698012186285",
  appId: "1:698012186285:web:8088d5d54e561d90397824"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', // Update with your icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});