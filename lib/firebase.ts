let firebaseApp = null
let db = null
let auth = null
let isConfigured = false

export async function initializeFirebase() {
  if (typeof window === "undefined") {
    return { db: null, auth: null, isConfigured: false }
  }

  if (firebaseApp) {
    return { db, auth, isConfigured }
  }

  try {
    // Check if all required environment variables are present
    const requiredEnvVars = [
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ]

    if (requiredEnvVars.some(envVar => !envVar)) {
      console.log("Firebase environment variables missing, using localStorage")
      isConfigured = false
      db = null
      auth = null
      return { db, auth, isConfigured }
    }

    const { initializeApp } = await import("firebase/app")
    const { getFirestore } = await import("firebase/firestore")
    const { getAuth } = await import("firebase/auth")

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
    console.log("Firebase initialization failed, using localStorage:", error)
    isConfigured = false
    db = null
    auth = null
  }

  return { db, auth, isConfigured }
}

export async function getFirebaseDb() {
  const { db } = await initializeFirebase()
  return db
}

export async function getFirebaseAuth() {
  const { auth } = await initializeFirebase()
  return auth
}

export async function getFirebaseConfig() {
  const { isConfigured } = await initializeFirebase()
  return isConfigured
}
