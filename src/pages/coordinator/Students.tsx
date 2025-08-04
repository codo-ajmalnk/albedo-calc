import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents, users } from "@/lib/mock-data";
import { packages } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, UserSearch, Edit, Trash2, Plus, Mail, Phone, MessageCircle, Printer, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { crudToasts } from "@/lib/toast";
import TeacherAssignmentDialog from "@/components/dialog/TeacherAssignmentDialog";
import PackageAssignmentDialog from "@/components/dialog/PackageAssignmentDialog";

type TeacherDialogData = {
  id: string;
  name: string;
  status: "active" | "inactive";
  totalSessions: number;
  completedSessions: number;
  totalHours: number;
  completedHours: number;
  salary: number;
  paidAmount: number;
  durationDays: number;
  progress: number;
};

const CoordinatorStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [search, setSearch] = useState("");
  const [mentorFilter, setMentorFilter] = useState("all");
  // Add time filter and custom date range state for student filtering
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [teacherDialogTeachers, setTeacherDialogTeachers] = useState<TeacherDialogData[]>([]);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [packageDialogStudent, setPackageDialogStudent] = useState<Student | null>(null);


  if (!user) return null;

  // Get mentors under this coordinator
  const myMentors = users.filter(
    (u) => u.role === "mentor" && u.supervisorId === user.id
  );

  const mentorIds = myMentors.map((mentor) => mentor.id);

  // Filter students under those mentors
  const myStudents = students.filter((student) =>
    mentorIds.includes(student.mentorId)
  );

  const filteredStudents = myStudents.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesMentor =
      mentorFilter === "all" || student.mentorId === mentorFilter;
    return matchesSearch && matchesMentor;
  });

  const getMentorName = (mentorId: string) => {
    const mentor = users.find((user) => user.id === mentorId);
    return mentor ? mentor.name : "Unknown Mentor";
  };

  const getStudentStats = (student: Student) => {
    const sessionProgress = Math.round(
      (student.sessionsCompleted / student.totalSessions) * 100
    );
    const hoursProgress = Math.round(
      (student.sessionsCompleted / student.totalSessions) * 100
    );
    const paymentProgress = Math.round(
      (student.paidAmount / student.totalPayment) * 100
    );
    const overallProgress = Math.round(
      (sessionProgress + hoursProgress + paymentProgress) / 3
    );

    return {
      sessionProgress,
      hoursProgress,
      paymentProgress,
      overallProgress,
      completedHours: Math.round(
        (student.totalHours * student.sessionsCompleted) / student.totalSessions
      ),
      pendingPayment: student.totalPayment - student.paidAmount,
    };
  };

  const handleViewTeachers = (student: Student) => {
    const teacher = users.find(u => u.role === "teacher" && u.id === student.teacherId);
    if (teacher) {
      setTeacherDialogTeachers([
        {
          id: teacher.id,
          name: teacher.name,
          status: teacher.status === "inactive" ? "inactive" : "active",
          totalSessions: student.totalSessions,
          completedSessions: student.sessionsCompleted,
          totalHours: student.totalHours,
          completedHours: Math.round((student.totalHours * student.sessionsCompleted) / student.totalSessions),
          salary: student.teacherSalary ?? 0,
          paidAmount: student.teachersPayment ?? 0,
          durationDays: 90,
          progress: Math.round((student.sessionsCompleted / student.totalSessions) * 100),
        },
      ]);
      setIsTeacherDialogOpen(true);
    } else {
      alert("No teacher assigned to this student.");
    }
  };

  const handleViewPackages = (student: Student) => {
    setPackageDialogStudent(student);
    setIsPackageDialogOpen(true);
  };


  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            My Students
          </h1>
        </div>

        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Students</CardTitle>
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
                  value={mentorFilter}
                  onValueChange={setMentorFilter}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentors</SelectItem>
                    {myMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name} ({mentor.id})
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
                          selected={customDateRange.from ? new Date(customDateRange.from) : undefined}
                          onSelect={(date) =>
                            setCustomDateRange((r) => ({
                              ...r,
                              from: date ? date.toLocaleDateString("en-CA") : "",
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
                          selected={customDateRange.to ? new Date(customDateRange.to) : undefined}
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
            // Progress/stat calculations (copied and adapted from admin/Students.tsx)
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
                    {/* Progress Bars */}
                    <div className="flex flex-col gap-4 w-full pt-4">
                      {/* Sessions Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your sessions!"
                        >
                          <span role="img" aria-label="Trending Up">📈</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Sessions</p>
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
                              {student.sessionsCompleted}/{student.totalSessions} ({sessionsProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {student.totalSessions - student.sessionsCompleted} ({100 - sessionsProgress}%)
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
                          <span role="img" aria-label="Lightbulb">💡</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Hours</p>
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
                              {completedHours}/{student.totalHours} ({hoursProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {student.totalHours - completedHours} ({100 - hoursProgress}%)
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
                          <span role="img" aria-label="Trending Up">📈</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Payments</p>
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
                              ₹{student.paidAmount.toLocaleString()}/₹{student.totalPayment.toLocaleString()} ({paymentProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              ₹{(student.totalPayment - student.paidAmount).toLocaleString()} ({100 - paymentProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Financial Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      {/* Class Take Amount */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Class Take Amount</p>
                        </div>
                        <div className="space-y-1">
                          <p>₹{classTakeAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      {/* Teacher Salary */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Teacher Salary</p>
                        </div>
                        <div className="space-y-1">
                          <p>₹{teacherSalary.toLocaleString()}</p>
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
                        onClick={() => handleViewPackages(student)}
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
      </div>

      {/* View Details Dialog */}
      {/* <Dialog
        open={!!selectedStudent && !isDeletingStudent}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {selectedStudent?.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  {selectedStudent?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudent.totalSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">sessions</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Completed Sessions
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudent.sessionsCompleted}
                  </p>
                  <p className="text-sm text-muted-foreground">completed</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mentor</p>
                  <p className="text-2xl font-bold mt-1 truncate">
                    {getMentorName(selectedStudent.mentorId)}
                  </p>
                  <p className="text-sm text-muted-foreground">assigned to</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudent.status}
                  </p>
                  <p className="text-sm text-muted-foreground">current</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Sessions & Hours</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <span className="font-medium">
                        {selectedStudent.totalSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Sessions</span>
                      <span className="font-medium">
                        {selectedStudent.sessionsCompleted}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Hours</span>
                      <span className="font-medium">
                        {selectedStudent.totalHours}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Hours</span>
                      <span className="font-medium">
                        {Math.round(
                          (selectedStudent.totalHours *
                            selectedStudent.sessionsCompleted) /
                            selectedStudent.totalSessions
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Payments</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Payment</span>
                      <span className="font-medium">
                        ₹{(selectedStudent?.totalPayment || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Paid Amount</span>
                      <span className="font-medium">
                        ₹{(selectedStudent?.paidAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Payment</span>
                      <span className="font-medium">
                        ₹
                        {(
                          (selectedStudent?.totalPayment || 0) -
                          (selectedStudent?.paidAmount || 0)
                        ).toLocaleString()}
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
                        <span>
                          {Math.round(
                            (selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100 ===
                            100
                              ? "bg-palette-info"
                              : (selectedStudent.sessionsCompleted /
                                  selectedStudent.totalSessions) *
                                  100 >=
                                75
                              ? "bg-palette-accent"
                              : (selectedStudent.sessionsCompleted /
                                  selectedStudent.totalSessions) *
                                  100 >=
                                40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
                          }`}
                          style={{
                            width: `${
                              (selectedStudent.sessionsCompleted /
                                selectedStudent.totalSessions) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Hours Progress</span>
                        <span>
                          {Math.round(
                            (selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100 ===
                            100
                              ? "bg-palette-info"
                              : (selectedStudent.sessionsCompleted /
                                  selectedStudent.totalSessions) *
                                  100 >=
                                75
                              ? "bg-palette-accent"
                              : (selectedStudent.sessionsCompleted /
                                  selectedStudent.totalSessions) *
                                  100 >=
                                40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
                          }`}
                          style={{
                            width: `${
                              (selectedStudent.sessionsCompleted /
                                selectedStudent.totalSessions) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Payment Progress</span>
                        <span>
                          {Math.round(
                            (selectedStudent.paidAmount /
                              selectedStudent.totalPayment) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (selectedStudent.paidAmount /
                              selectedStudent.totalPayment) *
                              100 ===
                            100
                              ? "bg-palette-info"
                              : (selectedStudent.paidAmount /
                                  selectedStudent.totalPayment) *
                                  100 >=
                                75
                              ? "bg-palette-accent"
                              : (selectedStudent.paidAmount /
                                  selectedStudent.totalPayment) *
                                  100 >=
                                40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
                          }`}
                          style={{
                            width: `${
                              (selectedStudent.paidAmount /
                                selectedStudent.totalPayment) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>
                          {Math.round(
                            ((selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100 +
                              (selectedStudent.sessionsCompleted /
                                selectedStudent.totalSessions) *
                                100 +
                              (selectedStudent.paidAmount /
                                selectedStudent.totalPayment) *
                                100) /
                              3
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            ((selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100 +
                              (selectedStudent.sessionsCompleted /
                                selectedStudent.totalSessions) *
                                100 +
                              (selectedStudent.paidAmount /
                                selectedStudent.totalPayment) *
                                100) /
                              3 ===
                            100
                              ? "bg-palette-info"
                              : ((selectedStudent.sessionsCompleted /
                                  selectedStudent.totalSessions) *
                                  100 +
                                  (selectedStudent.sessionsCompleted /
                                    selectedStudent.totalSessions) *
                                    100 +
                                  (selectedStudent.paidAmount /
                                    selectedStudent.totalPayment) *
                                    100) /
                                  3 >=
                                75
                              ? "bg-palette-accent"
                              : ((selectedStudent.sessionsCompleted /
                                  selectedStudent.totalSessions) *
                                  100 +
                                  (selectedStudent.sessionsCompleted /
                                    selectedStudent.totalSessions) *
                                    100 +
                                  (selectedStudent.paidAmount /
                                    selectedStudent.totalPayment) *
                                    100) /
                                  3 >=
                                40
                              ? "bg-palette-warning"
                              : "bg-palette-danger"
                          }`}
                          style={{
                            width: `${
                              ((selectedStudent.sessionsCompleted /
                                selectedStudent.totalSessions) *
                                100 +
                                (selectedStudent.sessionsCompleted /
                                  selectedStudent.totalSessions) *
                                  100 +
                                (selectedStudent.paidAmount /
                                  selectedStudent.totalPayment) *
                                  100) /
                              3
                            }%`,
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
      <TeacherAssignmentDialog
        open={isTeacherDialogOpen}
        onOpenChange={setIsTeacherDialogOpen}
        teachers={teacherDialogTeachers}
        userRole={user.role}
      />
      {packageDialogStudent && (
        <PackageAssignmentDialog
          open={isPackageDialogOpen}
          onOpenChange={setIsPackageDialogOpen}
          packages={[
            ...packages
              .filter(pkg => pkg.id === packageDialogStudent.packageId)
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
                teacherName: users.find(u => u.id === pkg.teacherId)?.name || "Unknown",
                teacherPhone: users.find(u => u.id === pkg.teacherId)?.phone || "Unknown",
              }))
          ]}
          userRole={user.role}
        />
      )}
    </DashboardLayout>
  );
};

export default CoordinatorStudents;

