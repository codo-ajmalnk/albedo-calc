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
import { Checkbox } from "@/components/ui/checkbox";
import { crudToasts } from "@/lib/toast";
import { User } from "@/lib/types";
import { users } from "@/lib/mock-data";


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
}: MentorDialogProps) {
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
                          className={`h-2 rounded-full transition-all duration-300 ${
                            Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                              students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) === 100
                              ? 'bg-progress-complete'
                              : Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                                students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) >= 75
                                ? 'bg-progress-high'
                                : Math.round((students?.filter(s => s.mentorId === selectedMentor.id && s.status === 'active').length /
                                  students?.filter(s => s.mentorId === selectedMentor.id).length) * 100) >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
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
                          className={`h-2 rounded-full transition-all duration-300 ${
                            Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                              .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                              students?.filter(s => s.mentorId === selectedMentor.id)
                                .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) === 100
                              ? 'bg-progress-complete'
                              : Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                                .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                                students?.filter(s => s.mentorId === selectedMentor.id)
                                  .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) >= 75
                                ? 'bg-progress-high'
                                : Math.round((students?.filter(s => s.mentorId === selectedMentor.id)
                                  .reduce((sum, student) => sum + student.sessionsCompleted, 0) /
                                  students?.filter(s => s.mentorId === selectedMentor.id)
                                    .reduce((sum, student) => sum + student.totalSessions, 0)) * 100) >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={handleDeleteClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMentor?.name}'s profile and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteMentor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Students Dialog */}
      <Dialog open={isViewStudentsOpen} onOpenChange={handleViewStudentsClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assigned Students - {selectedMentor?.name}</DialogTitle>
            <DialogDescription>
              Manage students assigned to this mentor.
            </DialogDescription>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMentor &&
                      students
                        ?.filter(student => student.mentorId === selectedMentor.id)
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
                            </TableRow>
                          );
                        })}
                    {(!selectedMentor?.id || students?.filter(student => student.mentorId === selectedMentor.id).length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
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
    </>
  );
} 