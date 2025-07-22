import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents, users } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, UserSearch, Edit, Trash2, Plus } from "lucide-react";
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
import { crudToasts } from "@/lib/toast";

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
    progressPercentage: 0,
  });

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

  const handleAddStudent = () => {
    try {
      // Validate required fields
      if (!newStudent.name || !newStudent.email || !newStudent.phone) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      setStudents([...students, newStudent]);
      setIsAddingStudent(false);
      setNewStudent({
        ...newStudent,
        id: `student${students.length + 2}`,
        name: "",
        email: "",
        phone: "",
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
      });
      crudToasts.create.success("Student");
    } catch (error) {
      crudToasts.create.error("Student");
    }
  };

  const handleAssignMentor = (studentId: string, mentorId: string) => {
    try {
      setStudents(
        students.map((student) =>
          student.id === studentId ? { ...student, mentorId } : student
        )
      );
      crudToasts.assign.success("Student", "Mentor");
    } catch (error) {
      crudToasts.assign.error("Student", "Mentor");
    }
  };

  const handleUnassignMentor = (studentId: string) => {
    try {
      setStudents(
        students.map((student) =>
          student.id === studentId ? { ...student, mentorId: "" } : student
        )
      );
      crudToasts.unassign.success("Student", "Mentor");
    } catch (error) {
      crudToasts.unassign.error("Student", "Mentor");
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search by Name</Label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search students..."
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
                <Label>Filter by Mentor</Label>
                <Select value={mentorFilter} onValueChange={setMentorFilter}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentors</SelectItem>
                    {myMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Filter by Date</Label>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
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
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <Input
                        type="date"
                        value={customDateRange.from}
                        onChange={(e) =>
                          setCustomDateRange((r) => ({
                            ...r,
                            from: e.target.value,
                          }))
                        }
                        className="text-xs px-2 py-1 w-full sm:w-[120px]"
                      />
                      <span className="mx-1 text-xs">to</span>
                      <Input
                        type="date"
                        value={customDateRange.to}
                        onChange={(e) =>
                          setCustomDateRange((r) => ({
                            ...r,
                            to: e.target.value,
                          }))
                        }
                        className="text-xs px-2 py-1 w-full sm:w-[120px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredStudents.map((student) => {
            const stats = getStudentStats(student);
            return (
              <Card key={student.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">
                        {student.name}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm">
                        ID: <span className="font-medium">{student.id}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {student.phone
                          ? `Phone: ${student.phone}`
                          : "No phone number"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Mentor</p>
                        <p className="text-base font-medium truncate">
                          {getMentorName(student.mentorId)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            student.status === "active"
                              ? "bg-green-100 text-palette-accent"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>
                    </div>

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
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{student.sessionsCompleted} completed</span>
                          <span>{student.totalSessions} total</span>
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
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.completedHours} completed</span>
                          <span>{student.totalHours} total</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Payment Progress</span>
                          <span className="font-medium">
                            {stats.paymentProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.paymentProgress === 100
                                ? "bg-palette-info"
                                : stats.paymentProgress >= 75
                                ? "bg-palette-accent"
                                : stats.paymentProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${stats.paymentProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            ₹{(student.paidAmount || 0).toLocaleString()} paid
                          </span>
                          <span>
                            ₹{(student.totalPayment || 0).toLocaleString()}{" "}
                            total
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Progress</span>
                          <span className="font-medium">
                            {stats.overallProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.overallProgress === 100
                                ? "bg-palette-info"
                                : stats.overallProgress >= 75
                                ? "bg-palette-accent"
                                : stats.overallProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${stats.overallProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Remaining Sessions
                          </p>
                          <div className="w-2 h-2 rounded-full"></div>
                        </div>
                        <div className="space-y-1">
                          <p className="">
                            {student.totalSessions - student.sessionsCompleted}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Pending Payment
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="">
                            ₹{(stats.pendingPayment || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Remaining Sessions</p>
                        <p className="text-lg font-medium mt-1">{student.totalSessions - student.sessionsCompleted}</p>
                      </div>
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pending Payment</p>
                        <p className="text-lg font-medium mt-1">₹{(stats.pendingPayment || 0).toLocaleString()}</p>
                      </div>
                    </div> */}

                    <div className="grid grid-cols-3 gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
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
      <Dialog
        open={!!selectedStudent && !isDeletingStudent}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Select
                  value={newStudent.mentorId}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, mentorId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {myMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      totalSessions: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-hours">Total Hours *</Label>
                <Input
                  id="total-hours"
                  type="number"
                  min="0"
                  value={newStudent.totalHours}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      totalHours: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
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

      {/* Edit Student Dialog */}
      <Dialog open={isEditingStudent} onOpenChange={setIsEditingStudent}>
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
                  <Select
                    value={editingStudent.mentorId}
                    onValueChange={(value) =>
                      setEditingStudent({
                        ...editingStudent,
                        mentorId: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {myMentors.map((mentor) => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          {mentor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        totalSessions: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-hours">Total Hours *</Label>
                  <Input
                    id="edit-total-hours"
                    type="number"
                    min="0"
                    value={editingStudent.totalHours}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        totalHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingStudent(false);
                setEditingStudent(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeletingStudent} onOpenChange={setIsDeletingStudent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedStudent?.name}'s profile and
              remove all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeletingStudent(false);
                setSelectedStudent(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
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

export default CoordinatorStudents;
