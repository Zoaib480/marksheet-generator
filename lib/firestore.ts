import { getFirebaseDb, getFirebaseConfig } from "./firebase"

export interface Student {
  id?: string
  name: string
  rollNo: string
  class: string
  teacherId: string
  createdAt: string
}

export interface Mark {
  id?: string
  studentId: string
  subject: string
  marks: number
  maxMarks: number
  teacherId: string
  createdAt: string
}

const STORAGE_KEYS = {
  students: "marksheet_students",
  marks: "marksheet_marks",
}

const getFromStorage = (key: string) => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(key) || "[]")
  } catch {
    return []
  }
}

const saveToStorage = (key: string, data: any[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

const getFirebaseOperations = async () => {
  try {
    const { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } = await import("firebase/firestore")
    return { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc }
  } catch {
    return null
  }
}

// Student operations
export const addStudent = async (student: Omit<Student, "id" | "createdAt">) => {
  try {
    const db = getFirebaseDb()
    const isConfigured = getFirebaseConfig()

    if (!isConfigured || !db) {
      const students = getFromStorage(STORAGE_KEYS.students)
      const newStudent = {
        ...student,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      students.push(newStudent)
      saveToStorage(STORAGE_KEYS.students, students)
      return newStudent.id
    }

    const firebaseOps = await getFirebaseOperations()
    if (!firebaseOps) {
      const students = getFromStorage(STORAGE_KEYS.students)
      const newStudent = {
        ...student,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      students.push(newStudent)
      saveToStorage(STORAGE_KEYS.students, students)
      return newStudent.id
    }

    const docRef = await firebaseOps.addDoc(firebaseOps.collection(db, "students"), {
      ...student,
      createdAt: new Date().toISOString(),
    })
    return docRef.id
  } catch (error) {
    console.log("[v0] Firebase error, using localStorage:", error)
    const students = getFromStorage(STORAGE_KEYS.students)
    const newStudent = {
      ...student,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    students.push(newStudent)
    saveToStorage(STORAGE_KEYS.students, students)
    return newStudent.id
  }
}

export const getStudentsByTeacher = async (teacherId: string): Promise<Student[]> => {
  try {
    const db = getFirebaseDb()
    const isConfigured = getFirebaseConfig()

    if (!isConfigured || !db) {
      const students = getFromStorage(STORAGE_KEYS.students)
      return students.filter((s: Student) => s.teacherId === teacherId)
    }

    const firebaseOps = await getFirebaseOperations()
    if (!firebaseOps) {
      const students = getFromStorage(STORAGE_KEYS.students)
      return students.filter((s: Student) => s.teacherId === teacherId)
    }

    const q = firebaseOps.query(firebaseOps.collection(db, "students"), firebaseOps.where("teacherId", "==", teacherId))
    const querySnapshot = await firebaseOps.getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Student)
  } catch (error) {
    console.log("[v0] Firebase error, using localStorage:", error)
    const students = getFromStorage(STORAGE_KEYS.students)
    return students.filter((s: Student) => s.teacherId === teacherId)
  }
}

export const updateStudent = async (studentId: string, data: Partial<Student>) => {
  const db = getFirebaseDb()
  const isConfigured = getFirebaseConfig()

  if (!isConfigured || !db) {
    const students = getFromStorage(STORAGE_KEYS.students)
    const index = students.findIndex((s: Student) => s.id === studentId)
    if (index !== -1) {
      students[index] = { ...students[index], ...data }
      saveToStorage(STORAGE_KEYS.students, students)
    }
    return
  }

  const firebaseOps = await getFirebaseOperations()
  if (!firebaseOps) {
    const students = getFromStorage(STORAGE_KEYS.students)
    const index = students.findIndex((s: Student) => s.id === studentId)
    if (index !== -1) {
      students[index] = { ...students[index], ...data }
      saveToStorage(STORAGE_KEYS.students, students)
    }
    return
  }

  await firebaseOps.updateDoc(firebaseOps.doc(db, "students", studentId), data)
}

export const deleteStudent = async (studentId: string) => {
  const db = getFirebaseDb()
  const isConfigured = getFirebaseConfig()

  if (!isConfigured || !db) {
    const students = getFromStorage(STORAGE_KEYS.students)
    const filtered = students.filter((s: Student) => s.id !== studentId)
    saveToStorage(STORAGE_KEYS.students, filtered)
    return
  }

  const firebaseOps = await getFirebaseOperations()
  if (!firebaseOps) {
    const students = getFromStorage(STORAGE_KEYS.students)
    const filtered = students.filter((s: Student) => s.id !== studentId)
    saveToStorage(STORAGE_KEYS.students, filtered)
    return
  }

  await firebaseOps.deleteDoc(firebaseOps.doc(db, "students", studentId))
}

// Marks operations
export const addMark = async (mark: Omit<Mark, "id" | "createdAt">) => {
  try {
    const db = getFirebaseDb()
    const isConfigured = getFirebaseConfig()

    if (!isConfigured || !db) {
      const marks = getFromStorage(STORAGE_KEYS.marks)
      const newMark = {
        ...mark,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      marks.push(newMark)
      saveToStorage(STORAGE_KEYS.marks, marks)
      return newMark.id
    }

    const firebaseOps = await getFirebaseOperations()
    if (!firebaseOps) {
      const marks = getFromStorage(STORAGE_KEYS.marks)
      const newMark = {
        ...mark,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      marks.push(newMark)
      saveToStorage(STORAGE_KEYS.marks, marks)
      return newMark.id
    }

    const docRef = await firebaseOps.addDoc(firebaseOps.collection(db, "marks"), {
      ...mark,
      createdAt: new Date().toISOString(),
    })
    return docRef.id
  } catch (error) {
    console.log("[v0] Firebase error, using localStorage:", error)
    const marks = getFromStorage(STORAGE_KEYS.marks)
    const newMark = {
      ...mark,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    marks.push(newMark)
    saveToStorage(STORAGE_KEYS.marks, marks)
    return newMark.id
  }
}

export const getMarksByStudent = async (studentId: string, teacherId: string): Promise<Mark[]> => {
  try {
    const db = getFirebaseDb()
    const isConfigured = getFirebaseConfig()

    if (!isConfigured || !db) {
      const marks = getFromStorage(STORAGE_KEYS.marks)
      return marks.filter((m: Mark) => m.studentId === studentId && m.teacherId === teacherId)
    }

    const firebaseOps = await getFirebaseOperations()
    if (!firebaseOps) {
      const marks = getFromStorage(STORAGE_KEYS.marks)
      return marks.filter((m: Mark) => m.studentId === studentId && m.teacherId === teacherId)
    }

    const q = firebaseOps.query(
      firebaseOps.collection(db, "marks"),
      firebaseOps.where("studentId", "==", studentId),
      firebaseOps.where("teacherId", "==", teacherId),
    )
    const querySnapshot = await firebaseOps.getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Mark)
  } catch (error) {
    console.log("[v0] Firebase error, using localStorage:", error)
    const marks = getFromStorage(STORAGE_KEYS.marks)
    return marks.filter((m: Mark) => m.studentId === studentId && m.teacherId === teacherId)
  }
}

export const updateMark = async (markId: string, data: Partial<Mark>) => {
  const db = getFirebaseDb()
  const isConfigured = getFirebaseConfig()

  if (!isConfigured || !db) {
    const marks = getFromStorage(STORAGE_KEYS.marks)
    const index = marks.findIndex((m: Mark) => m.id === markId)
    if (index !== -1) {
      marks[index] = { ...marks[index], ...data }
      saveToStorage(STORAGE_KEYS.marks, marks)
    }
    return
  }

  const firebaseOps = await getFirebaseOperations()
  if (!firebaseOps) {
    const marks = getFromStorage(STORAGE_KEYS.marks)
    const index = marks.findIndex((m: Mark) => m.id === markId)
    if (index !== -1) {
      marks[index] = { ...marks[index], ...data }
      saveToStorage(STORAGE_KEYS.marks, marks)
    }
    return
  }

  await firebaseOps.updateDoc(firebaseOps.doc(db, "marks", markId), data)
}

export const deleteMark = async (markId: string) => {
  const db = getFirebaseDb()
  const isConfigured = getFirebaseConfig()

  if (!isConfigured || !db) {
    const marks = getFromStorage(STORAGE_KEYS.marks)
    const filtered = marks.filter((m: Mark) => m.id !== markId)
    saveToStorage(STORAGE_KEYS.marks, filtered)
    return
  }

  const firebaseOps = await getFirebaseOperations()
  if (!firebaseOps) {
    const marks = getFromStorage(STORAGE_KEYS.marks)
    const filtered = marks.filter((m: Mark) => m.id !== markId)
    saveToStorage(STORAGE_KEYS.marks, filtered)
    return
  }

  await firebaseOps.deleteDoc(firebaseOps.doc(db, "marks", markId))
}