import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  users,
  students as allStudents,
  generateDashboardStats,
} from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Edit, Trash2, Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Student } from "@/lib/types";
import { crudToasts } from "@/lib/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const CoordinatorMentors = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [mentors, setMentors] = useState(
    users.filter((u) => u.role === "mentor" && u.supervisorId === user?.id)
  );

  // Helper function to format currency
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const [selectedMentor, setSelectedMentor] = useState<{
    user: User;
    stats: ReturnType<typeof getMentorStats>;
  } | null>(null);
  const [isViewingStudents, setIsViewingStudents] = useState(false);
  const [isEditingMentor, setIsEditingMentor] = useState(false);
  const [isDeletingMentor, setIsDeletingMentor] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [editingMentor, setEditingMentor] = useState<User | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);
  const [newMentor, setNewMentor] = useState<
    User & { useDefaultPassword: boolean }
  >({
    id: `mentor${users.length + 1}`,
    name: "",
    email: "",
    phone: "",
    role: "mentor" as const,
    supervisorId: user?.id || "",
    password: "",
    status: "active",
    useDefaultPassword: false,
  });
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<Student>({
    id: "",
    name: "",
    email: "",
    phone: "",
    status: "active",
    mentorId: "",
    totalSessions: 0,
    sessionsCompleted: 0,
    sessionsRemaining: 0,
    totalHours: 0,
    totalPayment: 0,
    paidAmount: 0,
    progressPercentage: 0,
    startDate: "",
    endDate: "",
    sessionDuration: 60,
    teachersPayment: 0,
    hourlyPayment: 0,
    sessionAddedOn: "",
  });
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<
    string[]
  >([]);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  if (!user) return null;

  // Get mentors under this coordinator
  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(search.toLowerCase())
  );

  const getMentorStats = (mentorId: string) => {
    const mentorStudents = allStudents.filter(
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

  const handleViewDetails = (mentor: User) => {
    const stats = getMentorStats(mentor.id);
    setSelectedMentor({ user: mentor, stats });
  };

  const handleViewStudents = (mentor: User) => {
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setIsViewingStudents(true);
  };

  const handleEditProfile = (mentor: User) => {
    setEditingMentor(mentor);
    setIsEditingMentor(true);
  };

  const handleDeleteMentor = (mentor: User) => {
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setIsDeletingMentor(true);
  };

  const handleUpdateMentor = () => {
    if (!editingMentor) return;

    try {
      setMentors(
        mentors.map((mentor) =>
          mentor.id === editingMentor.id ? editingMentor : mentor
        )
      );
      setIsEditingMentor(false);
      setEditingMentor(null);
      crudToasts.update.success("Mentor");
    } catch (error) {
      crudToasts.update.error("Mentor");
    }
  };

  const confirmDeleteMentor = () => {
    if (!selectedMentor) return;

    try {
      setMentors(
        mentors.filter((mentor) => mentor.id !== selectedMentor.user.id)
      );
      setIsDeletingMentor(false);
      setSelectedMentor(null);
      crudToasts.delete.success("Mentor");
    } catch (error) {
      crudToasts.delete.error("Mentor");
    }
  };

  const handleAddMentor = () => {
    try {
      // Validate required fields
      if (!newMentor.name || !newMentor.email || !newMentor.phone) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      // Automatically assign the current coordinator as supervisor
      const mentorWithSupervisor = {
        ...newMentor,
        id: `mentor${users.length + 2}`,
        supervisorId: user.id,
        status: "active",
        totalStudents: 0,
        activeStudents: 0,
        totalSessions: 0,
        completedSessions: 0,
        totalHours: 0,
        completedHours: 0,
        totalPayment: 0,
        collectedPayment: 0,
      };

      users.push(mentorWithSupervisor as User);
      setIsAddingMentor(false);
      setNewMentor({
        id: "",
        name: "",
        email: "",
        phone: "",
        role: "mentor" as const,
        supervisorId: user.id,
        password: "",
        status: "active",
        useDefaultPassword: false,
      });
      crudToasts.create.success("Mentor");
    } catch (error) {
      crudToasts.create.error("Mentor");
    }
  };

  const generateDefaultPassword = (name: string, phone: string) => {
    const firstThreeLetters = name.slice(0, 3).toLowerCase();
    const lastFourDigits = phone.slice(-4);
    return `${firstThreeLetters}${lastFourDigits}`;
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditStudentOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    try {
      // Update both local state and allStudents array
      const index = allStudents.findIndex((s) => s.id === student.id);
      if (index !== -1) {
        allStudents.splice(index, 1);
      }
      crudToasts.delete.success("Student");
    } catch (error) {
      crudToasts.delete.error("Student");
    }
  };

  const handleAddStudent = () => {
    try {
      // Validate required fields
      if (!newStudent.name || !newStudent.email || !newStudent.phone) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      // Automatically assign the current mentor
      const studentWithMentor = {
        ...newStudent,
        mentorId: selectedMentor?.user.id || "",
        status: "active",
        totalSessions: 0,
        sessionsCompleted: 0,
        totalHours: 0,
        totalPayment: 0,
        paidAmount: 0,
        startDate: "",
        endDate: "",
        sessionDuration: 60,
      };

      allStudents.push(studentWithMentor as Student);
      setIsAddingStudent(false);
      setNewStudent({
        id: "",
        name: "",
        email: "",
        phone: "",
        status: "active",
        mentorId: "",
        totalSessions: 0,
        sessionsCompleted: 0,
        sessionsRemaining: 0,
        totalHours: 0,
        totalPayment: 0,
        paidAmount: 0,
        progressPercentage: 0,
        startDate: "",
        endDate: "",
        sessionDuration: 60,
        teachersPayment: 0,
        hourlyPayment: 0,
        sessionAddedOn: "",
      });
      crudToasts.create.success("Student");
    } catch (error) {
      crudToasts.create.error("Student");
    }
  };

  const handleAssignStudents = () => {
    try {
      // Update the allStudents array directly
      const index = allStudents.findIndex((s) => s.id === editingStudent?.id);
      if (index !== -1) {
        allStudents[index] = {
          ...allStudents[index],
          mentorId: selectedMentor?.user.id || "",
          status: "active",
        };
      }
      setIsAssigningStudents(false);
      setSelectedStudentsToAssign([]);
      crudToasts.update.success("Student assignment");
    } catch (error) {
      crudToasts.update.error("Student assignment");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            My Mentors
          </h1>
          {/* <Button
            onClick={() => setIsAddingMentor(true)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Mentor
          </Button> */}
        </div>

        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Search Mentors</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="space-y-2">
              <Label>Search by Name</Label>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search mentors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredMentors.map((mentor) => {
            const stats = getMentorStats(mentor.id);
            const mentorStudents = allStudents.filter(
              (student) => student.mentorId === mentor.id
            );

            return (
              <Card key={mentor.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">
                        {mentor.name}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {mentor.email}
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm">
                        ID: <span className="font-medium">{mentor.id}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {mentor.phone
                          ? `Phone: ${mentor.phone}`
                          : "No phone number"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Students
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl sm:text-2xl font-bold">
                            {stats.studentCount}
                          </p>
                          <p className="text-sm text-muted-foreground">total</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Students
                        </p>
                        <p className="text-base font-medium">
                          {stats.activeStudents}
                        </p>
                      </div>
                    </div>

                    {mentorStudents.length > 0 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Sessions Progress</span>
                            <span className="font-medium">
                              {stats.sessionProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                stats.sessionProgress === 100
                                  ? "bg-progress-complete"
                                  : stats.sessionProgress >= 75
                                  ? "bg-progress-high"
                                  : stats.sessionProgress >= 40
                                  ? "bg-progress-medium"
                                  : "bg-progress-low"
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
                            <span className="font-medium">
                              {stats.hoursProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                stats.hoursProgress === 100
                                  ? "bg-progress-complete"
                                  : stats.hoursProgress >= 75
                                  ? "bg-progress-high"
                                  : stats.hoursProgress >= 40
                                  ? "bg-progress-medium"
                                  : "bg-progress-low"
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
                            <span className="font-medium">
                              {stats.paymentsProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                stats.paymentsProgress === 100
                                  ? "bg-progress-complete"
                                  : stats.paymentsProgress >= 75
                                  ? "bg-progress-high"
                                  : stats.paymentsProgress >= 40
                                  ? "bg-progress-medium"
                                  : "bg-progress-low"
                              }`}
                              style={{ width: `${stats.paymentsProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              ₹{stats.completedPayments.toLocaleString()}{" "}
                              completed
                            </span>
                            <span>
                              ₹{stats.totalPayments.toLocaleString()} total
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Class Take Amount
                          </p>
                          <div className="w-2 h-2 rounded-full"></div>
                        </div>
                        <div className="space-y-1">
                          <p className="">
                            {formatCurrency(stats.classTakeAmount || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                      <div className="p-3 sm:p-4 rounded-lg border border-indigo-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Expense Ratio</p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{stats.expenseRatio || 0}%</p>
                        </div>
                      </div>
                    </div>

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
      </div>

      {/* View Details Dialog */}
      <Dialog
        open={!!selectedMentor && !isViewingStudents && !isDeletingMentor}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMentor(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {selectedMentor?.user.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  {selectedMentor?.user.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedMentor && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedMentor.stats.studentCount}
                  </p>
                  <p className="text-sm text-muted-foreground">students</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Active Students
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedMentor.stats.activeStudents}
                  </p>
                  <p className="text-sm text-muted-foreground">active</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedMentor.stats.totalHours}
                  </p>
                  <p className="text-sm text-muted-foreground">hours</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Overall Progress
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedMentor.stats.overallProgress}%
                  </p>
                  <p className="text-sm text-muted-foreground">completed</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Sessions & Hours</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <span className="font-medium">
                        {selectedMentor.stats.totalSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Sessions</span>
                      <span className="font-medium">
                        {selectedMentor.stats.completedSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Hours</span>
                      <span className="font-medium">
                        {selectedMentor.stats.totalHours}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Hours</span>
                      <span className="font-medium">
                        {selectedMentor.stats.completedHours}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Payments</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Payments</span>
                      <span className="font-medium">
                        ₹{selectedMentor.stats.totalPayments.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Payments</span>
                      <span className="font-medium">
                        ₹
                        {selectedMentor.stats.completedPayments.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Payments</span>
                      <span className="font-medium">
                        ₹{selectedMentor.stats.pendingPayments.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Financial Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Class Take Amount</span>
                      <span className="font-medium">
                        {formatCurrency(selectedMentor.stats.classTakeAmount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Teacher Salary</span>
                      <span className="font-medium">
                        {formatCurrency(selectedMentor.stats.teacherSalary || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Expense Ratio</span>
                      <span className="font-medium">
                        {selectedMentor.stats.expenseRatio || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Progress Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sessions Progress</span>
                        <span>{selectedMentor.stats.sessionProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.sessionProgress === 100
                              ? "bg-progress-complete"
                              : selectedMentor.stats.sessionProgress >= 75
                              ? "bg-progress-high"
                              : selectedMentor.stats.sessionProgress >= 40
                              ? "bg-progress-medium"
                              : "bg-progress-low"
                          }`}
                          style={{
                            width: `${selectedMentor.stats.sessionProgress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Hours Progress</span>
                        <span>{selectedMentor.stats.hoursProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.hoursProgress === 100
                              ? "bg-progress-complete"
                              : selectedMentor.stats.hoursProgress >= 75
                              ? "bg-progress-high"
                              : selectedMentor.stats.hoursProgress >= 40
                              ? "bg-progress-medium"
                              : "bg-progress-low"
                          }`}
                          style={{
                            width: `${selectedMentor.stats.hoursProgress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Payment Progress</span>
                        <span>{selectedMentor.stats.paymentsProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.paymentsProgress === 100
                              ? "bg-progress-complete"
                              : selectedMentor.stats.paymentsProgress >= 75
                              ? "bg-progress-high"
                              : selectedMentor.stats.paymentsProgress >= 40
                              ? "bg-progress-medium"
                              : "bg-progress-low"
                          }`}
                          style={{
                            width: `${selectedMentor.stats.paymentsProgress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{selectedMentor.stats.overallProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.overallProgress === 100
                              ? "bg-progress-complete"
                              : selectedMentor.stats.overallProgress >= 75
                              ? "bg-progress-high"
                              : selectedMentor.stats.overallProgress >= 40
                              ? "bg-progress-medium"
                              : "bg-progress-low"
                          }`}
                          style={{
                            width: `${selectedMentor.stats.overallProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      <Dialog
        open={isViewingStudents}
        onOpenChange={(open) => {
          if (!open) {
            setIsViewingStudents(false);
            setSelectedMentor(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Assigned Students - {selectedMentor?.user.name}
            </DialogTitle>
            <DialogDescription>
              Manage students assigned to this mentor.
            </DialogDescription>
          </DialogHeader>

          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMentor &&
                  allStudents
                    ?.filter(
                      (student) => student.mentorId === selectedMentor.user.id
                    )
                    .map((student) => {
                      const progress = Math.round(
                        (student.sessionsCompleted / student.totalSessions) *
                          100
                      );
                      const hoursCompleted = Math.round(
                        student.sessionsCompleted * student.sessionDuration
                      );
                      const totalHours = Math.round(
                        student.totalSessions * student.sessionDuration
                      );
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {student.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {student.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
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
                            {student.sessionsCompleted}/{student.totalSessions}
                          </TableCell>
                          <TableCell>
                            {hoursCompleted}/{totalHours}
                          </TableCell>
                          <TableCell>
                            ₹{student.paidAmount.toLocaleString()}/₹
                            {student.totalPayment.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                {(!selectedMentor?.user.id ||
                  allStudents?.filter(
                    (student) => student.mentorId === selectedMentor.user.id
                  ).length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Users className="h-8 w-8 text-muted-foreground/60" />
                        <p className="text-sm text-muted-foreground">
                          No students found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Assign or add new students to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">
              Edit Student
            </DialogTitle>
            <DialogDescription>
              Update the student's information. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-student-id">Student ID</Label>
                  <Input
                    id="edit-student-id"
                    value={editingStudent.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.name}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter student's full name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        email: e.target.value,
                      })
                    }
                    placeholder="student@example.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingStudent.phone}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mentor">Assigned Mentor *</Label>
                  <Input
                    id="edit-mentor"
                    value={selectedMentor?.user.name || ""}
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select
                    value={editingStudent.status}
                    onValueChange={(value) =>
                      setEditingStudent({
                        ...editingStudent,
                        status: value as "active" | "inactive",
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sessions-completed">
                    Completed Sessions *
                  </Label>
                  <Input
                    id="edit-sessions-completed"
                    type="number"
                    min="0"
                    value={editingStudent.sessionsCompleted}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        sessionsCompleted: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-sessions">Total Sessions *</Label>
                  <Input
                    id="edit-total-sessions"
                    type="number"
                    min="0"
                    value={editingStudent.totalSessions}
                    onChange={(e) => {
                      const sessions = parseInt(e.target.value);
                      const duration = editingStudent.sessionDuration || 0;
                      // Calculate total hours based on sessions and duration
                      const hours = Math.round((sessions * duration) / 60);

                      // Calculate end date based on starting date and total sessions
                      const endDate = editingStudent.startDate
                        ? new Date(editingStudent.startDate)
                        : null;
                      if (endDate) {
                        endDate.setDate(endDate.getDate() + sessions - 1);
                      }

                      setEditingStudent({
                        ...editingStudent,
                        totalSessions: sessions,
                        totalHours: hours,
                        endDate: endDate
                          ? endDate.toISOString().split("T")[0]
                          : "",
                      });
                    }}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-hours">Total Hours</Label>
                  <Input
                    id="edit-total-hours"
                    type="number"
                    min="0"
                    value={editingStudent.totalHours}
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-paid-amount">Paid Amount (₹) *</Label>
                  <Input
                    id="edit-paid-amount"
                    type="number"
                    min="0"
                    value={editingStudent.paidAmount}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        paidAmount: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-payment">
                    Total Payment (₹) *
                  </Label>
                  <Input
                    id="edit-total-payment"
                    type="number"
                    min="0"
                    value={editingStudent.totalPayment}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        totalPayment: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pending-payment">
                    Pending Payment (₹)
                  </Label>
                  <Input
                    id="edit-pending-payment"
                    type="number"
                    value={
                      editingStudent.totalPayment - editingStudent.paidAmount
                    }
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-session-duration">
                    Session Duration *
                  </Label>
                  <Select
                    value={
                      editingStudent?.sessionDuration
                        ? editingStudent.sessionDuration.toString()
                        : ""
                    }
                    onValueChange={(value) => {
                      const duration = parseInt(value);
                      const sessions = editingStudent.totalSessions || 0;
                      // Calculate total hours based on sessions and duration
                      const hours = Math.round((sessions * duration) / 60);

                      setEditingStudent({
                        ...editingStudent,
                        sessionDuration: duration,
                        totalHours: hours,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration">
                        {editingStudent?.sessionDuration
                          ? `${editingStudent.sessionDuration} Minutes`
                          : "Select duration"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="45">45 Minutes</SelectItem>
                      <SelectItem value="60">60 Minutes</SelectItem>
                      <SelectItem value="75">75 Minutes</SelectItem>
                      <SelectItem value="90">90 Minutes</SelectItem>
                      <SelectItem value="120">120 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">
                    Session Starting Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingStudent.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingStudent.startDate ? (
                          format(new Date(editingStudent.startDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          editingStudent.startDate
                            ? new Date(editingStudent.startDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          const startDate = date
                            ? date.toISOString().split("T")[0]
                            : "";
                          // Calculate end date based on total sessions (assuming weekly sessions)
                          const endDate = new Date(date);
                          endDate.setDate(
                            endDate.getDate() +
                              (editingStudent.totalSessions - 1) * 7
                          );

                          setEditingStudent({
                            ...editingStudent,
                            startDate,
                            endDate: endDate.toISOString(),
                          });
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date">Session Ending Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-muted",
                          !editingStudent.endDate && "text-muted-foreground"
                        )}
                        disabled
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingStudent.endDate ? (
                          format(new Date(editingStudent.endDate), "PPP")
                        ) : (
                          <span>Auto-calculated</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          editingStudent.endDate
                            ? new Date(editingStudent.endDate)
                            : undefined
                        }
                        disabled
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditStudentOpen(false);
                setEditingStudent(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleEditStudent(editingStudent);
                setIsEditStudentOpen(false);
                setEditingStudent(null);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">
              Add New Student
            </DialogTitle>
            <DialogDescription>
              Fill in the student details below. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  value={newStudent.id}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  placeholder="Enter student's full name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  placeholder="student@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newStudent.phone}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mentor">Assigned Mentor *</Label>
                <Input
                  id="mentor"
                  value={selectedMentor?.user.name || ""}
                  disabled
                  className="w-full bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={newStudent.status}
                  onValueChange={(value) =>
                    setNewStudent({
                      ...newStudent,
                      status: value as "active" | "inactive",
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-sessions">Total Sessions *</Label>
                <Input
                  id="total-sessions"
                  type="number"
                  min="0"
                  value={newStudent.totalSessions}
                  onChange={(e) => {
                    const sessions = parseInt(e.target.value);
                    const duration = newStudent.sessionDuration || 60;
                    const hours = Math.round((sessions * duration) / 60);

                    const endDate = newStudent.startDate
                      ? new Date(newStudent.startDate)
                      : null;
                    if (endDate) {
                      endDate.setDate(endDate.getDate() + (sessions - 1) * 7); // Weekly sessions
                    }

                    setNewStudent({
                      ...newStudent,
                      totalSessions: sessions,
                      totalHours: hours,
                      endDate: endDate ? endDate.toISOString() : "",
                      sessionsCompleted: 0,
                      paidAmount: 0,
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-hours">Total Hours</Label>
                <Input
                  id="total-hours"
                  type="number"
                  min="0"
                  value={newStudent.totalHours}
                  disabled
                  className="w-full bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-payment">Total Payment (₹) *</Label>
                <Input
                  id="total-payment"
                  type="number"
                  min="0"
                  value={newStudent.totalPayment}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      totalPayment: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-duration">Session Duration *</Label>
                <Select
                  value={
                    newStudent?.sessionDuration
                      ? newStudent.sessionDuration.toString()
                      : "60"
                  }
                  onValueChange={(value) => {
                    const duration = parseInt(value);
                    const sessions = newStudent.totalSessions || 0;
                    const hours = Math.round((sessions * duration) / 60);

                    setNewStudent({
                      ...newStudent,
                      sessionDuration: duration,
                      totalHours: hours,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration">
                      {newStudent?.sessionDuration
                        ? `${newStudent.sessionDuration} Minutes`
                        : "60 Minutes"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes</SelectItem>
                    <SelectItem value="75">75 Minutes</SelectItem>
                    <SelectItem value="90">90 Minutes</SelectItem>
                    <SelectItem value="120">120 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Session Starting Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newStudent.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newStudent.startDate ? (
                        format(new Date(newStudent.startDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        newStudent.startDate
                          ? new Date(newStudent.startDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          // Calculate end date based on total sessions (assuming weekly sessions)
                          const endDate = new Date(date);
                          endDate.setDate(
                            endDate.getDate() +
                              (newStudent.totalSessions - 1) * 7
                          );

                          setNewStudent({
                            ...newStudent,
                            startDate: date.toISOString(),
                            endDate: endDate.toISOString(),
                          });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Session Ending Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted",
                        !newStudent.endDate && "text-muted-foreground"
                      )}
                      disabled
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newStudent.endDate ? (
                        format(new Date(newStudent.endDate), "PPP")
                      ) : (
                        <span>Auto-calculated</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        newStudent.endDate
                          ? new Date(newStudent.endDate)
                          : undefined
                      }
                      disabled
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAddingStudent(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleAddStudent} className="w-full sm:w-auto">
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={isAssigningStudents} onOpenChange={setIsAssigningStudents}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Students</DialogTitle>
            <DialogDescription>
              Select students to assign to {selectedMentor?.user.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student-select">Select Students</Label>
              <div className="border rounded-md">
                {allStudents.map((student) => {
                  const currentMentor = users.find(
                    (u) => u.id === student.mentorId
                  );
                  const isSelected = selectedStudentsToAssign.includes(
                    student.id
                  );

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudentsToAssign([
                                ...selectedStudentsToAssign,
                                student.id,
                              ]);
                            } else {
                              setSelectedStudentsToAssign(
                                selectedStudentsToAssign.filter(
                                  (id) => id !== student.id
                                )
                              );
                            }
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {currentMentor
                              ? `Currently assigned to: ${currentMentor.name}`
                              : "Not assigned to any mentor"}
                          </span>
                        </div>
                      </div>
                      <Badge variant={student.mentorId ? "default" : "outline"}>
                        {student.mentorId ? "Assigned" : "Unassigned"}
                      </Badge>
                    </div>
                  );
                })}
                {allStudents.length === 0 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No students available
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssigningStudents(false);
                setSelectedStudentsToAssign([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignStudents}
              disabled={selectedStudentsToAssign.length === 0}
            >
              {selectedStudentsToAssign.length > 0
                ? `Assign ${selectedStudentsToAssign.length} Student${
                    selectedStudentsToAssign.length === 1 ? "" : "s"
                  }`
                : "Assign Students"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeletingMentor} onOpenChange={setIsDeletingMentor}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMentor?.user.name}'s profile
              and remove all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeletingMentor(false);
                setSelectedMentor(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMentor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Mentor Dialog */}
      <Dialog open={isEditingMentor} onOpenChange={setIsEditingMentor}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              Edit Mentor
            </DialogTitle>
            <DialogDescription className="text-sm">
              Update the mentor's information. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          {editingMentor && (
            <div className="grid gap-4 sm:gap-6 py-3 sm:py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="edit-mentor-id" className="text-sm">
                    Mentor ID
                  </Label>
                  <Input
                    id="edit-mentor-id"
                    value={editingMentor.id}
                    disabled
                    className="bg-muted text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="edit-name" className="text-sm">
                    Full Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingMentor.name}
                    onChange={(e) =>
                      setEditingMentor({
                        ...editingMentor,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter mentor's full name"
                    className="w-full text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="edit-email" className="text-sm">
                    Email Address *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingMentor.email}
                    onChange={(e) =>
                      setEditingMentor({
                        ...editingMentor,
                        email: e.target.value,
                      })
                    }
                    placeholder="mentor@example.com"
                    className="w-full text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm">
                    Phone Number *
                  </Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingMentor.phone}
                    onChange={(e) =>
                      setEditingMentor({
                        ...editingMentor,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="edit-status" className="text-sm">
                    Status *
                  </Label>
                  <Select
                    value={editingMentor.status}
                    onValueChange={(value) =>
                      setEditingMentor({
                        ...editingMentor,
                        status: value as "active" | "inactive",
                      })
                    }
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="edit-password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingMentor.password || ""}
                    onChange={(e) =>
                      setEditingMentor({
                        ...editingMentor,
                        password: e.target.value,
                      })
                    }
                    placeholder="Leave blank to keep current password"
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingMentor(false);
                setEditingMentor(null);
              }}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMentor}
              className="w-full sm:w-auto text-sm"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Mentor Dialog */}
      <Dialog open={isAddingMentor} onOpenChange={setIsAddingMentor}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              Add New Mentor
            </DialogTitle>
            <DialogDescription className="text-sm">
              Fill in the mentor details below. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:gap-6 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="mentor-id" className="text-sm">
                  Mentor ID
                </Label>
                <Input
                  id="mentor-id"
                  value={newMentor.id}
                  disabled
                  className="bg-muted text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={newMentor.name}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, name: e.target.value })
                  }
                  placeholder="Enter mentor's full name"
                  className="w-full text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newMentor.email}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, email: e.target.value })
                  }
                  placeholder="mentor@example.com"
                  className="w-full text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newMentor.phone}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="status" className="text-sm">
                  Status *
                </Label>
                <Select
                  value={newMentor.status}
                  onValueChange={(value) =>
                    setNewMentor({
                      ...newMentor,
                      status: value as "active" | "inactive",
                    })
                  }
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password *
                </Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="useDefaultPassword"
                      checked={newMentor.useDefaultPassword}
                      onCheckedChange={(checked) => {
                        setNewMentor({
                          ...newMentor,
                          useDefaultPassword: checked as boolean,
                          password: checked
                            ? generateDefaultPassword(
                                newMentor.name,
                                newMentor.phone
                              )
                            : "",
                        });
                      }}
                    />
                    <Label htmlFor="useDefaultPassword" className="text-sm">
                      Use default password (first 3 letters of name + last 4
                      digits of phone)
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={newMentor.password}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, password: e.target.value })
                    }
                    placeholder="Enter mentor's password"
                    className="w-full text-sm"
                    disabled={newMentor.useDefaultPassword}
                  />
                  {newMentor.useDefaultPassword && (
                    <p className="text-xs text-muted-foreground">
                      Default password will be:{" "}
                      {generateDefaultPassword(newMentor.name, newMentor.phone)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddingMentor(false)}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMentor}
              className="w-full sm:w-auto text-sm"
            >
              Create Mentor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <AlertDialog open={isDeletingStudent} onOpenChange={setIsDeletingStudent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingStudent?.name}'s profile and
              remove all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeletingStudent(false);
                setDeletingStudent(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingStudent) {
                  handleDeleteStudent(deletingStudent);
                  setIsDeletingStudent(false);
                  setDeletingStudent(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CoordinatorMentors;
