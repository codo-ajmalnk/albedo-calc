import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, UserPlus, Users, Trash, Calendar as CalendarIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { crudToasts } from "@/lib/toast";
import { User, Student } from "@/lib/types";
import { users } from "@/lib/mock-data";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";


interface MentorDialogProps {
  isViewDetailsOpen: boolean;
  isAddOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  isViewStudentsOpen: boolean;
  selectedMentor: any;
  selectedCoordinator: { user: { id: string } } | null;
  newMentor: any;
  editingMentor: any;
  students: any[];
  onViewDetailsClose: () => void;
  onAddClose: () => void;
  onEditClose: () => void;
  onDeleteClose: () => void;
  onViewStudentsClose: () => void;
  onAddMentor: () => void;
  onUpdateMentor: () => void;
  onDeleteMentor: () => void;
  setNewMentor: (mentor: any) => void;
  setEditingMentor: (mentor: any) => void;
  isAssigningStudents: boolean;
  isAddingStudent: boolean;
  setIsAssigningStudents: (value: boolean) => void;
  setIsAddingStudent: (value: boolean) => void;
  handleDeleteStudent: (student: any) => void;
  handleEditStudent: (student: any) => void;
  handleAddStudent: () => void;
  handleAssignStudents: () => void;
  selectedStudentsToAssign: string[];
  setSelectedStudentsToAssign: (students: string[]) => void;
  newStudent: Student;
  setNewStudent: (student: Student) => void;
}

export function MentorDialog({
  isViewDetailsOpen,
  isAddOpen,
  isEditOpen,
  isDeleteOpen,
  isViewStudentsOpen,
  selectedMentor,
  selectedCoordinator,
  newMentor,
  editingMentor,
  students,
  onViewDetailsClose,
  onAddClose,
  onEditClose,
  onDeleteClose,
  onViewStudentsClose,
  onAddMentor,
  onUpdateMentor,
  onDeleteMentor,
  setNewMentor,
  setEditingMentor,
  isAssigningStudents,
  setIsAssigningStudents,
  handleDeleteStudent,
  handleEditStudent,
  handleAddStudent,
  handleAssignStudents,
  selectedStudentsToAssign,
  setSelectedStudentsToAssign,
  newStudent,
  setNewStudent,
}: MentorDialogProps) {
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);

  const generateDefaultPassword = (name: string, phone: string) => {
    // Get first three letters of the name (lowercase)
    const namePart = name.toLowerCase().substring(0, 3);
    // Get last 4 digits of phone number
    const phonePart = phone.replace(/\D/g, '').slice(-4);
    return `${namePart}${phonePart}`;
  };

  // Helper function to close all dialogs
  const closeAllDialogs = () => {
    onViewDetailsClose();
    onAddClose();
    onEditClose();
    onDeleteClose();
    onViewStudentsClose();
  };

  // Modified handlers to ensure only one dialog is open
  const handleViewDetailsClose = () => {
    closeAllDialogs();
  };

  const handleAddClose = () => {
    closeAllDialogs();
  };

  const handleEditClose = () => {
    closeAllDialogs();
  };

  const handleDeleteClose = () => {
    closeAllDialogs();
  };

  const handleViewStudentsClose = () => {
    closeAllDialogs();
  };

  const handleAddMentor = () => {
    try {
      // Validate required fields
      if (!newMentor.name || !newMentor.email || !newMentor.phone || !newMentor.password) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      // Validate name length for password generation
      if (newMentor.name.length < 3) {
        crudToasts.validation.error("Name must be at least 3 characters long for password generation.");
        return;
      }

      // If using default password, generate it
      if (newMentor.useDefaultPassword) {
        newMentor.password = generateDefaultPassword(newMentor.name, newMentor.phone);
      }

      const mentorId = `mentor${users.filter(u => u.role === "mentor").length + 1}`;
      const newUser: User = {
        id: mentorId,
        name: newMentor.name,
        email: newMentor.email,
        role: "mentor",
        supervisorId: selectedCoordinator?.user.id || "",
        phone: newMentor.phone,
        status: newMentor.status as "active" | "inactive",
      };

      // Add the new mentor to the users array
      users.push(newUser);

      // Close the dialog and reset form
      onAddClose();
      setNewMentor({
        id: `mentor${users.filter(u => u.role === "mentor").length + 1}`,
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "active",
        useDefaultPassword: true,
      });

      crudToasts.create.success("Mentor");
    } catch (error) {
      crudToasts.create.error("Mentor");
    }
  };

  return (
    <>
      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={handleViewDetailsClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {selectedMentor?.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  {selectedMentor?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedMentor && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold mt-1">
                    {students?.filter(s => s.mentorId === selectedMentor.id).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">students</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold mt-1">
                    {students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">active</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold mt-1">
                    {students?.filter(s => s.mentorId === selectedMentor.id)
                      .reduce((sum, student) => sum + student.totalSessions, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">sessions</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold mt-1">{selectedMentor.status}</p>
                  <p className="text-sm text-muted-foreground">current</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Student Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Students</span>
                      <span className="font-medium">
                        {students?.filter(s => s.mentorId === selectedMentor.id).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Students</span>
                      <span className="font-medium">
                        {students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Inactive Students</span>
                      <span className="font-medium">
                        {students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'inactive').length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Session Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <span className="font-medium">
                        {students?.filter(s => s.mentorId === selectedMentor.id)
                          .reduce((sum, student) => sum + student.totalSessions, 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Sessions</span>
                      <span className="font-medium">
                        {students?.filter(s => s.mentorId === selectedMentor.id)
                          .reduce((sum, student) => sum + student.sessionsCompleted, 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Hours</span>
                      <span className="font-medium">
                        {students?.filter(s => s.mentorId === selectedMentor.id)
                          .reduce((sum, student) => sum + student.totalHours, 0) || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Progress Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Student Progress</span>
                        <span>
                          {Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                            students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                            students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) === 100
                              ? 'bg-palette-info'
                              : Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                                students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) >= 75
                                ? 'bg-palette-accent'
                                : Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                                  students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) >= 40
                                  ? 'bg-palette-warning'
                                  : 'bg-palette-danger'
                            }`}
                          style={{
                            width: `${Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                              students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) || 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Session Progress</span>
                        <span>
                          {Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                            .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                            students?.filter(s => s.mentorId === selectedMentor.id)
                              .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                            .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                            students?.filter(s => s.mentorId === selectedMentor.id)
                              .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) === 100
                              ? 'bg-palette-info'
                              : Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                                .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                                students?.filter(s => s.mentorId === selectedMentor.id)
                                  .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) >= 75
                                ? 'bg-palette-accent'
                                : Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                                  .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                                  students?.filter(s => s.mentorId === selectedMentor.id)
                                    .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) >= 40
                                  ? 'bg-palette-warning'
                                  : 'bg-palette-danger'
                            }`}
                          style={{
                            width: `${Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                              .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                              students?.filter(s => s.mentorId === selectedMentor.id)
                                .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) || 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Financial Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Class Take Amount</span>
                      <span className="font-medium">
                        ₹{(() => {
                          const mentorStudents = students?.filter(s => s.mentorId === selectedMentor.id) || [];
                          const totalSessions = mentorStudents.reduce((sum, student) => sum + student.totalSessions, 0);
                          const totalPayments = mentorStudents.reduce((sum, student) => sum + student.totalPayment, 0);
                          return totalSessions > 0 ? Math.round(totalPayments / totalSessions).toLocaleString() : 0;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Teacher Salary</span>
                      <span className="font-medium">
                        ₹{(() => {
                          const mentorStudents = students?.filter(s => s.mentorId === selectedMentor.id) || [];
                          const completedPayments = mentorStudents.reduce((sum, student) => sum + student.paidAmount, 0);
                          return Math.round(completedPayments * 0.7).toLocaleString();
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Expense Ratio</span>
                      <span className="font-medium">
                        {(() => {
                          const mentorStudents = students?.filter(s => s.mentorId === selectedMentor.id) || [];
                          const totalPayments = mentorStudents.reduce((sum, student) => sum + student.totalPayment, 0);
                          const completedPayments = mentorStudents.reduce((sum, student) => sum + student.paidAmount, 0);
                          const teacherSalary = Math.round(completedPayments * 0.7);
                          return totalPayments > 0 ? Math.round((teacherSalary / totalPayments) * 100) : 0;
                        })()}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Mentor Dialog */}
      <Dialog open={isAddOpen} onOpenChange={handleAddClose}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl font-bold">Add New Mentor</DialogTitle>
            <DialogDescription className="text-sm">
              Fill in the mentor details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:gap-6 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="mentor-id" className="text-sm">Mentor ID</Label>
                <Input
                  id="mentor-id"
                  value={newMentor.id}
                  disabled
                  className="bg-muted text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name *</Label>
                <Input
                  id="name"
                  value={newMentor.name}
                  onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                  placeholder="Enter mentor's full name"
                  className="w-full text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMentor.email}
                  onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                  placeholder="mentor@example.com"
                  className="w-full text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newMentor.phone}
                  onChange={(e) => setNewMentor({ ...newMentor, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="status" className="text-sm">Status *</Label>
                <Select
                  value={newMentor.status}
                  onValueChange={(value) => setNewMentor({ ...newMentor, status: value as "active" | "inactive" })}
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
                <Label htmlFor="password" className="text-sm">Password *</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="useDefaultPassword"
                      checked={newMentor.useDefaultPassword}
                      onCheckedChange={(checked) => {
                        setNewMentor({
                          ...newMentor,
                          useDefaultPassword: checked as boolean,
                          password: checked ? generateDefaultPassword(newMentor.name, newMentor.phone) : ""
                        });
                      }}
                    />
                    <Label htmlFor="useDefaultPassword" className="text-sm">
                      Use default password (first 3 letters of name + last 4 digits of phone)
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={newMentor.password}
                    onChange={(e) => setNewMentor({ ...newMentor, password: e.target.value })}
                    placeholder="Enter mentor's password"
                    className="w-full text-sm"
                    disabled={newMentor.useDefaultPassword}
                  />
                  {newMentor.useDefaultPassword && (
                    <p className="text-xs text-muted-foreground">
                      Default password will be: {generateDefaultPassword(newMentor.name, newMentor.phone)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-4">
            <Button variant="outline" onClick={handleAddClose} className="w-full sm:w-auto text-sm">
              Cancel
            </Button>
            <Button onClick={onAddMentor} className="w-full sm:w-auto text-sm">
              Create Mentor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mentor Dialog */}
      <Dialog open={isEditOpen} onOpenChange={handleEditClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Edit Mentor</DialogTitle>
            <DialogDescription>
              Update the mentor's information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          {editingMentor && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mentor-id">Mentor ID</Label>
                  <Input
                    id="edit-mentor-id"
                    value={editingMentor.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingMentor.name}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      name: e.target.value
                    })}
                    placeholder="Enter mentor's full name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingMentor.email}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      email: e.target.value
                    })}
                    placeholder="mentor@example.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingMentor.phone}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      phone: e.target.value
                    })}
                    placeholder="+91 98765 43210"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select
                    value={editingMentor.status}
                    onValueChange={(value) => setEditingMentor({
                      ...editingMentor,
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
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingMentor.password || ''}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      password: e.target.value
                    })}
                    placeholder="Leave blank to keep current password"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleEditClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={onUpdateMentor} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Students Dialog */}
      <Dialog open={isViewStudentsOpen} onOpenChange={handleViewStudentsClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assigned Students - {selectedMentor?.name}</DialogTitle>
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
                {selectedMentor && students
                  ?.filter(student => student.mentorId === selectedMentor.id)
                  .map((student) => {
                    const progress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
                    const hoursCompleted = Math.round(student.sessionsCompleted * student.sessionDuration);
                    const totalHours = Math.round(student.totalSessions * student.sessionDuration);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-sm text-muted-foreground">{student.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
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
                          ₹{student.paidAmount.toLocaleString()}/₹{student.totalPayment.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {(!selectedMentor?.id || !students?.filter(student => student.mentorId === selectedMentor.id).length) && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
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
                  <Input
                    id="edit-mentor"
                    value={selectedMentor?.name || ""}
                    disabled
                    className="w-full bg-muted"
                  />
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
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setIsEditStudentOpen(false);
              setEditingStudent(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleEditStudent(editingStudent);
              setIsEditStudentOpen(false);
              setEditingStudent(null);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
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
                <Input
                  id="mentor"
                  value={selectedMentor?.name || ""}
                  disabled
                  className="w-full bg-muted"
                />
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
                    const duration = newStudent.sessionDuration || 60;
                    const hours = Math.round((sessions * duration) / 60);

                    let endDate = newStudent.startDate ? new Date(newStudent.startDate) : null;
                    if (endDate) {
                      endDate.setDate(endDate.getDate() + ((sessions - 1) * 7)); // Weekly sessions
                    }

                    setNewStudent({
                      ...newStudent,
                      totalSessions: sessions,
                      totalHours: hours,
                      endDate: endDate ? endDate.toISOString() : '',
                      sessionsCompleted: 0,
                      paidAmount: 0
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
              Select students to assign to {selectedMentor?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student-select">Select Students</Label>
              <div className="border rounded-md">
                {students.map((student) => {
                  const currentMentor = users.find(u => u.id === student.mentorId);
                  const isSelected = selectedStudentsToAssign.includes(student.id);

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
                              setSelectedStudentsToAssign([...selectedStudentsToAssign, student.id]);
                            } else {
                              setSelectedStudentsToAssign(selectedStudentsToAssign.filter(id => id !== student.id));
                            }
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {currentMentor
                              ? `Currently assigned to: ${currentMentor.name}`
                              : 'Not assigned to any mentor'}
                          </span>
                        </div>
                      </div>
                      <Badge variant={student.mentorId ? "default" : "outline"}>
                        {student.mentorId ? "Assigned" : "Unassigned"}
                      </Badge>
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No students available
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAssigningStudents(false);
              setSelectedStudentsToAssign([]);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignStudents}
              disabled={selectedStudentsToAssign.length === 0}
            >
              {selectedStudentsToAssign.length > 0
                ? `Assign ${selectedStudentsToAssign.length} Student${selectedStudentsToAssign.length === 1 ? '' : 's'}`
                : 'Assign Students'}
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
              This will permanently delete {deletingStudent?.name}'s profile and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeletingStudent(false);
              setDeletingStudent(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingStudent) {
                  try {
                    handleDeleteStudent(deletingStudent);
                    const index = students.findIndex(s => s.id === deletingStudent.id);
                    if (index !== -1) {
                      students.splice(index, 1);
                    }
                    crudToasts.delete.success("Student");
                  } catch (error) {
                    crudToasts.delete.error("Student");
                  }
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

      {/* Delete Mentor Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={onDeleteClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMentor?.user?.name || "this mentor"} and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDeleteClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteMentor();
                onDeleteClose();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 