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
import { Eye, Users, Edit, Trash2, Plus, UserPlus, Mail, Phone, MessageCircle, TrendingUp, Lightbulb, Printer, Download } from "lucide-react";
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
import StudentAssignmentDialog from "@/components/dialog/StudentAssignmentDialog";
import TeacherAssignmentDialog from "@/components/dialog/TeacherAssignmentDialog";

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
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);
  // Add time filter and custom date range state for mentor filtering
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
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
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<
    string[]
  >([]);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [studentDialogMentor, setStudentDialogMentor] = useState<User | null>(null);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);

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
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-end">
              {/* Search by Name */}
              <div className="w-full md:flex-1 min-w-[180px]">
                <Label className="mb-1 block">Search by Name</Label>
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm"
                />
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
            const mentorStudents = allStudents.filter(
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
                          href={`https://wa.me/${(mentor.phone || "").replace(/[\d]/g, "")}?text=${encodeURIComponent(
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
                    <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">Students</p>
                        <p className="text-2xl font-bold break-words text-center">{stats.studentCount}</p>
                      </div>
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">Active Students</p>
                        <p className="text-2xl font-bold break-words text-center">{stats.activeStudents}</p>
                      </div>
                    </div>
                    {/* Progress Bars - Each in its own row with motivational icon */}
                    <div className="flex flex-col gap-4 w-full pt-4">
                      {/* Sessions Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div className="absolute top-3 right-4" title="Keep going! Complete your sessions!">
                          <TrendingUp className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Sessions</p>
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
                              {stats.completedSessions}/{stats.totalSessions} ({stats.sessionProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {stats.totalSessions - stats.completedSessions} ({100 - stats.sessionProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Hours Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div className="absolute top-3 right-4" title="Keep going! Complete your hours!">
                          <Lightbulb className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Hours</p>
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
                              {stats.completedHours}/{stats.totalHours} ({stats.hoursProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {stats.totalHours - stats.completedHours} ({100 - stats.hoursProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Payments Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div className="absolute top-3 right-4" title="Keep going! Complete your payments!">
                          <TrendingUp className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Payments</p>
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
                              ₹{stats.completedPayments.toLocaleString()}/₹{stats.totalPayments.toLocaleString()} ({stats.paymentsProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              ₹{(stats.totalPayments - stats.completedPayments).toLocaleString()} ({100 - stats.paymentsProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Financial Stats - Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      {/* Class Take Amount */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Class Take Amount</p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{formatCurrency(stats.classTakeAmount || 0)}</p>
                        </div>
                      </div>
                      {/* Teacher Salary */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Teacher Salary</p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{formatCurrency(stats.teacherSalary || 0)}</p>
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
                        onClick={() => {
                          setSelectedMentor({ user: mentor, stats });
                          setIsStudentDialogOpen(true);
                        }}
                      >
                        Students
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => {
                          setSelectedMentor({ user: mentor, stats });
                          setIsTeacherDialogOpen(true);
                        }}
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
      </div>

      {/* View Details Dialog */}
      {/* <Dialog
        open={!!selectedMentor && !isViewingStudents && !isDeletingMentor}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMentor(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-scroll hide-scrollbar">
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
                              ? "bg-palette-info"
                              : selectedMentor.stats.sessionProgress >= 75
                              ? "bg-palette-accent"
                              : selectedMentor.stats.sessionProgress >= 40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
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
                              ? "bg-palette-info"
                              : selectedMentor.stats.hoursProgress >= 75
                              ? "bg-palette-accent"
                              : selectedMentor.stats.hoursProgress >= 40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
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
                              ? "bg-palette-info"
                              : selectedMentor.stats.paymentsProgress >= 75
                              ? "bg-palette-accent"
                              : selectedMentor.stats.paymentsProgress >= 40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
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
                              ? "bg-palette-info"
                              : selectedMentor.stats.overallProgress >= 75
                              ? "bg-palette-accent"
                              : selectedMentor.stats.overallProgress >= 40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
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
      </Dialog> */}

      <StudentAssignmentDialog
        open={isStudentDialogOpen}
        onOpenChange={setIsStudentDialogOpen}
        coordinator={selectedMentor ? { user: selectedMentor.user } : undefined}
        getStudents={(mentorId) => allStudents.filter(s => s.mentorId === mentorId)}
        users={users}
        userRole="mentor"
      />
      <TeacherAssignmentDialog
        open={isTeacherDialogOpen}
        onOpenChange={setIsTeacherDialogOpen}
        teachers={
          selectedMentor
            ? (() => {
                const mentorStudents = allStudents.filter(s => s.mentorId === selectedMentor.user.id);
                const teacherIds = Array.from(new Set(mentorStudents.map(s => s.teacherId)));
                return users.filter(u => u.role === "teacher" && teacherIds.includes(u.id)).map((t) => ({
                  id: t.id,
                  name: t.name,
                  status: t.status || "active",
                  totalSessions: 0,
                  totalHours: 0,
                  salary: 0,
                  completedSessions: 0,
                  completedHours: 0,
                  paidAmount: 0,
                  durationDays: 0,
                  progress: 0,
                }));
              })()
            : []
        }
        userRole="mentor"
      />
    </DashboardLayout>
  );
};

export default CoordinatorMentors;
