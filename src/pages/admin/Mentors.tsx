import DashboardLayout from "@/components/DashboardLayout";
import { MentorDialog } from "@/components/dialog/MentorDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  students as allStudents,
  generateDashboardStats,
  users,
} from "@/lib/mock-data";
import { crudToasts } from "@/lib/toast";
import { Student, User } from "@/lib/types";
import {
  Lightbulb,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminMentors = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [coordinatorFilter, setCoordinatorFilter] = useState("all");

  // Add time filter and custom date range state for mentor filtering
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });

  // Helper function to format currency
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  // Single dialog state to manage all dialogs
  const [activeDialog, setActiveDialog] = useState<
    "details" | "students" | "edit" | "delete" | "add" | null
  >(null);

  const [selectedMentor, setSelectedMentor] = useState<{
    user: User;
    stats: ReturnType<typeof getMentorStats>;
  } | null>(null);

  const [mentors, setMentors] = useState(
    users.filter((user) => user.role === "mentor")
  );
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [newMentor, setNewMentor] = useState({
    id: `mentor${users.filter((u) => u.role === "mentor").length + 1}`,
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
    const mentorStudents = students.filter(
      (student) => student.mentorId === mentorId
    );

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
      (sum, student) =>
        sum +
        student.totalHours *
          (student.sessionsCompleted / student.totalSessions),
      0
    );

    const stats = generateDashboardStats(mentorStudents);

    // Calculate mentor-level expense data
    const totalSessionsForExpense = mentorStudents.reduce(
      (sum, student) => sum + student.totalSessions,
      0
    );
    const totalPaymentsForExpense = mentorStudents.reduce(
      (sum, student) => sum + student.totalPayment,
      0
    );
    const completedPaymentsForExpense = mentorStudents.reduce(
      (sum, student) => sum + student.paidAmount,
      0
    );

    const classTakeAmount =
      totalSessionsForExpense > 0
        ? Math.round(totalPaymentsForExpense / totalSessionsForExpense)
        : 0;
    const teacherSalary = Math.round(completedPaymentsForExpense * 0.7); // 70% of completed payments
    const expenseRatio =
      totalPaymentsForExpense > 0
        ? Math.round((teacherSalary / totalPaymentsForExpense) * 100)
        : 0;

    return {
      studentCount: mentorStudents.length,
      totalSessions,
      completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      sessionProgress:
        totalSessions > 0
          ? Math.floor((completedSessions / totalSessions) * 100)
          : 0,
      hoursProgress:
        totalHours > 0 ? Math.floor((completedHours / totalHours) * 100) : 0,
      overallProgress: stats.overallProgress,
      activeStudents: mentorStudents.filter((s) => s.status === "active")
        .length,
      completedPayments: stats.completedPayments,
      pendingPayments: stats.pendingPayments,
      totalPayments: stats.totalPayments,
      paymentsProgress:
        stats.totalPayments > 0
          ? Math.floor((stats.completedPayments / stats.totalPayments) * 100)
          : 0,
      classTakeAmount,
      teacherSalary,
      expenseRatio,
    };
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCoordinator =
      coordinatorFilter === "all" || mentor.supervisorId === coordinatorFilter;
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
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setActiveDialog("delete");
  };

  const confirmDeleteMentor = () => {
    if (!selectedMentor) return;

    const mentorStudents = students.filter(
      (student) => student.mentorId === selectedMentor.user.id
    );

    if (mentorStudents.length > 0) {
      crudToasts.validation.error(
        "Cannot delete mentor with assigned students. Please reassign or remove all students first."
      );
      return;
    }

    try {
      setMentors(
        mentors.filter((mentor) => mentor.id !== selectedMentor.user.id)
      );
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
      setMentors(
        mentors.map((mentor) =>
          mentor.id === editingMentor.id
            ? { ...editingMentor, role: "mentor" }
            : mentor
        )
      );
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
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<
    string[]
  >([]);
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
    sessionsRemaining: 12,
    progressPercentage: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    sessionDuration: 60,
    teachersPayment: 0,
    hourlyPayment: 0,
    sessionAddedOn: new Date().toISOString(),
    expenseRatio: 0,
    classTakeAmount: 0,
    teacherSalary: 0,
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
      setStudents(
        students.map((student) =>
          student.id === editingStudent.id ? editingStudent : student
        )
      );
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
        sessionsRemaining: 12,
        progressPercentage: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        sessionDuration: 60,
        teachersPayment: 0,
        hourlyPayment: 0,
        sessionAddedOn: new Date().toISOString(),
        expenseRatio: 0,
        classTakeAmount: 0,
        teacherSalary: 0,
      });
      crudToasts.create.success("Student");
    } catch (error) {
      crudToasts.create.error("Student");
    }
  };

  const confirmDeleteStudent = () => {
    if (!selectedStudent) return;

    try {
      setStudents(
        students.filter((student) => student.id !== selectedStudent.id)
      );
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
        crudToasts.validation.error(
          "Please select at least one student to assign."
        );
        return;
      }

      const updatedStudents = students.map((student) => {
        if (selectedStudentsToAssign.includes(student.id)) {
          return { ...student, mentorId: selectedMentor.user.id };
        }
        return student;
      });

      setStudents(updatedStudents);
      selectedStudentsToAssign.forEach((studentId) => {
        const student = allStudents.find((s) => s.id === studentId);
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

  const handleViewTeachers = (mentor: User) => {
    // Implement your logic here (open dialog, navigate, etc.)
    // For now, you can use an alert or a placeholder
    alert(`Show teachers for mentor: ${mentor.name}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            Mentors Management
          </h1>
        </div>
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Mentors</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-end">
              {/* Search by Name */}
              <div className="w-full md:flex-1 min-w-[180px]">
                <Label className="mb-1 block">Search by Name</Label>
                <Input
                  placeholder="Search mentors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              {/* Filter by Coordinator */}
              <div className="w-full md:flex-1 min-w-[180px]">
                <Label className="mb-1 block">Filter by Coordinator</Label>
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
                        {coordinator.name} ({coordinator.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filter by Date */}
              <div className="w-full md:w-auto">
                <Label className="mb-1 block">Filter by Date</Label>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {timeFilter === "custom" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 w-full sm:w-[120px]"
                        >
                          {customDateRange.from
                            ? new Date(
                                customDateRange.from
                              ).toLocaleDateString()
                            : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="p-0 w-auto max-w-xs sm:max-w-sm"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            customDateRange.from
                              ? new Date(customDateRange.from)
                              : undefined
                          }
                          onSelect={(date) =>
                            setCustomDateRange((r) => ({
                              ...r,
                              from: date
                                ? date.toLocaleDateString("en-CA")
                                : "",
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                  {timeFilter === "custom" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 w-full sm:w-[120px]"
                        >
                          {customDateRange.to
                            ? new Date(customDateRange.to).toLocaleDateString()
                            : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="p-0 w-auto max-w-xs sm:max-w-sm"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            customDateRange.to
                              ? new Date(customDateRange.to)
                              : undefined
                          }
                          onSelect={(date) => {
                            setCustomDateRange((r) => ({
                              ...r,
                              to: date ? date.toLocaleDateString("en-CA") : "",
                            }));
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredMentors.map((mentor) => {
            const stats = getMentorStats(mentor.id);
            const mentorStudents = students.filter(
              (student) => student.mentorId === mentor.id
            );
            return (
              <Card key={mentor.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base sm:text-lg">
                          {mentor.name} ({mentor.id})
                        </CardTitle>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            mentor.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {mentor.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex flex-wrap gap-2 mt-1 justify-start sm:justify-end">
                        <a
                          href={`mailto:${mentor.email}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="hidden xs:inline">Mail</span>
                        </a>
                        <a
                          href={`tel:${mentor.phone || ""}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="hidden xs:inline">Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${(mentor.phone || "").replace(
                            /[^\d]/g,
                            ""
                          )}?text=${encodeURIComponent(
                            `Hello ${mentor.name} (ID: ${mentor.id}),\n\nThis is a message from Albedo Educator.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-100 text-green-900 hover:bg-green-200 text-xs font-medium transition"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden xs:inline">WhatsApp</span>
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
                          onClick={() => window.print()}
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden xs:inline">Print</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">
                          Students
                        </p>
                        <p className="text-2xl font-bold break-words text-center">
                          {stats.studentCount}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">
                          Active Students
                        </p>
                        <p className="text-2xl font-bold break-words text-center">
                          {stats.activeStudents}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">
                          Coordinator
                        </p>
                        <p className="text-2xl font-bold break-words text-center">
                          {getCoordinatorName(mentor.supervisorId)}
                        </p>
                      </div>
                    </div>
                    {/* Progress Bars - Each in its own row with motivational icon */}
                    <div className="flex flex-col gap-4 w-full pt-4">
                      {/* Sessions Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your sessions!"
                        >
                          <TrendingUp className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Sessions
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.sessionProgress === 100
                                ? "bg-palette-info"
                                : stats.sessionProgress >= 75
                                ? "bg-palette-accent"
                                : stats.sessionProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${stats.sessionProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {stats.completedSessions}/{stats.totalSessions} (
                              {stats.sessionProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {stats.totalSessions - stats.completedSessions} (
                              {100 - stats.sessionProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Hours Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your hours!"
                        >
                          <Lightbulb className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Hours
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.hoursProgress === 100
                                ? "bg-palette-info"
                                : stats.hoursProgress >= 75
                                ? "bg-palette-accent"
                                : stats.hoursProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${stats.hoursProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {stats.completedHours}/{stats.totalHours} (
                              {stats.hoursProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {stats.totalHours - stats.completedHours} (
                              {100 - stats.hoursProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Payments Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your payments!"
                        >
                          <TrendingUp className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Payments
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.paymentsProgress === 100
                                ? "bg-palette-info"
                                : stats.paymentsProgress >= 75
                                ? "bg-palette-accent"
                                : stats.paymentsProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${stats.paymentsProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              ₹{stats.completedPayments.toLocaleString()}/₹
                              {stats.totalPayments.toLocaleString()} (
                              {stats.paymentsProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              ₹
                              {(
                                stats.totalPayments - stats.completedPayments
                              ).toLocaleString()}{" "}
                              ({100 - stats.paymentsProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Refund Spot & Refund Package - like coordinators page */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      {/* Refund Spot */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Refund Spot</p>
                        </div>
                        <div className="space-y-1">
                          <p className="">0</p>
                        </div>
                      </div>
                      {/* Refund Package */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Refund Package
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="">0</p>
                        </div>
                      </div>
                    </div>
                    {/* Financial Stats - Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      {/* Class Take Amount */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Class Take Amount
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="">
                            {formatCurrency(stats.classTakeAmount || 0)}
                          </p>
                        </div>
                      </div>
                      {/* Teacher Salary */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Teacher Salary
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="">
                            {formatCurrency(stats.teacherSalary || 0)}
                          </p>
                        </div>
                      </div>
                      {/* Expense Ratio */}
                      <div
                        className={`p-3 sm:p-4 rounded-lg border border-indigo-100/50 dark:bg-gray-900/100 bg-white shadow-sm ${
                          stats.expenseRatio > 100
                            ? "bg-red-100/60 text-red-700 border-red-200"
                            : stats.expenseRatio > 75
                            ? "bg-yellow-100/60 text-yellow-800 border-yellow-200"
                            : stats.expenseRatio > 50
                            ? "bg-blue-100/60 text-blue-800 border-blue-200"
                            : "bg-green-100/60 text-green-800 border-green-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Expense Ratio</p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{stats.expenseRatio || 0}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewStudents(mentor)}
                      >
                        Students
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewTeachers(mentor)}
                      >
                        Teachers
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
