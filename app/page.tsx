"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, FileText, Download, Plus, Trash2, LogOut, Users, BarChart3, Home } from "lucide-react"
import LoginForm from "@/components/login-form"
import { type Teacher, logoutTeacher } from "@/lib/auth"
import {
  type Student,
  type Mark,
  addStudent,
  getStudentsByTeacher,
  addMark,
  getMarksByStudent,
  updateMark,
  deleteMark,
} from "@/lib/firestore"

interface Subject {
  name: string
  marks: number
  maxMarks: number
}

interface StudentData {
  name: string
  rollNo: string
  class: string
  subjects: Subject[]
}

type ViewState = "dashboard" | "create-marksheet" | "view-marksheet"

export default function MarksheetGenerator() {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [existingMarks, setExistingMarks] = useState<Mark[]>([])
  const [currentView, setCurrentView] = useState<ViewState>("dashboard")
  const [studentData, setStudentData] = useState<StudentData>({
    name: "",
    rollNo: "",
    class: "",
    subjects: [
      { name: "Mathematics", marks: 0, maxMarks: 100 },
      { name: "Science", marks: 0, maxMarks: 100 },
      { name: "English", marks: 0, maxMarks: 100 },
    ],
  })
  const [showMarksheet, setShowMarksheet] = useState(false)
  const [isNewStudent, setIsNewStudent] = useState(true)

  useEffect(() => {
    if (teacher) {
      loadStudents()
    }
  }, [teacher])

  const loadStudents = async () => {
    if (!teacher) return
    try {
      const teacherStudents = await getStudentsByTeacher(teacher.id)
      setStudents(teacherStudents)
    } catch (error) {
      console.error("Error loading students:", error)
    }
  }

  const handleLogin = (loggedInTeacher: Teacher) => {
    setTeacher(loggedInTeacher)
    setCurrentView("dashboard")
  }

  const handleLogout = async () => {
    try {
      await logoutTeacher()
      setTeacher(null)
      setStudents([])
      setSelectedStudent(null)
      setShowMarksheet(false)
      setCurrentView("dashboard")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const navigateToCreateMarksheet = () => {
    setCurrentView("create-marksheet")
    setIsNewStudent(true)
    setSelectedStudent(null)
    setExistingMarks([])
    setStudentData({
      name: "",
      rollNo: "",
      class: "",
      subjects: [
        { name: "Mathematics", marks: 0, maxMarks: 100 },
        { name: "Science", marks: 0, maxMarks: 100 },
        { name: "English", marks: 0, maxMarks: 100 },
      ],
    })
  }

  const navigateToDashboard = () => {
    setCurrentView("dashboard")
    setShowMarksheet(false)
  }

  const handleStudentSelect = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (!student || !teacher) return

    setSelectedStudent(student)
    setIsNewStudent(false)

    // Load existing marks for this student
    try {
      const marks = await getMarksByStudent(student.id!, teacher.id)
      setExistingMarks(marks)

      const subjects = marks.map((mark) => ({
        name: mark.subject,
        marks: mark.marks,
        maxMarks: mark.maxMarks,
      }))

      setStudentData({
        name: student.name,
        rollNo: student.rollNo,
        class: student.class,
        subjects:
          subjects.length > 0
            ? subjects
            : [
                { name: "Mathematics", marks: 0, maxMarks: 100 },
                { name: "Science", marks: 0, maxMarks: 100 },
                { name: "English", marks: 0, maxMarks: 100 },
              ],
      })
    } catch (error) {
      console.error("Error loading marks:", error)
    }
  }

  const viewStudentMarksheet = async (student: Student) => {
    if (!teacher) return

    try {
      const marks = await getMarksByStudent(student.id!, teacher.id)
      setExistingMarks(marks)

      const subjects = marks.map((mark) => ({
        name: mark.subject,
        marks: mark.marks,
        maxMarks: mark.maxMarks,
      }))

      setStudentData({
        name: student.name,
        rollNo: student.rollNo,
        class: student.class,
        subjects: subjects.length > 0 ? subjects : [],
      })

      setSelectedStudent(student)
      setShowMarksheet(true)
      setCurrentView("view-marksheet")
    } catch (error) {
      console.error("Error loading student marksheet:", error)
    }
  }

  const addSubject = () => {
    setStudentData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", marks: 0, maxMarks: 100 }],
    }))
  }

  const removeSubject = (index: number) => {
    setStudentData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }))
  }

  const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
    setStudentData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject)),
    }))
  }

  const updateStudentInfo = (field: keyof Omit<StudentData, "subjects">, value: string) => {
    setStudentData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    return studentData.subjects.reduce((sum, subject) => sum + subject.marks, 0)
  }

  const calculateMaxTotal = () => {
    return studentData.subjects.reduce((sum, subject) => sum + subject.maxMarks, 0)
  }

  const calculatePercentage = () => {
    const total = calculateTotal()
    const maxTotal = calculateMaxTotal()
    return maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : "0.00"
  }

  const getGrade = () => {
    const percentage = Number.parseFloat(calculatePercentage())
    if (percentage >= 90) return { grade: "A+", color: "bg-green-500" }
    if (percentage >= 80) return { grade: "A", color: "bg-green-400" }
    if (percentage >= 70) return { grade: "B+", color: "bg-blue-500" }
    if (percentage >= 60) return { grade: "B", color: "bg-blue-400" }
    if (percentage >= 50) return { grade: "C+", color: "bg-yellow-500" }
    if (percentage >= 40) return { grade: "C", color: "bg-yellow-400" }
    if (percentage >= 35) return { grade: "D", color: "bg-orange-500" }
    return { grade: "F", color: "bg-red-500" }
  }

  const generateMarksheet = async () => {
    if (!teacher) return

    if (!studentData.name || !studentData.rollNo || !studentData.class) {
      alert("Please fill in all student details")
      return
    }
    if (studentData.subjects.some((s) => !s.name)) {
      alert("Please fill in all subject names")
      return
    }

    try {
      let studentId: string

      if (isNewStudent) {
        // Create new student
        studentId = await addStudent({
          name: studentData.name,
          rollNo: studentData.rollNo,
          class: studentData.class,
          teacherId: teacher.id,
        })
      } else {
        studentId = selectedStudent!.id!
      }

      if (!isNewStudent && existingMarks.length > 0) {
        // Update existing marks
        for (let i = 0; i < studentData.subjects.length; i++) {
          const subject = studentData.subjects[i]
          const existingMark = existingMarks.find((m) => m.subject === subject.name)

          if (existingMark) {
            // Update existing mark
            await updateMark(existingMark.id!, {
              marks: subject.marks,
              maxMarks: subject.maxMarks,
            })
          } else {
            // Add new mark for new subject
            await addMark({
              studentId,
              subject: subject.name,
              marks: subject.marks,
              maxMarks: subject.maxMarks,
              teacherId: teacher.id,
            })
          }
        }

        // Remove marks for subjects that were deleted
        for (const existingMark of existingMarks) {
          const stillExists = studentData.subjects.some((s) => s.name === existingMark.subject)
          if (!stillExists) {
            await deleteMark(existingMark.id!)
          }
        }
      } else {
        // Save new marks for each subject
        for (const subject of studentData.subjects) {
          await addMark({
            studentId,
            subject: subject.name,
            marks: subject.marks,
            maxMarks: subject.maxMarks,
            teacherId: teacher.id,
          })
        }
      }

      // Reload students list
      await loadStudents()
      setShowMarksheet(true)
      setCurrentView("view-marksheet")
    } catch (error) {
      console.error("Error saving data:", error)
      alert("Error saving data. Please try again.")
    }
  }

  const downloadPDF = () => {
    window.print()
  }

  if (!teacher) {
    return <LoginForm onLogin={handleLogin} />
  }

  const NavigationHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Welcome, {teacher.username}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button onClick={navigateToDashboard} className="hover:text-foreground transition-colors">
                Dashboard
              </button>
              {currentView === "create-marksheet" && (
                <>
                  <span>/</span>
                  <span>Create Marksheet</span>
                </>
              )}
              {currentView === "view-marksheet" && (
                <>
                  <span>/</span>
                  <span>View Marksheet</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 ml-8">
          <Button variant={currentView === "dashboard" ? "default" : "outline"} size="sm" onClick={navigateToDashboard}>
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={currentView === "create-marksheet" ? "default" : "outline"}
            size="sm"
            onClick={navigateToCreateMarksheet}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Marksheet
          </Button>
        </div>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  )

  if (showMarksheet && currentView === "view-marksheet") {
    const { grade, color } = getGrade()

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 print:hidden">
            <Button variant="outline" onClick={navigateToDashboard}>
              ← Back to Dashboard
            </Button>
            <Button onClick={downloadPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          <Card className="print:shadow-none print:border-2 print:border-gray-800">
            <CardHeader className="text-center border-b">
              <div className="flex items-center justify-center gap-3 mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold">ACADEMIC MARKSHEET</CardTitle>
                  <CardDescription className="text-sm">Official Academic Record</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Student Name</Label>
                  <p className="text-lg font-medium">{studentData.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Roll Number</Label>
                  <p className="text-lg font-medium">{studentData.rollNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Class</Label>
                  <p className="text-lg font-medium">{studentData.class}</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Marks Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Subject-wise Marks</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Subject</th>
                        <th className="text-center p-3 font-semibold">Marks Obtained</th>
                        <th className="text-center p-3 font-semibold">Maximum Marks</th>
                        <th className="text-center p-3 font-semibold">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.subjects.map((subject, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{subject.name}</td>
                          <td className="p-3 text-center">{subject.marks}</td>
                          <td className="p-3 text-center">{subject.maxMarks}</td>
                          <td className="p-3 text-center">
                            {subject.maxMarks > 0 ? ((subject.marks / subject.maxMarks) * 100).toFixed(1) : "0.0"}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Academic Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Marks:</span>
                      <span className="font-bold">
                        {calculateTotal()} / {calculateMaxTotal()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Percentage:</span>
                      <span className="font-bold">{calculatePercentage()}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Grade:</span>
                      <Badge className={`${color} text-white font-bold px-3 py-1`}>{grade}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Result Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-full ${
                          Number.parseFloat(calculatePercentage()) >= 35
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span className="font-bold text-lg">
                          {Number.parseFloat(calculatePercentage()) >= 35 ? "PASS" : "FAIL"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Minimum 35% required to pass</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>This is a computer-generated marksheet. No signature required.</p>
                <p className="mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                <p className="mt-1">Teacher: {teacher.username}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentView === "dashboard") {
    const totalStudents = students.length
    const classGroups = students.reduce(
      (acc, student) => {
        acc[student.class] = (acc[student.class] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <NavigationHeader />

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {totalStudents === 0 ? "No students yet" : "Students registered"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(classGroups).length}</div>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(classGroups).length === 0 ? "No classes yet" : "Different classes"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button onClick={navigateToCreateMarksheet} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Marksheet
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Students
              </CardTitle>
              <CardDescription>
                {totalStudents === 0
                  ? "No students found. Create your first marksheet to get started."
                  : `Manage your ${totalStudents} student${totalStudents === 1 ? "" : "s"} and their marksheets.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalStudents === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first student marksheet.</p>
                  <Button onClick={navigateToCreateMarksheet}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Marksheet
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Roll No: {student.rollNo} • Class: {student.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewStudentMarksheet(student)}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Marksheet
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleStudentSelect(student.id!)
                            setCurrentView("create-marksheet")
                          }}
                        >
                          Edit Marks
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Create Marksheet View
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <NavigationHeader />

        {/* Student Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Selection
            </CardTitle>
            <CardDescription>
              {students.length > 0
                ? `You have ${students.length} student${students.length === 1 ? "" : "s"}. Choose one or create a new student.`
                : "No students found. Create your first student below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={isNewStudent ? "default" : "outline"}
                onClick={() => {
                  setIsNewStudent(true)
                  setSelectedStudent(null)
                  setExistingMarks([])
                  setStudentData({
                    name: "",
                    rollNo: "",
                    class: "",
                    subjects: [
                      { name: "Mathematics", marks: 0, maxMarks: 100 },
                      { name: "Science", marks: 0, maxMarks: 100 },
                      { name: "English", marks: 0, maxMarks: 100 },
                    ],
                  })
                }}
              >
                New Student
              </Button>
              {students.length > 0 && (
                <Button variant={!isNewStudent ? "default" : "outline"} onClick={() => setIsNewStudent(false)}>
                  Existing Student ({students.length})
                </Button>
              )}
            </div>

            {!isNewStudent && students.length > 0 && (
              <div>
                <Label>Select Student</Label>
                <Select onValueChange={handleStudentSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id!}>
                        {student.name} - {student.rollNo} ({student.class})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStudent && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedStudent.name} - {selectedStudent.rollNo}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Student Information
              </CardTitle>
              <CardDescription>Enter the basic student details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Student Name</Label>
                <Input
                  id="name"
                  placeholder="Enter student name"
                  value={studentData.name}
                  onChange={(e) => updateStudentInfo("name", e.target.value)}
                  disabled={!isNewStudent}
                />
              </div>
              <div>
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  placeholder="Enter roll number"
                  value={studentData.rollNo}
                  onChange={(e) => updateStudentInfo("rollNo", e.target.value)}
                  disabled={!isNewStudent}
                />
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  placeholder="Enter class (e.g., 10A, XII Science)"
                  value={studentData.class}
                  onChange={(e) => updateStudentInfo("class", e.target.value)}
                  disabled={!isNewStudent}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subjects and Marks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subjects & Marks</CardTitle>
                  <CardDescription>Add subjects and enter marks obtained</CardDescription>
                </div>
                <Button onClick={addSubject} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentData.subjects.map((subject, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Subject Name</Label>
                    <Input
                      placeholder="Subject name"
                      value={subject.name}
                      onChange={(e) => updateSubject(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={subject.marks || ""}
                      onChange={(e) => updateSubject(index, "marks", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-24">
                    <Label>Max</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="100"
                      value={subject.maxMarks || ""}
                      onChange={(e) => updateSubject(index, "maxMarks", Number.parseInt(e.target.value) || 100)}
                    />
                  </div>
                  {studentData.subjects.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSubject(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Preview</CardTitle>
            <CardDescription>Preview of calculated results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{calculateTotal()}</p>
                <p className="text-sm text-muted-foreground">Total Marks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{calculateMaxTotal()}</p>
                <p className="text-sm text-muted-foreground">Maximum Marks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{calculatePercentage()}%</p>
                <p className="text-sm text-muted-foreground">Percentage</p>
              </div>
              <div>
                <Badge className={`${getGrade().color} text-white font-bold text-lg px-3 py-1`}>
                  {getGrade().grade}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="text-center mt-8">
          <Button onClick={generateMarksheet} size="lg" className="px-8">
            <FileText className="w-5 h-5 mr-2" />
            {isNewStudent ? "Create Student & Generate Marksheet" : "Update Marks & Generate Marksheet"}
          </Button>
        </div>
      </div>
    </div>
  )
}
