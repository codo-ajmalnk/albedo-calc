import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, UserPlus, Users, Calendar as CalendarIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StudentDialogProps {
  isViewDetailsOpen: boolean;
  isAddOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  isViewStudentsOpen: boolean;
  isAssignStudentsOpen: boolean;
  selectedStudent: any;
  selectedMentor: any;
  newStudent: any;
  editingStudent: any;
  students: any[];
  mentors: any[];
  onViewDetailsClose: () => void;
  onAddClose: () => void;
  onEditClose: () => void;
  onDeleteClose: () => void;
  onViewStudentsClose: () => void;
  onAssignStudentsClose: () => void;
  onAddStudent: () => void;
  onUpdateStudent: () => void;
  onDeleteStudent: (student: any) => void;
  onAssignStudents: () => void;
  setNewStudent: (student: any) => void;
  setEditingStudent: (student: any) => void;
  getMentorName: (mentorId: string) => string;
  onEditStudent: (student: any) => void;
  isAssigningStudents: boolean;
  isAddingStudent: boolean;
  selectedStudentsToAssign: string[];
  setIsAssigningStudents: (value: boolean) => void;
  setIsAddingStudent: (value: boolean) => void;
  setSelectedStudentsToAssign: (students: string[]) => void;
  currentUser: User;
}

export function StudentDialog({
  isViewDetailsOpen,
  isAddOpen,
  isEditOpen,
  isDeleteOpen,
  isViewStudentsOpen,
  isAssignStudentsOpen,
  selectedStudent,
  selectedMentor,
  newStudent,
  editingStudent,
  students,
  mentors,
  onViewDetailsClose,
  onAddClose,
  onEditClose,
  onDeleteClose,
  onViewStudentsClose,
  onAssignStudentsClose,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAssignStudents,
  setNewStudent,
  setEditingStudent,
  getMentorName,
  onEditStudent,
  isAssigningStudents,
  isAddingStudent,
  selectedStudentsToAssign,
  setIsAssigningStudents,
  setIsAddingStudent,
  setSelectedStudentsToAssign,
  currentUser,
}: StudentDialogProps) {
  const hasAccessToStudentData = (student: any) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "coordinator") {
      return mentors.some(mentor =>
        mentor.supervisorId === currentUser.id &&
        mentor.id === student.mentorId
      );
    }
    if (currentUser.role === "mentor") {
      return student.mentorId === currentUser.id;
    }
    return false;
  };

  const canModifyStudent = (student: any) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "coordinator") {
      return mentors.some(mentor =>
        mentor.supervisorId === currentUser.id &&
        mentor.id === student.mentorId
      );
    }
    if (currentUser.role === "mentor") {
      return student.mentorId === currentUser.id;
    }
    return false;
  };

  return (
    <>
      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={onViewDetailsClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedStudent && hasAccessToStudentData(selectedStudent) ? (
            <>
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-bold">{selectedStudent?.name}</DialogTitle>
                <DialogDescription>
                  {selectedStudent?.email}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold mt-1">{selectedStudent.totalSessions}</p>
                    <p className="text-sm text-muted-foreground">sessions</p>
                  </div>
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Completed Sessions</p>
                    <p className="text-2xl font-bold mt-1">{selectedStudent.sessionsCompleted}</p>
                    <p className="text-sm text-muted-foreground">completed</p>
                  </div>
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold mt-1 truncate">{selectedStudent.totalHours}</p>
                    <p className="text-sm text-muted-foreground">hours</p>
                  </div>
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Remaining Hours</p>
                    <p className="text-2xl font-bold mt-1 truncate">
                      {Math.round((selectedStudent.totalHours - (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration / 60)) * 100) / 100}
                    </p>
                    <p className="text-sm text-muted-foreground">hours</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-4">Session Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Student Added On</span>
                      <p className="text-lg font-medium mt-1">
                        {selectedStudent.createdAt ? (
                          <div className="space-y-0.5">
                            <div>{format(new Date(selectedStudent.createdAt), "PPP")}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(selectedStudent.createdAt), "p")}
                            </div>
                          </div>
                        ) : "Not available"}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Session Start</span>
                      <p className="text-lg font-medium mt-1">
                        {selectedStudent.startDate ? format(new Date(selectedStudent.startDate), "PPP") : "Not set"}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Session End</span>
                      <p className="text-lg font-medium mt-1">
                        {selectedStudent.endDate ? format(new Date(selectedStudent.endDate), "PPP") : "Not set"}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Remaining Days</span>
                      <p className="text-lg font-medium mt-1">
                        {(selectedStudent.startDate && selectedStudent.endDate) ?
                          Math.ceil((new Date(selectedStudent.endDate).getTime() - new Date(selectedStudent.startDate).getTime()) / (1000 * 60 * 60 * 24))
                          : "N/A"} Days
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-4">Sessions & Hours</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Total Sessions</span>
                      <p className="text-lg font-medium mt-1">{selectedStudent.totalSessions}</p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Completed Sessions</span>
                      <p className="text-lg font-medium mt-1">{selectedStudent.sessionsCompleted}</p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Total Hours</span>
                      <p className="text-lg font-medium mt-1">{selectedStudent.totalHours}</p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Completed Hours</span>
                      <p className="text-lg font-medium mt-1">
                        {Math.round((selectedStudent.totalHours * selectedStudent.sessionsCompleted) / selectedStudent.totalSessions)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-4">Payments</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Total Payment</span>
                      <p className="text-lg font-medium mt-1">₹{(selectedStudent?.totalPayment || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Paid Amount</span>
                      <p className="text-lg font-medium mt-1">₹{(selectedStudent?.paidAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted/5 rounded-lg">
                      <span className="text-sm">Pending Payment</span>
                      <p className="text-lg font-medium mt-1">₹{((selectedStudent?.totalPayment || 0) - (selectedStudent?.paidAmount || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-4">Available Mentors</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Students</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mentors.map((mentor) => {
                          const mentorStudents = students.filter(s => s.mentorId === mentor.id);
                          return (
                            <TableRow key={mentor.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{mentor.name}</span>
                                  {mentor.id === selectedStudent.mentorId && (
                                    <Badge variant="default">Current</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{mentor.email}</TableCell>
                              <TableCell>
                                <Badge variant={mentor.status === "active" ? "default" : "secondary"}>
                                  {mentor.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{mentorStudents.length} students</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-4">Progress Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sessions Progress</span>
                        <span>{Math.round((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100)}%</span>
                      </div>
                      <Progress
                        value={(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Hours Progress</span>
                        <span>{Math.round((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100)}%</span>
                      </div>
                      <Progress
                        value={(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Payment Progress</span>
                        <span>{Math.round((selectedStudent.paidAmount / selectedStudent.totalPayment) * 100)}%</span>
                      </div>
                      <Progress
                        value={(selectedStudent.paidAmount / selectedStudent.totalPayment) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-base text-muted-foreground">
                You don't have permission to view this student's details.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mentor">Assigned Mentor *</Label>
                <Select
                  value={newStudent.mentorId}
                  onValueChange={(value) => setNewStudent({ ...newStudent, mentorId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
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
                  onValueChange={(value) => setNewStudent({ ...newStudent, status: value as "active" | "inactive" })}
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
                    setNewStudent({
                      ...newStudent,
                      totalSessions: sessions
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessions-completed">Completed Sessions *</Label>
                <Input
                  id="sessions-completed"
                  type="number"
                  min="0"
                  value={newStudent.sessionsCompleted}
                  onChange={e => {
                    let value = parseInt(e.target.value) || 0;
                    if (value > newStudent.totalSessions) value = newStudent.totalSessions;
                    setNewStudent({
                      ...newStudent,
                      sessionsCompleted: value
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Pending Sessions</Label>
                <Input
                  value={newStudent.totalSessions - newStudent.sessionsCompleted}
                  disabled
                  className="w-full bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-hours">Total Hours</Label>
                <Input
                  id="total-hours"
                  type="number"
                  min="0"
                  step="any"
                  value={
                    newStudent.totalHours === undefined || newStudent.totalHours === null || newStudent.totalHours === ''
                      ? ((newStudent.totalSessions || 0) * (newStudent.sessionDuration || 0) / 60).toFixed(2)
                      : newStudent.totalHours
                  }
                  onChange={e => {
                    let value = parseFloat(e.target.value);
                    if (isNaN(value)) value = undefined;
                    setNewStudent({
                      ...newStudent,
                      totalHours: value
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completed-hours">Completed Hours</Label>
                <Input
                  id="completed-hours"
                  type="number"
                  min="0"
                  step="any"
                  value={
                    newStudent.completedHours === undefined || newStudent.completedHours === null || newStudent.completedHours === ''
                      ? ((newStudent.sessionsCompleted || 0) * (newStudent.sessionDuration || 0) / 60).toFixed(2)
                      : newStudent.completedHours
                  }
                  onChange={e => {
                    let value = parseFloat(e.target.value);
                    let total = newStudent.totalHours !== undefined && newStudent.totalHours !== null
                      ? newStudent.totalHours
                      : (newStudent.totalSessions || 0) * (newStudent.sessionDuration || 0) / 60;
                    if (isNaN(value)) value = undefined;
                    if (value > total) value = total;
                    setNewStudent({
                      ...newStudent,
                      completedHours: value
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Pending Hours</Label>
                <Input
                  value={
                    ((newStudent.totalHours !== undefined && newStudent.totalHours !== null
                      ? newStudent.totalHours
                      : (newStudent.totalSessions || 0) * (newStudent.sessionDuration || 0) / 60)
                    - (newStudent.completedHours !== undefined && newStudent.completedHours !== null
                      ? newStudent.completedHours
                      : (newStudent.sessionsCompleted || 0) * (newStudent.sessionDuration || 0) / 60)
                    ).toFixed(2)
                  }
                  disabled
                  className="w-full bg-muted"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourly-payment">Hourly Payment (₹) *</Label>
                <Input
                  id="hourly-payment"
                  type="number"
                  min="0"
                  value={newStudent.hourlyPayment || ''}
                  onChange={e => setNewStudent({
                    ...newStudent,
                    hourlyPayment: parseInt(e.target.value) || 0
                  })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Class Taken Amount (₹)</Label>
                <Input
                  value={((newStudent.hourlyPayment || 0) * (newStudent.completedHours !== undefined && newStudent.completedHours !== null
                    ? newStudent.completedHours
                    : (newStudent.sessionsCompleted || 0) * (newStudent.sessionDuration || 0) / 60)).toFixed(2)}
                  disabled
                  className="w-full bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="paid-amount">Paid Amount (₹) *</Label>
                <Input
                  id="paid-amount"
                  type="number"
                  min="0"
                  value={newStudent.paidAmount}
                  onChange={e => {
                    let value = parseInt(e.target.value) || 0;
                    if (value > newStudent.totalPayment) value = newStudent.totalPayment;
                    setNewStudent({
                      ...newStudent,
                      paidAmount: value
                    });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pending-payment">Pending Payment (₹)</Label>
                <Input
                  id="pending-payment"
                  type="number"
                  value={newStudent.totalPayment - newStudent.paidAmount}
                  disabled
                  className="w-full bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-duration">Session Duration *</Label>
                <Select
                  value={newStudent?.sessionDuration ? newStudent.sessionDuration.toString() : "60"}
                  onValueChange={(value) => {
                    const duration = parseInt(value);
                    const sessions = newStudent.totalSessions || 0;
                    const hours = Math.round((sessions * duration) / 60);
                    
                    setNewStudent({
                      ...newStudent,
                      sessionDuration: duration,
                      totalHours: hours
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration">
                      {newStudent?.sessionDuration ? `${newStudent.sessionDuration} Minutes` : "60 Minutes"}
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
                      {newStudent.startDate ? format(new Date(newStudent.startDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newStudent.startDate ? new Date(newStudent.startDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Calculate end date based on total sessions (assuming weekly sessions)
                          const endDate = new Date(date);
                          endDate.setDate(endDate.getDate() + ((newStudent.totalSessions - 1) * 7));
                          
                          setNewStudent({
                            ...newStudent,
                            startDate: date.toISOString(),
                            endDate: endDate.toISOString()
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
                      {newStudent.endDate ? format(new Date(newStudent.endDate), "PPP") : <span>Auto-calculated</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newStudent.endDate ? new Date(newStudent.endDate) : undefined}
                      disabled
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAddingStudent(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={onAddStudent} className="w-full sm:w-auto">
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog - Only show if user has permission */}
      {editingStudent && canModifyStudent(editingStudent) && (
        <Dialog open={isEditOpen} onOpenChange={onEditClose}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold">Edit Student</DialogTitle>
              <DialogDescription>
                Update the student's information. All fields marked with * are required.
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
                      onChange={(e) => setEditingStudent({
                        ...editingStudent,
                        name: e.target.value
                      })}
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
                      onChange={(e) => setEditingStudent({
                        ...editingStudent,
                        email: e.target.value
                      })}
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
                      onChange={(e) => setEditingStudent({
                        ...editingStudent,
                        phone: e.target.value
                      })}
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
                      onValueChange={(value) => setEditingStudent({
                        ...editingStudent,
                        mentorId: value
                      })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mentors.map((mentor) => (
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
                      onValueChange={(value) => setEditingStudent({
                        ...editingStudent,
                        status: value as "active" | "inactive"
                      })}
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
                        let endDate = editingStudent.startDate ? new Date(editingStudent.startDate) : null;
                        if (endDate) {
                          endDate.setDate(endDate.getDate() + sessions - 1);
                        }

                        setEditingStudent({
                          ...editingStudent,
                          totalSessions: sessions,
                          totalHours: hours,
                          endDate: endDate ? endDate.toISOString().split('T')[0] : ''
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sessions-completed">Completed Sessions *</Label>
                    <Input
                      id="edit-sessions-completed"
                      type="number"
                      min="0"
                      value={editingStudent.sessionsCompleted}
                      onChange={e => {
                        let value = parseInt(e.target.value) || 0;
                        if (value > editingStudent.totalSessions) value = editingStudent.totalSessions;
                        setEditingStudent({
                          ...editingStudent,
                          sessionsCompleted: value
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pending Sessions</Label>
                    <Input
                      value={editingStudent.totalSessions - editingStudent.sessionsCompleted}
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-total-hours">Total Hours</Label>
                    <Input
                      id="edit-total-hours"
                      type="number"
                      min="0"
                      step="any"
                      value={editingStudent.totalHours === undefined || editingStudent.totalHours === null ? '' : editingStudent.totalHours}
                      placeholder={((editingStudent.totalSessions || 0) * (editingStudent.sessionDuration || 0) / 60).toFixed(2)}
                      onChange={e => {
                        let value = parseFloat(e.target.value);
                        if (isNaN(value)) value = undefined;
                        setEditingStudent({
                        ...editingStudent,
                          totalHours: value
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-completed-hours">Completed Hours</Label>
                    <Input
                      id="edit-completed-hours"
                      type="number"
                      min="0"
                      step="any"
                      value={
                        editingStudent.completedHours === undefined || editingStudent.completedHours === null
                          ? ((editingStudent.sessionsCompleted || 0) * (editingStudent.sessionDuration || 0) / 60).toFixed(2)
                          : editingStudent.completedHours
                      }
                      onChange={e => {
                        let value = parseFloat(e.target.value);
                        let total = editingStudent.totalHours !== undefined && editingStudent.totalHours !== null
                          ? editingStudent.totalHours
                          : (editingStudent.totalSessions || 0) * (editingStudent.sessionDuration || 0) / 60;
                        if (isNaN(value)) value = undefined;
                        if (value > total) value = total;
                        setEditingStudent({
                          ...editingStudent,
                          completedHours: value
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pending Hours</Label>
                    <Input
                      value={
                        ((editingStudent.totalHours !== undefined && editingStudent.totalHours !== null
                          ? editingStudent.totalHours
                          : (editingStudent.totalSessions || 0) * (editingStudent.sessionDuration || 0) / 60)
                        - (editingStudent.completedHours !== undefined && editingStudent.completedHours !== null
                          ? editingStudent.completedHours
                          : (editingStudent.sessionsCompleted || 0) * (editingStudent.sessionDuration || 0) / 60)
                        ).toFixed(2)
                      }
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-total-payment">Total Payment (₹) *</Label>
                    <Input
                      id="edit-total-payment"
                      type="number"
                      min="0"
                      value={editingStudent.totalPayment}
                      onChange={(e) => setEditingStudent({
                        ...editingStudent,
                        totalPayment: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-paid-amount">Paid Amount (₹) *</Label>
                    <Input
                      id="edit-paid-amount"
                      type="number"
                      min="0"
                      value={editingStudent.paidAmount}
                      onChange={e => {
                        let value = parseInt(e.target.value) || 0;
                        if (value > editingStudent.totalPayment) value = editingStudent.totalPayment;
                        setEditingStudent({
                          ...editingStudent,
                          paidAmount: value
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-pending-payment">Pending Payment (₹)</Label>
                    <Input
                      id="edit-pending-payment"
                      type="number"
                      value={editingStudent.totalPayment - editingStudent.paidAmount}
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-session-duration">Session Duration *</Label>
                    <Select
                      value={editingStudent?.sessionDuration ? editingStudent.sessionDuration.toString() : ""}
                      onValueChange={(value) => {
                        const duration = parseInt(value);
                        const sessions = editingStudent.totalSessions || 0;
                        // Calculate total hours based on sessions and duration
                        const hours = Math.round((sessions * duration) / 60);
                        
                        setEditingStudent({
                          ...editingStudent,
                          sessionDuration: duration,
                          totalHours: hours
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration">
                          {editingStudent?.sessionDuration ? `${editingStudent.sessionDuration} Minutes` : "Select duration"}
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
                    <Label htmlFor="edit-hourly-payment">Hourly Payment (₹) *</Label>
                    <Input
                      id="edit-hourly-payment"
                      type="number"
                      min="0"
                      value={editingStudent.hourlyPayment || ''}
                      onChange={e => setEditingStudent({
                        ...editingStudent,
                        hourlyPayment: parseInt(e.target.value) || 0
                      })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Class Taken Amount (₹)</Label>
                    <Input
                      value={((editingStudent.hourlyPayment || 0) * (editingStudent.completedHours !== undefined && editingStudent.completedHours !== null
                        ? editingStudent.completedHours
                        : (editingStudent.sessionsCompleted || 0) * (editingStudent.sessionDuration || 0) / 60)).toFixed(2)}
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Session Starting Date *</Label>
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
                          {editingStudent.startDate ? format(new Date(editingStudent.startDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editingStudent.startDate ? new Date(editingStudent.startDate) : undefined}
                          onSelect={(date) => {
                            const startDate = date ? date.toISOString().split('T')[0] : '';
                            // Calculate end date based on starting date and total sessions
                            let endDate = startDate ? new Date(startDate) : null;
                            if (endDate && editingStudent.totalSessions) {
                              endDate.setDate(endDate.getDate() + editingStudent.totalSessions - 1);
                            }

                            setEditingStudent({
                              ...editingStudent,
                              startDate,
                              endDate: endDate ? endDate.toISOString().split('T')[0] : ''
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
                          {editingStudent.endDate ? format(new Date(editingStudent.endDate), "PPP") : <span>Auto-calculated</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editingStudent.endDate ? new Date(editingStudent.endDate) : undefined}
                          disabled
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Added On</Label>
                    <Input
                      value={editingStudent.createdAt ? format(new Date(editingStudent.createdAt), "PPP p") : "Not available"}
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={onEditClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={onUpdateStudent} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog - Only show if user has permission */}
      {selectedStudent && canModifyStudent(selectedStudent) && (
        <AlertDialog open={isDeleteOpen} onOpenChange={onDeleteClose}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedStudent?.name}'s profile and remove all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={onDeleteClose}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteStudent(selectedStudent)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* View Students Dialog - Only show accessible students */}
      <Dialog open={isViewStudentsOpen} onOpenChange={onViewStudentsClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Assigned Students - {selectedMentor?.name}</DialogTitle>
            <DialogDescription>
              {currentUser.role === "mentor"
                ? "View and manage your students"
                : `Manage students assigned to ${selectedMentor?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mb-4">
            <Button variant="outline" onClick={() => setIsAssigningStudents(true)}>
              <Users className="mr-2 h-4 w-4" />
              Assign Students
            </Button>
            <Button onClick={() => setIsAddingStudent(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </div>

          <div className="relative overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="w-full overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px] font-medium">ID</TableHead>
                      <TableHead className="font-medium min-w-[200px]">Name</TableHead>
                      <TableHead className="font-medium w-[100px]">Status</TableHead>
                      <TableHead className="font-medium w-[140px]">Progress</TableHead>
                      <TableHead className="font-medium w-[100px]">Sessions</TableHead>
                      <TableHead className="font-medium min-w-[140px]">Payment</TableHead>
                      <TableHead className="font-medium w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMentor &&
                      students
                        ?.filter(student =>
                          student.mentorId === selectedMentor.id &&
                          hasAccessToStudentData(student)
                        )
                        .map((student) => {
                          const progress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
                          const paymentProgress = Math.round((student.paidAmount / student.totalPayment) * 100);
                          return (
                            <TableRow key={student.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{student.id}</TableCell>
                              <TableCell>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium truncate">{student.name}</span>
                                  <span className="text-xs sm:text-sm text-muted-foreground truncate">{student.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {student.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="w-full">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <Progress
                                    value={progress}
                                    className="h-2"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm whitespace-nowrap">
                                  <span className="font-medium">{student.sessionsCompleted}</span>
                                  <span className="text-muted-foreground">/{student.totalSessions}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm whitespace-nowrap">
                                  <span className="font-medium">₹{student.paidAmount.toLocaleString()}</span>
                                  <span className="text-muted-foreground">/₹{student.totalPayment.toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditStudent(student)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDeleteStudent(student)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    {(!selectedMentor?.id || students?.filter(student => student.mentorId === selectedMentor.id).length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Users className="h-8 w-8 text-muted-foreground/60" />
                            <p className="text-sm text-muted-foreground">No students found</p>
                            <p className="text-xs text-muted-foreground">Assign or add new students to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog - Only show if user has permission */}
      {(currentUser.role === "admin" || currentUser.role === "coordinator") && (
        <Dialog open={isAssignStudentsOpen} onOpenChange={onAssignStudentsClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Existing Students</DialogTitle>
              <DialogDescription>
                Select students to assign to {selectedMentor?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student-select">Select Students</Label>
                <Select
                  value={selectedStudentsToAssign[0] || ""}
                  onValueChange={(value) => {
                    setSelectedStudentsToAssign([value]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students
                      ?.filter(s => !s.mentorId || s.mentorId === selectedMentor?.id)
                      ?.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onAssignStudentsClose}>
                Cancel
              </Button>
              <Button
                onClick={onAssignStudents}
                disabled={selectedStudentsToAssign.length === 0}
              >
                Assign Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 