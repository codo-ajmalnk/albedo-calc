import DashboardLayout from "@/components/DashboardLayout";
import { StudentDialog } from "@/components/DialogOld/StudentDialog";
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
import { students as allStudents, users, packages as allPackages } from "@/lib/mock-data";
import { crudToasts } from "@/lib/toast";
import { Student, User } from "@/lib/types";
import { Download, Mail, MessageCircle, Phone, Printer } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherAssignmentDialog from "@/components/dialog/TeacherAssignmentDialog";
import PackageAssignmentDialog from "@/components/dialog/PackageAssignmentDialog";

// Mock current user - in real app this would come from auth context
const currentUser: User = {
  id: "coord1",
  name: "John Coordinator",
  email: "john@example.com",
  role: "coordinator",
  phone: "+91 98765 43211",
  status: "active",
};

export default function AdminStudents() {
  const navigate = useNavigate();

  // Filter mentors based on coordinator access
  const mentors = users.filter((user) => {
    if (currentUser.role === "admin") return user.role === "mentor";
    if (currentUser.role === "coordinator")
      return user.role === "mentor" && user.supervisorId === currentUser.id;
    if (currentUser.role === "mentor") return user.id === currentUser.id;
    return false;
  });

  // Filter students based on access control
  const getAccessibleStudents = () => {
    if (currentUser.role === "admin") return allStudents;

    if (currentUser.role === "coordinator") {
      const mentorIds = mentors.map((mentor) => mentor.id);
      return allStudents.filter((student) =>
        mentorIds.includes(student.mentorId)
      );
    }

    if (currentUser.role === "mentor") {
      return allStudents.filter(
        (student) => student.mentorId === currentUser.id
      );
    }

    return [];
  };

  const [students, setStudents] = useState<Student[]>(getAccessibleStudents());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<User | null>(
    currentUser.role === "mentor" ? currentUser : null
  );
  // Add time filter and custom date range state for student filtering
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
  const [isAssignStudentsOpen, setIsAssignStudentsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<
    string[]
  >([]);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [teacherDialogTeachers, setTeacherDialogTeachers] = useState<any[]>([]);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [packageDialogStudent, setPackageDialogStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMentor =
      !selectedMentor || student.mentorId === selectedMentor.id;

    // Additional access control check
    if (currentUser.role === "mentor") {
      return student.mentorId === currentUser.id && matchesSearch;
    }

    return matchesSearch && matchesMentor;
  });

  const handleViewDetails = (student: Student) => {
    if (!hasAccessToStudent(student)) {
      crudToasts.validation.error(
        "You don't have permission to view this student's details."
      );
      return;
    }
    setSelectedStudent(student);
    setIsViewDetailsOpen(true);
  };





  const hasAccessToStudent = (student: Student) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "coordinator") {
      return mentors.some((mentor) => mentor.id === student.mentorId);
    }
    if (currentUser.role === "mentor") {
      return student.mentorId === currentUser.id;
    }
    return false;
  };

  const getMentorName = (mentorId: string) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    if (!mentor) return "Unassigned";
    if (!hasAccessToMentor(mentor)) return "Restricted";
    return mentor.name;
  };

  const hasAccessToMentor = (mentor: User) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "coordinator")
      return mentor.supervisorId === currentUser.id;
    if (currentUser.role === "mentor") return mentor.id === currentUser.id;
    return false;
  };

  const handleAssignStudents = () => {
    if (!selectedMentor || selectedStudentsToAssign.length === 0) return;

    try {
      setStudents(
        students.map((student) =>
          selectedStudentsToAssign.includes(student.id)
            ? { ...student, mentorId: selectedMentor.id }
            : student
        )
      );
      setIsAssignStudentsOpen(false);
      setSelectedStudentsToAssign([]);
      crudToasts.assign.success("Students", "Mentor");
    } catch (error) {
      crudToasts.assign.error("Students", "Mentor");
    }
  };





  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const handleViewMentor = (student: Student) => {
    // Open mentor details dialog or navigate
  };
  const handleViewTeachers = (student: Student) => {
    // Find the teacher(s) for this student
    const teacher = users.find(u => u.role === "teacher" && u.id === student.teacherId);
    if (teacher) {
      setTeacherDialogTeachers([
        {
          id: teacher.id,
          name: teacher.name,
          status: teacher.status || "active",
          totalSessions: student.totalSessions,
          completedSessions: student.sessionsCompleted,
          totalHours: student.totalHours,
          completedHours: student.completedHours ?? 0,
          salary: student.teacherSalary ?? 0,
          paidAmount: student.teachersPayment ?? 0,
          durationDays: 90,
          progress: student.progressPercentage ?? 0,
        },
      ]);
      setIsTeacherDialogOpen(true);
    }
  };
  // Show student's packages (placeholder)
  const handleViewPackages = (student: Student) => {
    alert(
      `Packages for ${student.name} (ID: ${student.id}) will be shown here.`
    );
  };

  // Helper to map student package IDs to package objects for the dialog
  const getStudentPackages = (student: Student) => {
    const ids = Array.isArray(student.packageIds) ? student.packageIds : [student.packageId];
    return allPackages
      .filter(pkg => ids.includes(pkg.id))
      .map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        sessions: pkg.totalSessions,
        completedSessions: pkg.completedSessions,
        hours: pkg.hours,
        completedHours: pkg.completedHours,
        payment: pkg.price,
        paidAmount: pkg.paidAmount,
        progress: pkg.progress,
        durationDays: pkg.durationDays,
        teacherName: users.find(u => u.role === "teacher" && u.id === pkg.teacherId)?.name || "Unknown",
        teacherPhone: users.find(u => u.role === "teacher" && u.id === pkg.teacherId)?.phone || "",
      }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Students Management</h1>
            <p className="text-muted-foreground">
              {currentUser.role === "mentor"
                ? "Manage and track your students' progress"
                : currentUser.role === "coordinator"
                ? "Manage and track your team's students"
                : "Manage and track all students"}
            </p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Filter Students</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-end">
              {/* Search by Name */}
              <div className="w-full md:flex-1 min-w-[180px]">
                <Label className="mb-1 block">Search by Name</Label>
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              {/* Filter by Mentor */}
              {currentUser.role !== "mentor" && (
                <div className="w-full md:flex-1 min-w-[180px]">
                  <Label className="mb-1 block">Filter by Mentor</Label>
                  <Select
                    value={selectedMentor?.id || "all"}
                    onValueChange={(value) =>
                      setSelectedMentor(
                        value === "all"
                          ? null
                          : mentors.find((m) => m.id === value) || null
                      )
                    }
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select Mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Mentors</SelectItem>
                      {mentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          {mentor.name} ({mentor.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
          {filteredStudents.map((student) => {
            const sessionsProgress = Math.round(
              (student.sessionsCompleted / student.totalSessions) * 100
            );
            const completedHours = Math.round(
              (student.sessionsCompleted * student.sessionDuration) / 60
            );
            const hoursProgress = Math.round(
              (completedHours / student.totalHours) * 100
            );
            const paymentProgress = Math.round(
              (student.paidAmount / student.totalPayment) * 100
            );
            const classTakeAmount =
              student.totalSessions > 0
                ? Math.round(student.totalPayment / student.totalSessions)
                : 0;
            const teacherSalary = Math.round(student.paidAmount * 0.7);
            const expenseRatio =
              student.totalPayment > 0
                ? Math.round((teacherSalary / student.totalPayment) * 100)
                : 0;

            return (
              <Card key={student.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">
                        {student.name} ({student.id})
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex flex-wrap gap-2 mt-1 justify-start sm:justify-end">
                        <a
                          href={`mailto:${student.email}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="hidden xs:inline">Mail</span>
                        </a>
                        <a
                          href={`tel:${student.phone || ""}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="hidden xs:inline">Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${(student.phone || "").replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                            `Hello ${student.name} (ID: ${student.id}),\n\nThis is a message from Albedo Educator.`
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
                          onClick={() => alert('Download triggered!')}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden xs:inline">Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="space-y-6">
                    {/* Progress Bars - Each in its own row with motivational icon */}
                    <div className="flex flex-col gap-4 w-full pt-4">
                      {/* Sessions Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your sessions!"
                        >
                          <span role="img" aria-label="Trending Up">
                            📈
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Sessions
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              sessionsProgress === 100
                                ? "bg-palette-info"
                                : sessionsProgress >= 75
                                ? "bg-palette-accent"
                                : sessionsProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${sessionsProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {student.sessionsCompleted}/
                              {student.totalSessions} ({sessionsProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {student.totalSessions -
                                student.sessionsCompleted}{" "}
                              ({100 - sessionsProgress}%)
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
                          <span role="img" aria-label="Lightbulb">
                            💡
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Hours
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              hoursProgress === 100
                                ? "bg-palette-info"
                                : hoursProgress >= 75
                                ? "bg-palette-accent"
                                : hoursProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${hoursProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {completedHours}/{student.totalHours} (
                              {hoursProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {student.totalHours - completedHours} (
                              {100 - hoursProgress}%)
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
                          <span role="img" aria-label="Trending Up">
                            📈
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Payments
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              paymentProgress === 100
                                ? "bg-palette-info"
                                : paymentProgress >= 75
                                ? "bg-palette-accent"
                                : paymentProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${paymentProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              ₹{student.paidAmount.toLocaleString()}/₹
                              {student.totalPayment.toLocaleString()} (
                              {paymentProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              ₹
                              {(
                                student.totalPayment - student.paidAmount
                              ).toLocaleString()}{" "}
                              ({100 - paymentProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Refund Spot & Refund Package - like coordinators/mentors page */}
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
                          <p>{formatCurrency(classTakeAmount)}</p>
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
                          <p>{formatCurrency(teacherSalary)}</p>
                        </div>
                      </div>
                      {/* Expense Ratio */}
                      <div
                        className={`p-3 sm:p-4 rounded-lg border border-indigo-100/50 dark:bg-gray-900/100 bg-white shadow-sm ${
                          expenseRatio > 100
                            ? "bg-red-100/60 text-red-700 border-red-200"
                            : expenseRatio > 75
                            ? "bg-yellow-100/60 text-yellow-800 border-yellow-200"
                            : expenseRatio > 50
                            ? "bg-blue-100/60 text-blue-800 border-blue-200"
                            : "bg-green-100/60 text-green-800 border-green-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Expense Ratio</p>
                        </div>
                        <div className="space-y-1">
                          <p>{expenseRatio}%</p>
                        </div>
                      </div>
                    </div>
                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => {
                          setPackageDialogStudent(student);
                          setIsPackageDialogOpen(true);
                        }}
                      >
                        Packages
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewTeachers(student)}
                      >
                        Teachers
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredStudents.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No students found matching your filters.
              </p>
            </div>
          )}
        </div>

        {/* <StudentDialog
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
        /> */}
        <TeacherAssignmentDialog
          open={isTeacherDialogOpen}
          onOpenChange={setIsTeacherDialogOpen}
          teachers={teacherDialogTeachers}
          userRole={currentUser.role}
        />
        {packageDialogStudent && (
          <PackageAssignmentDialog
            open={isPackageDialogOpen}
            onOpenChange={setIsPackageDialogOpen}
            packages={getStudentPackages(packageDialogStudent)}
            userRole={currentUser.role}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
