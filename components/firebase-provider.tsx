"use client"

import { useEffect } from "react"
import { initializeFirebase } from "@/lib/firebase"

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const init = async () => {
      await initializeFirebase()
    }
    init()
  }, [])

  return <>{children}</>
}