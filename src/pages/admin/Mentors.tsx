
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { users, students as allStudents, generateDashboardStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student, User } from "@/lib/types";
import { UserSearch, Eye, Edit, Plus, Trash2, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { crudToasts } from "@/lib/toast";
import { MentorDialog } from "@/components/dialog/MentorDialog";
import { ViewToggle } from "@/components/ViewToggle";
import { ListCard } from "@/components/ListCard";

const AdminMentors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [coordinatorFilter, setCoordinatorFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Single dialog state to manage all dialogs
  const [activeDialog, setActiveDialog] = useState<"details" | "students" | "edit" | "delete" | "add" | null>(null);

  const [selectedMentor, setSelectedMentor] = useState<{
    user: User;
    stats: ReturnType<typeof getMentorStats>;
  } | null>(null);

  const [mentors, setMentors] = useState(users.filter((user) => user.role === "mentor"));
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [newMentor, setNewMentor] = useState({
    id: `mentor${users.filter(u => u.role === "mentor").length + 1}`,
    name: "",
    email: "",
    phone: "",
    password: "",
    supervisorId: "",
    role: "mentor" as const,
  });
  const [editingMentor, setEditingMentor] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    supervisorId: string;
    role: "mentor";
  } | null>(null);

  const coordinators = users.filter((user) => user.role === "coordinator");

  // Add useEffect to initialize students
  useEffect(() => {
    // Initialize students from the mock data
    setStudents(students || []);
  }, []); // Run once on component mount

  const getMentorStats = (mentorId: string) => {
    const mentorStudents = students.filter(student => student.mentorId === mentorId);

    const totalSessions = mentorStudents.reduce(
      (sum, student) => sum + student.totalSessions,
      0
    );
    const completedSessions = mentorStudents.reduce(
      (sum, student) => sum + student.sessionsCompleted,
      0
    );
    const totalHours = mentorStudents.reduce(
      (sum, student) => sum + student.totalHours,
      0
    );
    const completedHours = mentorStudents.reduce(
      (sum, student) => sum + (student.totalHours * (student.sessionsCompleted / student.totalSessions)),
      0
    );

    const stats = generateDashboardStats(mentorStudents);

    return {
      studentCount: mentorStudents.length,
      totalSessions,
      completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      sessionProgress: totalSessions > 0 ? Math.floor((completedSessions / totalSessions) * 100) : 0,
      hoursProgress: totalHours > 0 ? Math.floor((completedHours / totalHours) * 100) : 0,
      overallProgress: stats.overallProgress,
      activeStudents: mentorStudents.filter(s => s.status === 'active').length,
      completedPayments: stats.completedPayments,
      pendingPayments: stats.pendingPayments,
      totalPayments: stats.totalPayments,
      paymentsProgress: stats.totalPayments > 0 ? Math.floor((stats.completedPayments / stats.totalPayments) * 100) : 0,
    };
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name.toLowerCase().includes(search.toLowerCase());
    const matchesCoordinator = coordinatorFilter === "all" || mentor.supervisorId === coordinatorFilter;
    return matchesSearch && matchesCoordinator;
  });

  const getCoordinatorName = (coordinatorId: string) => {
    const coordinator = users.find((user) => user.id === coordinatorId);
    return coordinator ? coordinator.name : "Unassigned";
  };

  // Helper function to close all dialogs
  const closeAllDialogs = () => {
    setActiveDialog(null);
    setSelectedMentor(null);
    setEditingMentor(null);
  };

  const handleViewDetails = (mentor: User) => {
    const stats = getMentorStats(mentor.id);
    setSelectedMentor({ user: mentor, stats });
    setActiveDialog("details");
  };

  const handleViewStudents = (mentor: User) => {
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setActiveDialog("students");
  };

  const handleEditProfile = (mentor: User) => {
    setEditingMentor({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone || "",
      password: "",
      supervisorId: mentor.supervisorId || "",
      role: "mentor",
    });
    setActiveDialog("edit");
  };

  const handleDeleteMentor = (mentor: User) => {
    const mentorStudents = students.filter(student => student.mentorId === mentor.id);

    if (mentorStudents.length > 0) {
      crudToasts.validation.error("Cannot delete mentor with assigned students. Please reassign or remove all students first.");
      return;
    }

    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setActiveDialog("delete");
  };

  const confirmDeleteMentor = () => {
    if (!selectedMentor) return;

    try {
      const mentorStudents = students.filter(student => student.mentorId === selectedMentor.user.id);

      if (mentorStudents.length > 0) {
        crudToasts.validation.error("Cannot delete mentor with assigned students. Please reassign or remove all students first.");
        return;
      }

      setMentors(mentors.filter(mentor => mentor.id !== selectedMentor.user.id));
      setActiveDialog(null);
      setSelectedMentor(null);
      crudToasts.delete.success("Mentor");
    } catch (error) {
      crudToasts.delete.error("Mentor");
    }
  };

  const handleAddMentor = () => {
    try {
      if (!newMentor.name || !newMentor.email || !newMentor.phone) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      setMentors([...mentors, { ...newMentor, role: "mentor" }]);
      setActiveDialog(null);
      setNewMentor({
        id: `mentor${mentors.length + 2}`,
        name: "",
        email: "",
        phone: "",
        password: "",
        supervisorId: "",
        role: "mentor" as const,
      });
      crudToasts.create.success("Mentor");
    } catch (error) {
      crudToasts.create.error("Mentor");
    }
  };

  const handleUpdateMentor = () => {
    if (!editingMentor) return;

    try {
      setMentors(mentors.map(mentor =>
        mentor.id === editingMentor.id ? { ...editingMentor, role: "mentor" } : mentor
      ));
      setActiveDialog(null);
      setEditingMentor(null);
      crudToasts.update.success("Mentor");
    } catch (error) {
      crudToasts.update.error("Mentor");
    }
  };

  // Add student-related state variables
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Student>({
    id: `student${students.length + 1}`,
    name: "",
    email: "",
    phone: "",
    mentorId: "",
    status: "active",
    totalSessions: 12,
    sessionsCompleted: 0,
    totalHours: 24,
    totalPayment: 12000,
    paidAmount: 0,
    teachersPayment: 0, // Added missing property
    hourlyPayment: 500, // Added missing property
    sessionsRemaining: 12,
    progressPercentage: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    sessionDuration: 60,
    sessionAddedOn: new Date().toISOString() // Added missing property
  });

  // Add student management functions
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditingStudent(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeletingStudent(true);
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    try {
      setStudents(students.map(student =>
        student.id === editingStudent.id ? editingStudent : student
      ));
      setIsEditingStudent(false);
      setEditingStudent(null);
      crudToasts.update.success("Student");
    } catch (error) {
      crudToasts.update.error("Student");
    }
  };

  const handleAddStudent = () => {
    try {
      if (!newStudent.name || !newStudent.email || !newStudent.phone) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      if (!selectedMentor?.user.id) {
        crudToasts.validation.error("No mentor selected.");
        return;
      }

      const studentToAdd: Student = {
        ...newStudent,
        mentorId: selectedMentor.user.id,
        teachersPayment: newStudent.teachersPayment,
        hourlyPayment: newStudent.hourlyPayment,
        sessionAddedOn: newStudent.sessionAddedOn
      };

      setStudents([...students, studentToAdd]);
      allStudents.push(studentToAdd);
      setIsAddingStudent(false);
      setNewStudent({
        id: `student${students.length + 2}`,
        name: "",
        email: "",
        phone: "",
        mentorId: "",
        status: "active",
        totalSessions: 12,
        sessionsCompleted: 0,
        totalHours: 24,
        totalPayment: 12000,
        paidAmount: 0,
        teachersPayment: 0, // Added missing property
        hourlyPayment: 500, // Added missing property
        sessionsRemaining: 12,
        progressPercentage: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        sessionDuration: 60,
        sessionAddedOn: new Date().toISOString() // Added missing property
      });
      crudToasts.create.success("Student");
    } catch (error) {
      crudToasts.create.error("Student");
    }
  };

  const confirmDeleteStudent = () => {
    if (!selectedStudent) return;

    try {
      setStudents(students.filter(student => student.id !== selectedStudent.id));
      setIsDeletingStudent(false);
      setSelectedStudent(null);
      crudToasts.delete.success("Student");
    } catch (error) {
      crudToasts.delete.error("Student");
    }
  };

  const handleAssignStudents = () => {
    try {
      if (!selectedMentor?.user.id) {
        crudToasts.validation.error("No mentor selected.");
        return;
      }

      if (selectedStudentsToAssign.length === 0) {
        crudToasts.validation.error("Please select at least one student to assign.");
        return;
      }

      const updatedStudents = students.map(student => {
        if (selectedStudentsToAssign.includes(student.id)) {
          return { ...student, mentorId: selectedMentor.user.id };
        }
        return student;
      });

      setStudents(updatedStudents);
      selectedStudentsToAssign.forEach(studentId => {
        const student = allStudents.find(s => s.id === studentId);
        if (student) {
          student.mentorId = selectedMentor.user.id;
        }
      });

      setIsAssigningStudents(false);
      setSelectedStudentsToAssign([]);
      crudToasts.assign.success("Students", "mentor");
    } catch (error) {
      crudToasts.assign.error("Students", "mentor");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Mentors Management</h1>
            <div className="flex items-center gap-2">
              <ViewToggle view={view} onViewChange={setView} />
              <Button
                className="text-sm"
                onClick={() => setActiveDialog("add")}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add New Mentor
              </Button>
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Mentors</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search by Name</Label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search mentors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm"
                  />
                  <Button variant="outline" className="shrink-0 text-sm">
                    <UserSearch className="mr-1.5 h-3.5 w-3.5" />
                    Search
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter by Coordinator</Label>
                <Select
                  value={coordinatorFilter}
                  onValueChange={setCoordinatorFilter}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coordinators</SelectItem>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {view === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {filteredMentors.map((mentor) => {
              const stats = getMentorStats(mentor.id);
              const mentorStudents = students.filter(student => student.mentorId === mentor.id);

              return (
                <Card key={mentor.id} className="flex flex-col">
                  <CardHeader className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg">{mentor.name}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">{mentor.email}</p>
                      </div>
                      <div className="text-left sm:text-right space-y-1">
                        <p className="text-xs sm:text-sm">ID: <span className="font-medium">{mentor.id}</span></p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {mentor.phone ? `Phone: ${mentor.phone}` : 'No phone number'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Students</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-xl sm:text-2xl font-bold">{stats.studentCount}</p>
                            <p className="text-sm text-muted-foreground">total</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Students</p>
                          <p className="text-base font-medium">{stats.activeStudents}</p>
                        </div>
                      </div>

                      {mentorStudents.length > 0 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Sessions Progress</span>
                              <span className="font-medium">{stats.sessionProgress}%</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${stats.sessionProgress === 100
                                  ? 'bg-progress-complete'
                                  : stats.sessionProgress >= 75
                                    ? 'bg-progress-high'
                                    : stats.sessionProgress >= 40
                                      ? 'bg-progress-medium'
                                      : 'bg-progress-low'
                                }`}
                                style={{ width: `${stats.sessionProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{stats.completedSessions} completed</span>
                              <span>{stats.totalSessions} total</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Hours Progress</span>
                              <span className="font-medium">{stats.hoursProgress}%</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${stats.hoursProgress === 100
                                  ? 'bg-progress-complete'
                                  : stats.hoursProgress >= 75
                                    ? 'bg-progress-high'
                                    : stats.hoursProgress >= 40
                                      ? 'bg-progress-medium'
                                      : 'bg-progress-low'
                                }`}
                                style={{ width: `${stats.hoursProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{stats.completedHours} completed</span>
                              <span>{stats.totalHours} total</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Payment Progress</span>
                              <span className="font-medium">{stats.paymentsProgress}%</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${stats.paymentsProgress === 100
                                  ? 'bg-progress-complete'
                                  : stats.paymentsProgress >= 75
                                    ? 'bg-progress-high'
                                    : stats.paymentsProgress >= 40
                                      ? 'bg-progress-medium'
                                      : 'bg-progress-low'
                                }`}
                                style={{ width: `${stats.paymentsProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>₹{stats.completedPayments.toLocaleString()} completed</span>
                              <span>₹{stats.totalPayments.toLocaleString()} total</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 xs:grid-cols-5 gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs sm:text-sm"
                          onClick={() => handleViewDetails(mentor)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs sm:text-sm"
                          onClick={() => handleViewStudents(mentor)}
                        >
                          <Users className="mr-1.5 h-3.5 w-3.5" />
                          Students
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs sm:text-sm"
                          onClick={() => handleEditProfile(mentor)}
                        >
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full text-xs sm:text-sm"
                          onClick={() => handleDeleteMentor(mentor)}
                          disabled={mentorStudents.length > 0}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredMentors.length === 0 && (
              <div className="col-span-full text-center p-8">
                <p className="text-muted-foreground">
                  No mentors found matching your filters.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMentors.map((mentor) => {
              const stats = getMentorStats(mentor.id);
              const mentorStudents = students.filter(student => student.mentorId === mentor.id);
              
              return (
                <ListCard
                  key={mentor.id}
                  id={mentor.id}
                  name={mentor.name}
                  email={mentor.email}
                  phone={mentor.phone}
                  stats={{
                    studentCount: stats.studentCount,
                    activeStudents: stats.activeStudents,
                    sessionProgress: stats.sessionProgress,
                    completedSessions: stats.completedSessions,
                    totalSessions: stats.totalSessions,
                    hoursProgress: stats.hoursProgress,
                    completedHours: stats.completedHours,
                    totalHours: stats.totalHours,
                    paymentsProgress: stats.paymentsProgress,
                    completedPayments: stats.completedPayments,
                    totalPayments: stats.totalPayments
                  }}
                  hasStudents={mentorStudents.length > 0}
                  onViewDetails={() => handleViewDetails(mentor)}
                  onViewStudents={() => handleViewStudents(mentor)}
                  onEditProfile={() => handleEditProfile(mentor)}
                  onDelete={() => handleDeleteMentor(mentor)}
                />
              );
            })}
            {filteredMentors.length === 0 && (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  No mentors found matching your filters.
                </p>
              </div>
            )}
          </div>
        )}

        <MentorDialog
          isViewDetailsOpen={activeDialog === "details"}
          isAddOpen={activeDialog === "add"}
          isEditOpen={activeDialog === "edit"}
          isDeleteOpen={activeDialog === "delete"}
          isViewStudentsOpen={activeDialog === "students"}
          selectedMentor={selectedMentor?.user}
          selectedCoordinator={null}
          newMentor={newMentor}
          editingMentor={editingMentor}
          students={students}
          onViewDetailsClose={closeAllDialogs}
          onAddClose={closeAllDialogs}
          onEditClose={closeAllDialogs}
          onDeleteClose={closeAllDialogs}
          onViewStudentsClose={closeAllDialogs}
          onAddMentor={handleAddMentor}
          onUpdateMentor={handleUpdateMentor}
          onDeleteMentor={confirmDeleteMentor}
          setNewMentor={setNewMentor}
          setEditingMentor={setEditingMentor}
          isAssigningStudents={isAssigningStudents}
          isAddingStudent={isAddingStudent}
          setIsAssigningStudents={setIsAssigningStudents}
          setIsAddingStudent={setIsAddingStudent}
          handleEditStudent={handleEditStudent}
          handleDeleteStudent={handleDeleteStudent}
          handleAddStudent={handleAddStudent}
          handleAssignStudents={handleAssignStudents}
          selectedStudentsToAssign={selectedStudentsToAssign}
          setSelectedStudentsToAssign={setSelectedStudentsToAssign}
          newStudent={newStudent}
          setNewStudent={setNewStudent}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminMentors;
