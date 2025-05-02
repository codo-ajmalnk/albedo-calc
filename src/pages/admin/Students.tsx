import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, UserPlus, Users } from "lucide-react";
import { StudentDialog } from "@/components/dialog/StudentDialog";
import { students as allStudents, users } from "@/lib/mock-data";
import { Student, User } from "@/lib/types";
import { crudToasts } from "@/lib/toast";

// Mock current user - in real app this would come from auth context
const currentUser: User = {
  id: "coord1",
  name: "John Coordinator",
  email: "john@example.com",
  role: "coordinator",
  phone: "+91 98765 43211",
  status: "active"
};

export default function Students() {
  const navigate = useNavigate();

  // Filter mentors based on coordinator access
  const mentors = users.filter(user => {
    if (currentUser.role === "admin") return user.role === "mentor";
    if (currentUser.role === "coordinator") return user.role === "mentor" && user.supervisorId === currentUser.id;
    if (currentUser.role === "mentor") return user.id === currentUser.id;
    return false;
  });

  // Filter students based on access control
  const getAccessibleStudents = () => {
    if (currentUser.role === "admin") return allStudents;

    if (currentUser.role === "coordinator") {
      const mentorIds = mentors.map(mentor => mentor.id);
      return allStudents.filter(student => mentorIds.includes(student.mentorId));
    }

    if (currentUser.role === "mentor") {
      return allStudents.filter(student => student.mentorId === currentUser.id);
    }

    return [];
  };

  const [students, setStudents] = useState<Student[]>(getAccessibleStudents());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<User | null>(
    currentUser.role === "mentor" ? currentUser : null
  );
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
  const [isAssignStudentsOpen, setIsAssignStudentsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState<Student>({
    id: `student${students.length + 1}`,
    name: "",
    email: "",
    phone: "",
    mentorId: selectedMentor?.id || "",
    status: "active",
    totalSessions: 12,
    sessionsCompleted: 0,
    totalHours: 12,
    completedHours: 0,
    totalPayment: 12000,
    paidAmount: 0,
    teachersPayment: 0,
    hourlyPayment: 0,
    sessionDuration: 60,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    sessionAddedOn: new Date().toISOString(),
    sessionsRemaining: 12,
    progressPercentage: 0
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMentor = !selectedMentor || student.mentorId === selectedMentor.id;

    // Additional access control check
    if (currentUser.role === "mentor") {
      return student.mentorId === currentUser.id && matchesSearch;
    }

    return matchesSearch && matchesMentor;
  });

  const handleViewDetails = (student: Student) => {
    if (!hasAccessToStudent(student)) {
      crudToasts.validation.error("You don't have permission to view this student's details.");
      return;
    }
    setSelectedStudent(student);
    setIsViewDetailsOpen(true);
  };

  const handleEdit = (student: Student) => {
    if (!hasAccessToStudent(student)) {
      crudToasts.validation.error("You don't have permission to edit this student's details.");
      return;
    }
    setEditingStudent(student);
    setIsEditOpen(true);
  };

  const handleDelete = (student: Student) => {
    if (!hasAccessToStudent(student)) {
      crudToasts.validation.error("You don't have permission to delete this student.");
      return;
    }
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const hasAccessToStudent = (student: Student) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "coordinator") {
      return mentors.some(mentor => mentor.id === student.mentorId);
    }
    if (currentUser.role === "mentor") {
      return student.mentorId === currentUser.id;
    }
    return false;
  };

  const getMentorName = (mentorId: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (!mentor) return "Unassigned";
    if (!hasAccessToMentor(mentor)) return "Restricted";
    return mentor.name;
  };

  const hasAccessToMentor = (mentor: User) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "coordinator") return mentor.supervisorId === currentUser.id;
    if (currentUser.role === "mentor") return mentor.id === currentUser.id;
    return false;
  };

  const handleAssignStudents = () => {
    if (!selectedMentor || selectedStudentsToAssign.length === 0) return;

    try {
      setStudents(students.map(student =>
        selectedStudentsToAssign.includes(student.id)
          ? { ...student, mentorId: selectedMentor.id }
          : student
      ));
      setIsAssignStudentsOpen(false);
      setSelectedStudentsToAssign([]);
      crudToasts.assign.success("Students", "Mentor");
    } catch (error) {
      crudToasts.assign.error("Students", "Mentor");
    }
  };

  const handleAddStudent = () => {
    try {
      if (!newStudent.name || !newStudent.email || !newStudent.phone || !newStudent.mentorId) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      // Calculate derived values
      const totalHours = Math.round((newStudent.totalSessions * newStudent.sessionDuration) / 60);
      const endDate = new Date(newStudent.startDate);
      endDate.setDate(endDate.getDate() + ((newStudent.totalSessions - 1) * 7)); // Assuming one session per week

      const studentToAdd = {
        ...newStudent,
        totalHours,
        endDate: endDate.toISOString(),
        sessionsRemaining: newStudent.totalSessions,
        progressPercentage: 0
      };

      setStudents([...students, studentToAdd]);
      setIsAddingStudent(false);
      setNewStudent({
        id: `student${students.length + 2}`,
        name: "",
        email: "",
        phone: "",
        mentorId: selectedMentor?.id || "",
        status: "active",
        totalSessions: 12,
        sessionsCompleted: 0,
        totalHours: 12,
        completedHours: 0,
        totalPayment: 12000,
        paidAmount: 0,
        teachersPayment: 0,
        hourlyPayment: 0,
        sessionDuration: 60,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        sessionAddedOn: new Date().toISOString(),
        sessionsRemaining: 12,
        progressPercentage: 0
      });
      crudToasts.create.success("Student");
    } catch (error) {
      crudToasts.create.error("Student");
    }
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    try {
      setStudents(students.map(student =>
        student.id === editingStudent.id ? editingStudent : student
      ));
      setIsEditOpen(false);
      setEditingStudent(null);
      crudToasts.update.success("Student");
    } catch (error) {
      crudToasts.update.error("Student");
    }
  };

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;

    try {
      setStudents(students.filter(student => student.id !== selectedStudent.id));
      setIsDeleteOpen(false);
      setSelectedStudent(null);
      crudToasts.delete.success("Student");
    } catch (error) {
      crudToasts.delete.error("Student");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Students Management</h1>
            <p className="text-muted-foreground">
              {currentUser.role === "mentor"
                ? "Manage and track your students' progress"
                : currentUser.role === "coordinator"
                  ? "Manage and track your team's students"
                  : "Manage and track all students"}
            </p>
          </div>
          {(currentUser.role === "admin" || currentUser.role === "coordinator") && (
            <Button onClick={() => {
              setIsAddingStudent(true);
              setNewStudent({
                id: `student${students.length + 1}`,
                name: "",
                email: "",
                phone: "",
                mentorId: selectedMentor?.id || "",
                status: "active",
                totalSessions: 12,
                sessionsCompleted: 0,
                totalHours: 12,
                completedHours: 0,
                totalPayment: 12000,
                paidAmount: 0,
                teachersPayment: 0,
                hourlyPayment: 0,
                sessionDuration: 60,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                sessionAddedOn: new Date().toISOString(),
                sessionsRemaining: 12,
                progressPercentage: 0
              });
            }} className="w-full sm:w-auto text-sm">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add New Student
            </Button>
          )}
        </div>

        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Students</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search by Name</Label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
              </div>
              {currentUser.role !== "mentor" && (
                <div className="space-y-2">
                  <Label>Filter by Mentor</Label>
                  <Select
                    value={selectedMentor?.id || "all"}
                    onValueChange={(value) => setSelectedMentor(value === "all" ? null : mentors.find(m => m.id === value) || null)}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select Mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Mentors</SelectItem>
                      {mentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          {mentor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const progress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm text-muted-foreground">{student.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {getMentorName(student.mentorId)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={student.status === "active" ? "default" : "secondary"}
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(student)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Users className="h-8 w-8 text-muted-foreground/60" />
                      <p className="text-sm text-muted-foreground">No students found</p>
                      <p className="text-xs text-muted-foreground">Add new students to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <StudentDialog
          isViewDetailsOpen={isViewDetailsOpen}
          isAddOpen={isAddingStudent}
          isEditOpen={isEditOpen}
          isDeleteOpen={isDeleteOpen}
          isViewStudentsOpen={isViewStudentsOpen}
          isAssignStudentsOpen={isAssignStudentsOpen}
          isAssigningStudents={isAssigningStudents}
          isAddingStudent={isAddingStudent}
          selectedStudent={selectedStudent}
          selectedMentor={selectedMentor}
          selectedStudentsToAssign={selectedStudentsToAssign}
          students={students}
          mentors={mentors}
          newStudent={newStudent}
          editingStudent={editingStudent}
          onViewDetailsClose={() => setIsViewDetailsOpen(false)}
          onAddClose={() => setIsAddingStudent(false)}
          onEditClose={() => setIsEditOpen(false)}
          onDeleteClose={() => setIsDeleteOpen(false)}
          onViewStudentsClose={() => setIsViewStudentsOpen(false)}
          onAssignStudentsClose={() => setIsAssignStudentsOpen(false)}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
          setNewStudent={setNewStudent}
          setEditingStudent={setEditingStudent}
          setIsAssigningStudents={setIsAssigningStudents}
          setIsAddingStudent={setIsAddingStudent}
          setSelectedStudentsToAssign={setSelectedStudentsToAssign}
          onAssignStudents={handleAssignStudents}
          getMentorName={getMentorName}
          onEditStudent={handleEdit}
          currentUser={currentUser}
        />
      </div>
    </DashboardLayout>
  );
}
