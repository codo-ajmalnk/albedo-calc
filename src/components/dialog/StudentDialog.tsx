import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, UserPlus, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types";

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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && hasAccessToStudentData(selectedStudent) ? (
            <>
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

              <div className="space-y-6 mt-4">
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
                    <p className="text-sm text-muted-foreground">Mentor</p>
                    <p className="text-2xl font-bold mt-1 truncate">{getMentorName(selectedStudent.mentorId)}</p>
                    <p className="text-sm text-muted-foreground">assigned to</p>
                  </div>
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold mt-1">{selectedStudent.status}</p>
                    <p className="text-sm text-muted-foreground">current</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Sessions & Hours</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Sessions</span>
                        <span className="font-medium">{selectedStudent.totalSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed Sessions</span>
                        <span className="font-medium">{selectedStudent.sessionsCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Hours</span>
                        <span className="font-medium">{selectedStudent.totalHours}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed Hours</span>
                        <span className="font-medium">
                          {Math.round((selectedStudent.totalHours * selectedStudent.sessionsCompleted) / selectedStudent.totalSessions)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Payments</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Payment</span>
                        <span className="font-medium">₹{(selectedStudent?.totalPayment || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Paid Amount</span>
                        <span className="font-medium">₹{(selectedStudent?.paidAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending Payment</span>
                        <span className="font-medium">₹{((selectedStudent?.totalPayment || 0) - (selectedStudent?.paidAmount || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Progress Overview</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Sessions Progress</span>
                          <span>{Math.round((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 === 100
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

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Hours Progress</span>
                          <span>{Math.round((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${(selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 === 100
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

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Payment Progress</span>
                          <span>{Math.round((selectedStudent.paidAmount / selectedStudent.totalPayment) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${(selectedStudent.paidAmount / selectedStudent.totalPayment) * 100 === 100
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

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>{Math.round(((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                            (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                            (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100) / 3)}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100) / 3 === 100
                                ? 'bg-progress-complete'
                                : ((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                  (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                  (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100) / 3 >= 75
                                  ? 'bg-progress-high'
                                  : ((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                    (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                    (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100) / 3 >= 40
                                    ? 'bg-progress-medium'
                                    : 'bg-progress-low'
                              }`}
                            style={{
                              width: `${((selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100) / 3}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                You don't have permission to view this student's details.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog - Only show if user has permission */}
      {(currentUser.role === "admin" || currentUser.role === "coordinator") && (
        <Dialog open={isAddOpen} onOpenChange={onAddClose}>
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
                      const duration = newStudent.sessionDuration || 0;
                      // Calculate total hours based on sessions and duration
                      const hours = Math.round((sessions * duration) / 60);
                      
                      // Calculate end date based on starting date and total sessions
                      let endDate = newStudent.startDate ? new Date(newStudent.startDate) : null;
                      if (endDate) {
                        endDate.setDate(endDate.getDate() + sessions - 1);
                      }
                      
                      setNewStudent({
                        ...newStudent,
                        totalSessions: sessions,
                        totalHours: hours,
                        endDate: endDate ? endDate.toISOString().split('T')[0] : ''
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
                    onChange={(e) => setNewStudent({ ...newStudent, totalPayment: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Session Starting Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newStudent.startDate}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      // Calculate end date based on starting date and total sessions
                      let endDate = startDate ? new Date(startDate) : null;
                      if (endDate && newStudent.totalSessions) {
                        endDate.setDate(endDate.getDate() + newStudent.totalSessions - 1);
                      }
                      
                      setNewStudent({
                        ...newStudent,
                        startDate,
                        endDate: endDate ? endDate.toISOString().split('T')[0] : ''
                      });
                    }}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Session Ending Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newStudent.endDate}
                    disabled
                    className="w-full bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-duration">Session Duration *</Label>
                  <Select
                    value={newStudent.sessionDuration.toString()}
                    onValueChange={(value) => {
                      const duration = parseInt(value);
                      const sessions = newStudent.totalSessions || 0;
                      // Calculate total hours based on sessions and duration
                      const hours = Math.round((sessions * duration) / 60);
                      
                      setNewStudent({
                        ...newStudent,
                        sessionDuration: duration,
                        totalHours: hours
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
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
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={onAddClose} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={onAddStudent} className="w-full sm:w-auto">
                Create Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                    <Label htmlFor="edit-sessions-completed">Completed Sessions *</Label>
                    <Input
                      id="edit-sessions-completed"
                      type="number"
                      min="0"
                      value={editingStudent.sessionsCompleted}
                      onChange={(e) => setEditingStudent({
                        ...editingStudent,
                        sessionsCompleted: parseInt(e.target.value)
                      })}
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
                      onChange={(e) => setEditingStudent({
                        ...editingStudent,
                        paidAmount: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Session Starting Date *</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={editingStudent.startDate}
                      onChange={(e) => {
                        const startDate = e.target.value;
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
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date">Session Ending Date</Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={editingStudent.endDate}
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-session-duration">Session Duration *</Label>
                    <Select
                      value={editingStudent.sessionDuration.toString()}
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
                        <SelectValue placeholder="Select duration" />
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assigned Students - {selectedMentor?.name}</DialogTitle>
            <DialogDescription>
              {currentUser.role === "mentor" 
                ? "View and manage your students"
                : `Manage students assigned to ${selectedMentor?.name}`}
            </DialogDescription>
          </DialogHeader>
          <DialogHeader>
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
          </DialogHeader>

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