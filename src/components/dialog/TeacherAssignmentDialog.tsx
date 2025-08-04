import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Users } from "lucide-react";

// Define a minimal Teacher type for this dialog
interface Teacher {
  id: string;
  name: string;
  status: "active" | "inactive";
  totalSessions: number;
  totalHours: number;
  salary: number;
  durationDays: number;
  progress: number; // 0-100
  completedSessions?: number;
  completedHours?: number;
  paidAmount?: number;
}

interface TeacherAssignmentDialogProps {
  open: boolean;
  userRole: string;
  onOpenChange: (open: boolean) => void;
  teachers: Teacher[];
}

const TeacherAssignmentDialog: React.FC<TeacherAssignmentDialogProps> = ({
  open,
  onOpenChange,
  teachers,
  userRole,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Assigned Teachers</DialogTitle>
        <DialogDescription>Manage teachers and view their progress.</DialogDescription>
      </DialogHeader>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Duration (days)</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length > 0 ? (
              teachers.map((teacher) => {
                const progress = Math.round(
                  ((teacher.completedSessions ?? 8) / (teacher.totalSessions ?? 12)) * 100
                );
                const paymentProgress = Math.round(
                  ((teacher.paidAmount ?? 8000) / (teacher.salary ?? 15000)) * 100
                );
                return (
                  <TableRow key={teacher.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium hidden md:table-cell">{teacher.id}</TableCell>
                    <TableCell>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{teacher.name}</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              teacher.status === "active"
                                ? "bg-green-100 text-palette-accent"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {teacher.status}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          {(teacher.completedSessions ?? 8)}/{teacher.totalSessions ?? 12}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {((teacher.totalSessions ?? 12) - (teacher.completedSessions ?? 8))} left
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          {(teacher.completedHours ?? 16)}/{teacher.totalHours ?? 24}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {((teacher.totalHours ?? 24) - (teacher.completedHours ?? 16))} left
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          ₹{(teacher.paidAmount ?? 8000).toLocaleString()}/₹{(teacher.salary ?? 15000).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {paymentProgress}% paid
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.durationDays ?? 90}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progress === 100
                                ? "bg-progress-complete"
                                : progress >= 75
                                ? "bg-progress-high"
                                : progress >= 40
                                ? "bg-progress-medium"
                                : "bg-progress-low"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums w-[3ch]">
                          {progress}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Users className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">No teachers found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
);

export default TeacherAssignmentDialog;