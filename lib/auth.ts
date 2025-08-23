import { getFirebaseAuth, getFirebaseConfig } from "./firebase"

export interface Teacher {
  id: string
  username: string
  email: string
}

const getFirebaseAuthOperations = async () => {
  try {
    const { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = await import("firebase/auth")
    return { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged }
  } catch {
    return null
  }
}

export const loginTeacher = async (email: string, password: string): Promise<Teacher> => {
  try {
    const auth = getFirebaseAuth()
    const isConfigured = getFirebaseConfig()
    
    if (isConfigured && auth) {
      const firebaseOps = await getFirebaseAuthOperations()
      if (firebaseOps) {
        const userCredential = await firebaseOps.signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        
        const teacher = {
          id: user.uid,
          username: user.displayName || email.split('@')[0],
          email: user.email!,
        }
        
        localStorage.setItem("currentTeacher", JSON.stringify(teacher))
        return teacher
      }
    }
  } catch (error) {
    console.log("Firebase auth error, using localStorage:", error)
  }

  // Fallback to localStorage
  const storedTeachers = localStorage.getItem("teachers")
  const teachers = storedTeachers ? JSON.parse(storedTeachers) : []
  const teacher = teachers.find((t: any) => t.email === email && t.password === password)

  if (!teacher) {
    throw new Error("Invalid email or password")
  }

  localStorage.setItem(
    "currentTeacher",
    JSON.stringify({
      id: teacher.id,
      username: teacher.username,
      email: teacher.email,
    }),
  )

  return {
    id: teacher.id,
    username: teacher.username,
    email: teacher.email,
  }
}

export const registerTeacher = async (email: string, password: string, username: string): Promise<Teacher> => {
  try {
    const auth = getFirebaseAuth()
    const isConfigured = getFirebaseConfig()
    
    if (isConfigured && auth) {
      const firebaseOps = await getFirebaseAuthOperations()
      if (firebaseOps) {
        const userCredential = await firebaseOps.createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        
        const teacher = {
          id: user.uid,
          username: username,
          email: user.email!,
        }
        
        localStorage.setItem("currentTeacher", JSON.stringify(teacher))
        return teacher
      }
    }
  } catch (error) {
    console.log("Firebase auth error, using localStorage:", error)
  }

  // Fallback to localStorage
  const storedTeachers = localStorage.getItem("teachers")
  const teachers = storedTeachers ? JSON.parse(storedTeachers) : []
  const existingTeacher = teachers.find((t: any) => t.email === email)
  
  if (existingTeacher) {
    throw new Error("Teacher with this email already exists")
  }

  const newTeacher = {
    id: Date.now().toString(),
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  teachers.push(newTeacher)
  localStorage.setItem("teachers", JSON.stringify(teachers))
  localStorage.setItem(
    "currentTeacher",
    JSON.stringify({
      id: newTeacher.id,
      username: newTeacher.username,
      email: newTeacher.email,
    }),
  )

  return {
    id: newTeacher.id,
    username: newTeacher.username,
    email: newTeacher.email,
  }
}

export const logoutTeacher = async () => {
  try {
    const auth = getFirebaseAuth()
    const isConfigured = getFirebaseConfig()
    
    if (isConfigured && auth) {
      const firebaseOps = await getFirebaseAuthOperations()
      if (firebaseOps) {
        await firebaseOps.signOut(auth)
      }
    }
  } catch (error) {
    console.log("Firebase signout error:", error)
  }
  
  localStorage.removeItem("currentTeacher")
}

export const getCurrentTeacher = (): Teacher | null => {
  const storedTeacher = localStorage.getItem("currentTeacher")
  return storedTeacher ? JSON.parse(storedTeacher) : null
}
