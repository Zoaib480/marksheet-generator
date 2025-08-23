let firebaseApp = null
let db = null
let auth = null
let isConfigured = false

export function initializeFirebase() {
  if (typeof window === "undefined") {
    return { db: null, auth: null, isConfigured: false }
  }

  if (firebaseApp) {
    return { db, auth, isConfigured }
  }

  try {
    const { initializeApp } = require("firebase/app")
    const { getFirestore } = require("firebase/firestore")
    const { getAuth } = require("firebase/auth")

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    firebaseApp = initializeApp(firebaseConfig)
    db = getFirestore(firebaseApp)
    auth = getAuth(firebaseApp)
    isConfigured = true
  } catch (error) {
    console.log("Firebase initialization failed:", error)
    isConfigured = false
    db = null
    auth = null
  }

  return { db, auth, isConfigured }
}

export function getFirebaseDb() {
  const { db } = initializeFirebase()
  return db
}

export function getFirebaseAuth() {
  const { auth } = initializeFirebase()
  return auth
}

export function getFirebaseConfig() {
  const { isConfigured } = initializeFirebase()
  return isConfigured
}
