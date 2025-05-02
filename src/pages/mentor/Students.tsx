import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, UserSearch, Edit, Trash2, Plus } from "lucide-react";
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

const MentorStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<Student>({
    id: `student${students.length + 1}`,
    name: "",
    email: "",
    phone: "",
    mentorId: user?.id || "",
    status: "active" as const,
    totalSessions: 12,
    sessionsCompleted: 0,
    totalHours: 24,
    totalPayment: 12000,
    paidAmount: 0,
    sessionsRemaining: 12,
    progressPercentage: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    sessionDuration: 60
  });

  if (!user) return null;

  // Get students for this mentor
  const myStudents = students.filter((student) => student.mentorId === user.id);

  const filteredStudents = myStudents.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStudentStats = (student: Student) => {
    const sessionProgress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
    const hoursProgress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
    const paymentProgress = Math.round((student.paidAmount / student.totalPayment) * 100);
    const overallProgress = Math.round((sessionProgress + hoursProgress + paymentProgress) / 3);

    return {
      sessionProgress,
      hoursProgress,
      paymentProgress,
      overallProgress,
      completedHours: Math.round((student.totalHours * student.sessionsCompleted) / student.totalSessions),
      pendingPayment: student.totalPayment - student.paidAmount
    };
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditingStudent(true);
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

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeletingStudent(true);
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
        sessionDuration: 60
      });
      crudToasts.create.success("Student");
    } catch (error) {
      crudToasts.create.error("Student");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">My Students</h1>
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
              {filteredStudents.length} Total
            </span>
          </div>
          <Button
            onClick={() => setIsAddingStudent(true)}
            className="w-full sm:w-auto text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Student
          </Button>
        </div>

        <Card className="w-full border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <UserSearch className="h-5 w-5" />
              Search Students
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Search by Name</Label>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredStudents.map((student) => {
            const stats = getStudentStats(student);
            return (
              <Card key={student.id} className="flex flex-col border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg sm:text-xl font-bold">{student.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1.5">
                      <p className="text-sm">ID: <span className="font-medium">{student.id}</span></p>
                      <p className="text-sm text-muted-foreground">
                        {student.phone ? `Phone: ${student.phone}` : 'No phone number'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 sm:p-6 pt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {student.status}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                        <p className="text-base font-medium">{stats.overallProgress}%</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2.5">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">Sessions Progress</span>
                          <span className="font-bold">{stats.sessionProgress}%</span>
                        </div>
                        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${stats.sessionProgress === 100
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
                          <span>{student.sessionsCompleted} completed</span>
                          <span>{student.totalSessions} total</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">Hours Progress</span>
                          <span className="font-bold">{stats.hoursProgress}%</span>
                        </div>
                        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${stats.hoursProgress === 100
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
                          <span>{student.totalHours} total</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">Payment Progress</span>
                          <span className="font-bold">{stats.paymentProgress}%</span>
                        </div>
                        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${stats.paymentProgress === 100
                                ? 'bg-progress-complete'
                                : stats.paymentProgress >= 75
                                  ? 'bg-progress-high'
                                  : stats.paymentProgress >= 40
                                    ? 'bg-progress-medium'
                                    : 'bg-progress-low'
                              }`}
                            style={{ width: `${stats.paymentProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>₹{(student.paidAmount || 0).toLocaleString()} paid</span>
                          <span>₹{(student.totalPayment || 0).toLocaleString()} total</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">Remaining Sessions</p>
                        <p className="text-lg font-bold">{student.totalSessions - student.sessionsCompleted}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/10">
                        <p className="text-sm text-muted-foreground mb-1">Pending Payment</p>
                        <p className="text-lg font-bold">₹{(stats.pendingPayment || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm hover:bg-muted/80"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm hover:bg-muted/80"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full text-xs sm:text-sm hover:bg-destructive/90"
                        onClick={() => handleDeleteStudent(student)}
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
      <Dialog
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
              <span className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full ${selectedStudent?.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                }`}>
                {selectedStudent?.status}
              </span>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold mt-1">{selectedStudent.totalSessions}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">sessions</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold mt-1">{selectedStudent.sessionsCompleted}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">sessions done</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Hours</p>
                  <p className="text-2xl font-bold mt-1">{selectedStudent.totalHours}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">total hours</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold mt-1">
                    {Math.round(((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                      (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                      (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100) / 3)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">overall</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">Sessions & Hours</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Total Sessions</span>
                      <span className="font-bold">{selectedStudent.totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Completed Sessions</span>
                      <span className="font-bold">{selectedStudent.sessionsCompleted}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Total Hours</span>
                      <span className="font-bold">{selectedStudent.totalHours}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Completed Hours</span>
                      <span className="font-bold">
                        {Math.round((selectedStudent.totalHours * selectedStudent.sessionsCompleted) / selectedStudent.totalSessions)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">Payments</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Total Payment</span>
                      <span className="font-bold">₹{(selectedStudent?.totalPayment || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Paid Amount</span>
                      <span className="font-bold">₹{(selectedStudent?.paidAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/5">
                      <span className="text-sm font-medium">Pending Payment</span>
                      <span className="font-bold text-destructive">₹{((selectedStudent?.totalPayment || 0) - (selectedStudent?.paidAmount || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight">Progress Overview</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Sessions Progress</span>
                        <span className="font-bold">{Math.round((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 === 100
                              ? 'bg-progress-complete'
                              : (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 >= 75
                                ? 'bg-progress-high'
                                : (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
                            }`}
                          style={{ width: `${(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Hours Progress</span>
                        <span className="font-bold">{Math.round((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 === 100
                              ? 'bg-progress-complete'
                              : (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 >= 75
                                ? 'bg-progress-high'
                                : (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
                            }`}
                          style={{ width: `${(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Payment Progress</span>
                        <span className="font-bold">{Math.round((selectedStudent.paidAmount / selectedStudent.totalPayment) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${(selectedStudent.paidAmount / selectedStudent.totalPayment) * 100 === 100
                              ? 'bg-progress-complete'
                              : (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100 >= 75
                                ? 'bg-progress-high'
                                : (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100 >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
                            }`}
                          style={{ width: `${(selectedStudent.paidAmount / selectedStudent.totalPayment) * 100}%` }}
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

      {/* Edit Student Dialog */}
      <Dialog open={isEditingStudent} onOpenChange={setIsEditingStudent}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">Edit Student</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Update the student's progress information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-student-id" className="text-sm font-medium">Student ID</Label>
                  <Input
                    id="edit-student-id"
                    value={editingStudent.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.name}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sessions-completed" className="text-sm font-medium">
                    Completed Sessions *
                  </Label>
                  <Input
                    id="edit-sessions-completed"
                    type="number"
                    min="0"
                    max={editingStudent.totalSessions}
                    value={editingStudent.sessionsCompleted}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      sessionsCompleted: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-sessions" className="text-sm font-medium">Total Sessions</Label>
                  <Input
                    id="edit-total-sessions"
                    type="number"
                    value={editingStudent.totalSessions}
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-hours" className="text-sm font-medium">Total Hours</Label>
                  <Input
                    id="edit-total-hours"
                    type="number"
                    value={editingStudent.totalHours}
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-paid-amount" className="text-sm font-medium">
                    Paid Amount (₹) *
                  </Label>
                  <Input
                    id="edit-paid-amount"
                    type="number"
                    min="0"
                    max={editingStudent.totalPayment}
                    value={editingStudent.paidAmount}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      paidAmount: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-payment" className="text-sm font-medium">Total Payment (₹)</Label>
                  <Input
                    id="edit-total-payment"
                    type="number"
                    value={editingStudent.totalPayment}
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
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
            <Button
              onClick={handleUpdateStudent}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeletingStudent} onOpenChange={setIsDeletingStudent}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-[400px]">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl font-bold tracking-tight">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This will permanently delete {selectedStudent?.name}'s profile and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
            <AlertDialogCancel
              onClick={() => {
                setIsDeletingStudent(false);
                setSelectedStudent(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Add New Student</DialogTitle>
            <DialogDescription>
              Fill in the student details below. All fields marked with * are required.
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
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
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
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
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
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full"
                />
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
                  onChange={(e) => setNewStudent({ ...newStudent, totalSessions: parseInt(e.target.value) })}
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
                  onChange={(e) => setNewStudent({ ...newStudent, totalHours: parseInt(e.target.value) })}
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
                  onChange={(e) => setNewStudent({ ...newStudent, totalPayment: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
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
                sessionDuration: 60
              });
            }} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              className="w-full sm:w-auto"
            >
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MentorStudents;
