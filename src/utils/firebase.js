import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, onMessage, getToken } from 'firebase/messaging'

const mask = (s) => (typeof s === 'string' && s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Diagnostics: confirm envs are loaded (masked)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('Firebase config (masked)', {
    apiKey: mask(firebaseConfig.apiKey),
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: mask(firebaseConfig.appId),
  })
}

// Basic validation to surface misconfig early
['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'].forEach((k) => {
  if (!firebaseConfig[k]) {
    // eslint-disable-next-line no-console
    console.error(`Missing Firebase config: ${k} (check .env values with VITE_ prefix)`) // visible in console
  }
})

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

let messaging
try {
  messaging = getMessaging(app)
} catch (e) {
  messaging = null
}

export { messaging, onMessage, getToken }


