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
import { DashboardStats } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/lib/types";
import { users } from "@/lib/mock-data";
import { crudToasts } from "@/lib/toast";

interface Coordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  role: "coordinator";
}

interface NewCoordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  password: string;
  useDefaultPassword: boolean;
}

interface EditingCoordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  password: string;
}

interface CoordinatorDialogProps {
  isViewDetailsOpen: boolean;
  isAddOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  selectedCoordinator: Coordinator | null;
  newCoordinator: NewCoordinator;
  editingCoordinator: EditingCoordinator | null;
  stats?: DashboardStats & {
    mentorCount: number;
    studentCount: number;
    activeStudents: number;
    sessionProgress: number;
    hoursProgress: number;
    paymentsProgress: number;
  };
  allStudents: any[];
  onViewDetailsClose: () => void;
  onAddClose: () => void;
  onEditClose: () => void;
  onDeleteClose: () => void;
  onAddCoordinator: () => void;
  onUpdateCoordinator: () => void;
  onDeleteCoordinator: () => void;
  setNewCoordinator: (coordinator: NewCoordinator) => void;
  setEditingCoordinator: (coordinator: EditingCoordinator | null) => void;
}

const generateDefaultPassword = (name: string, phone: string) => {
  // Get first three letters of the name (lowercase)
  const namePart = name.toLowerCase().substring(0, 3);
  // Get last 4 digits of phone number
  const phonePart = phone.replace(/\D/g, '').slice(-4);
  return `${namePart}${phonePart}`;
};

export function CoordinatorDialog({
  isViewDetailsOpen,
  isAddOpen,
  isEditOpen,
  isDeleteOpen,
  selectedCoordinator,
  newCoordinator,
  editingCoordinator,
  stats,
  allStudents,
  onViewDetailsClose,
  onAddClose,
  onEditClose,
  onDeleteClose,
  onAddCoordinator,
  onUpdateCoordinator,
  onDeleteCoordinator,
  setNewCoordinator,
  setEditingCoordinator,
}: CoordinatorDialogProps) {
  // Helper function to close all dialogs
  const closeAllDialogs = () => {
    onViewDetailsClose();
    onAddClose();
    onEditClose();
    onDeleteClose();
  };

  // Modified handlers to ensure only one dialog is open
  const handleViewDetailsClose = () => {
    closeAllDialogs();
  };

  const handleAddClose = () => {
    closeAllDialogs();
    setNewCoordinator({
      id: `coord${users.filter(u => u.role === "coordinator").length + 1}`,
      name: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
      useDefaultPassword: true,
    });
  };

  const handleEditClose = () => {
    closeAllDialogs();
    setEditingCoordinator(null);
  };

  const handleDeleteClose = () => {
    closeAllDialogs();
  };

  return (
    <>
      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen && !isAddOpen && !isEditOpen && !isDeleteOpen} onOpenChange={handleViewDetailsClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {selectedCoordinator?.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  {selectedCoordinator?.email}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCoordinator?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedCoordinator?.status || 'active'}
                </span>
              </div>
            </div>
          </DialogHeader>

          {selectedCoordinator && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="text-base font-medium mt-1">{selectedCoordinator.phone || "No phone"}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedCoordinator.email}</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold mt-1">{stats?.mentorCount || 0}</p>
                  <p className="text-sm text-muted-foreground">mentors</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold mt-1">{stats?.studentCount || 0}</p>
                  <p className="text-sm text-muted-foreground">total</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold mt-1">{stats?.activeStudents || 0}</p>
                  <p className="text-sm text-muted-foreground">currently</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sessions Progress</span>
                    <span className="font-medium">{stats?.sessionProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats?.sessionProgress === 100
                          ? 'bg-progress-complete'
                          : stats?.sessionProgress >= 75
                            ? 'bg-progress-high'
                            : stats?.sessionProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                      }`}
                      style={{ width: `${stats?.sessionProgress || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats?.completedSessions || 0} completed</span>
                    <span>{stats?.totalSessions || 0} total</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Hours Progress</span>
                    <span className="font-medium">{stats?.hoursProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats?.hoursProgress === 100
                          ? 'bg-progress-complete'
                          : stats?.hoursProgress >= 75
                            ? 'bg-progress-high'
                            : stats?.hoursProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                      }`}
                      style={{ width: `${stats?.hoursProgress || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats?.completedHours || 0} completed</span>
                    <span>{stats?.totalHours || 0} total</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Payments Progress</span>
                    <span className="font-medium">{stats?.paymentsProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats?.paymentsProgress === 100
                          ? 'bg-progress-complete'
                          : stats?.paymentsProgress >= 75
                            ? 'bg-progress-high'
                            : stats?.paymentsProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                      }`}
                      style={{ width: `${stats?.paymentsProgress || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹{stats?.completedPayments?.toLocaleString() || 0} completed</span>
                    <span>₹{stats?.totalPayments?.toLocaleString() || 0} total</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span className="font-medium">{stats?.overallProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats?.overallProgress === 100
                          ? 'bg-progress-complete'
                          : stats?.overallProgress >= 75
                            ? 'bg-progress-high'
                            : stats?.overallProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                      }`}
                      style={{ width: `${stats?.overallProgress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-lg font-medium mt-1">₹{stats?.pendingPayments?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-lg font-medium mt-1">₹{stats?.totalPayments?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Class Take Amount</p>
                  <p className="text-lg font-medium mt-1">₹{stats?.classTakeAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Teacher Salary</p>
                  <p className="text-lg font-medium mt-1">₹{stats?.teacherSalary?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Expense Ratio</p>
                  <p className="text-lg font-medium mt-1">{stats?.expenseRatio || 0}%</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Coordinator Dialog */}
      <Dialog open={isAddOpen && !isViewDetailsOpen && !isEditOpen && !isDeleteOpen} onOpenChange={handleAddClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Add New Coordinator</DialogTitle>
            <DialogDescription>
              Fill in the coordinator details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coordinator-id">Coordinator ID</Label>
                <Input
                  id="coordinator-id"
                  value={newCoordinator.id}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newCoordinator.name}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })}
                  placeholder="Enter coordinator's full name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCoordinator.email}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
                  placeholder="coordinator@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newCoordinator.phone}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={newCoordinator.status}
                  onValueChange={(value) => setNewCoordinator({ ...newCoordinator, status: value as "active" | "inactive" })}
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
                <Label htmlFor="password">Password *</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="useDefaultPassword"
                      checked={newCoordinator.useDefaultPassword}
                      onCheckedChange={(checked) => {
                        setNewCoordinator({
                          ...newCoordinator,
                          useDefaultPassword: checked as boolean,
                          password: checked ? generateDefaultPassword(newCoordinator.name, newCoordinator.phone) : ""
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
                    value={newCoordinator.password}
                    onChange={(e) => setNewCoordinator({ ...newCoordinator, password: e.target.value })}
                    placeholder="Enter secure password"
                    className="w-full"
                    disabled={newCoordinator.useDefaultPassword}
                  />
                  {newCoordinator.useDefaultPassword && (
                    <p className="text-xs text-muted-foreground">
                      Default password will be: {generateDefaultPassword(newCoordinator.name, newCoordinator.phone)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleAddClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={onAddCoordinator} className="w-full sm:w-auto">
              Create Coordinator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coordinator Dialog */}
      <Dialog open={isEditOpen && !isViewDetailsOpen && !isAddOpen && !isDeleteOpen} onOpenChange={handleEditClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Edit Coordinator</DialogTitle>
            <DialogDescription>
              Update the coordinator's information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          {editingCoordinator && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-coordinator-id">Coordinator ID</Label>
                  <Input
                    id="edit-coordinator-id"
                    value={editingCoordinator.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingCoordinator.name}
                    onChange={(e) => setEditingCoordinator({
                      ...editingCoordinator,
                      name: e.target.value
                    })}
                    placeholder="Enter coordinator's full name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCoordinator.email}
                    onChange={(e) => setEditingCoordinator({
                      ...editingCoordinator,
                      email: e.target.value
                    })}
                    placeholder="coordinator@example.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingCoordinator.phone}
                    onChange={(e) => setEditingCoordinator({
                      ...editingCoordinator,
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
                    value={editingCoordinator.status}
                    onValueChange={(value) => setEditingCoordinator({
                      ...editingCoordinator,
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
                  <Label htmlFor="edit-password">New Password (optional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingCoordinator.password}
                    onChange={(e) => setEditingCoordinator({
                      ...editingCoordinator,
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
            <Button onClick={onUpdateCoordinator} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen && !isViewDetailsOpen && !isAddOpen && !isEditOpen} onOpenChange={handleDeleteClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCoordinator?.name}'s profile and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                try {
                  // Check if coordinator has any assigned mentors
                  const coordinatorMentors = users.filter(user => user.role === "mentor" && user.supervisorId === selectedCoordinator?.id);
                  if (coordinatorMentors.length > 0) {
                    crudToasts.validation.error("Cannot delete coordinator with assigned mentors. Please reassign or remove all mentors first.");
                    return;
                  }

                  // Update both local state and users array
                  onDeleteCoordinator();
                  // Update the users array directly
                  const index = users.findIndex(u => u.id === selectedCoordinator?.id);
                  if (index !== -1) {
                    users.splice(index, 1);
                  }
                  crudToasts.delete.success("Coordinator");
                } catch (error) {
                  crudToasts.delete.error("Coordinator");
                }
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