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
  selectedCoordinator,
  newCoordinator,
  editingCoordinator,
  stats,
  allStudents,
  onViewDetailsClose,
  setNewCoordinator,
  setEditingCoordinator,
}: CoordinatorDialogProps) {
  // Helper function to close all dialogs
  const closeAllDialogs = () => {
    onViewDetailsClose();
  };

  // Modified handlers to ensure only one dialog is open
  const handleViewDetailsClose = () => {
    closeAllDialogs();
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
                          ? 'bg-palette-info'
                          : stats?.sessionProgress >= 75
                            ? 'bg-palette-accent'
                            : stats?.sessionProgress >= 40
                              ? 'bg-palette-warning'
                              : 'bg-palette-danger'
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
                          ? 'bg-palette-info'
                          : stats?.hoursProgress >= 75
                            ? 'bg-palette-accent'
                            : stats?.hoursProgress >= 40
                              ? 'bg-palette-warning'
                              : 'bg-palette-danger'
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
                          ? 'bg-palette-info'
                          : stats?.paymentsProgress >= 75
                            ? 'bg-palette-accent'
                            : stats?.paymentsProgress >= 40
                              ? 'bg-palette-warning'
                              : 'bg-palette-danger'
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
                          ? 'bg-palette-info'
                          : stats?.overallProgress >= 75
                            ? 'bg-palette-accent'
                            : stats?.overallProgress >= 40
                              ? 'bg-palette-warning'
                              : 'bg-palette-danger'
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
    </>
  );
} 