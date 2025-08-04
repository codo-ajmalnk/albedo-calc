import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, UserSearch, Edit, Trash2, Plus, Mail, Phone, MessageCircle, Printer, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { crudToasts } from "@/lib/toast";
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
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TeacherAssignmentDialog from "@/components/dialog/TeacherAssignmentDialog";
import PackageAssignmentDialog from "@/components/dialog/PackageAssignmentDialog";

const MentorStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // Add time filter and custom date range state for student filtering
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [dialogStudent, setDialogStudent] = useState<Student | null>(null);

  if (!user) return null;

  // Get students for this mentor
  const myStudents = students.filter((student) => student.mentorId === user.id);

  const filteredStudents = myStudents.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              My Students
            </h1>
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
              {filteredStudents.length} Total
            </span>
          </div>
        </div>

        <Card className="w-full border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <UserSearch className="h-5 w-5" />
              Search Students
            </CardTitle>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        onClick={() => {
                          setDialogStudent(student);
                          setIsPackageDialogOpen(true);
                        }}
                      >
                        Packages
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => {
                          setDialogStudent(student);
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

          {filteredStudents.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-lg border-2 border-dashed min-h-[200px]">
              <UserSearch className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">
                No students found matching your search.
              </p>
              <Button
                variant="link"
                onClick={() => setSearch("")}
                className="mt-2 text-sm"
              >
                Clear search
              </Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                  {selectedStudent?.name}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  {selectedStudent?.email}
                </DialogDescription>
              </div>
              <span
                className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  selectedStudent?.status === "active"
                    ? "bg-palette-info text-palette-info-foreground"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedStudent?.status}
              </span>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudent.totalSessions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    sessions
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudent.sessionsCompleted}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    sessions done
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Hours</p>
                  <p className="text-2xl font-bold mt-1">
                    {selectedStudent.totalHours}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    total hours
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold mt-1">
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
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    overall
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Sessions & Hours
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">
                        Total Sessions
                      </span>
                      <span className="font-bold">
                        {selectedStudent.totalSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">
                        Completed Sessions
                      </span>
                      <span className="font-bold">
                        {selectedStudent.sessionsCompleted}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Total Hours</span>
                      <span className="font-bold">
                        {selectedStudent.totalHours}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">
                        Completed Hours
                      </span>
                      <span className="font-bold">
                        {Math.round(
                          (selectedStudent.totalHours *
                            selectedStudent.sessionsCompleted) /
                            selectedStudent.totalSessions
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Payments
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Total Payment</span>
                      <span className="font-bold">
                        ₹{(selectedStudent?.totalPayment || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Paid Amount</span>
                      <span className="font-bold">
                        ₹{(selectedStudent?.paidAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">
                        Pending Payment
                      </span>
                      <span className="font-bold text-destructive">
                        ₹
                        {(
                          (selectedStudent?.totalPayment || 0) -
                          (selectedStudent?.paidAmount || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Progress Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Sessions Progress</span>
                        <span className="font-bold">
                          {Math.round(
                            (selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
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

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Hours Progress</span>
                        <span className="font-bold">
                          {Math.round(
                            (selectedStudent.sessionsCompleted /
                              selectedStudent.totalSessions) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
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

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Payment Progress</span>
                        <span className="font-bold">
                          {Math.round(
                            (selectedStudent.paidAmount /
                              selectedStudent.totalPayment) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
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
        teachers={
          dialogStudent
            ? [
                {
                  id: dialogStudent.teacherId,
                  name: "Teacher Name", // Replace with actual lookup if available
                  status: "active",
                  totalSessions: dialogStudent.totalSessions,
                  completedSessions: dialogStudent.sessionsCompleted,
                  totalHours: dialogStudent.totalHours,
                  completedHours: dialogStudent.completedHours ?? 0,
                  salary: dialogStudent.teacherSalary ?? 0,
                  paidAmount: dialogStudent.teachersPayment ?? 0,
                  durationDays: 90,
                  progress: dialogStudent.progressPercentage ?? 0,
                },
              ]
            : []
        }
        userRole={user?.role || "mentor"}
      />
      {dialogStudent && (
        <PackageAssignmentDialog
          open={isPackageDialogOpen}
          onOpenChange={setIsPackageDialogOpen}
          packages={[
            {
              id: dialogStudent.packageId,
              name: "Package Name", // Replace with actual lookup if available
              sessions: dialogStudent.totalSessions,
              completedSessions: dialogStudent.sessionsCompleted,
              hours: dialogStudent.totalHours,
              completedHours: dialogStudent.completedHours ?? 0,
              payment: dialogStudent.totalPayment,
              paidAmount: dialogStudent.paidAmount,
              progress: dialogStudent.progressPercentage ?? 0,
              durationDays: 90,
              teacherName: "Teacher Name", // Replace with actual lookup if available
              teacherPhone: dialogStudent.phone,
            },
          ]}
          userRole={user?.role || "mentor"}
        />
      )}
    </DashboardLayout>
  );
};

export default MentorStudents;
