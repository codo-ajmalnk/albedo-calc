import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Users } from "lucide-react";
import type { Student, User, Role } from "@/lib/types";

interface StudentAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coordinator?: { user: { id: string; name: string } };
  getStudents: (coordinatorId: string) => Student[];
  users: User[];
  userRole: Role;
}

const StudentAssignmentDialog: React.FC<StudentAssignmentDialogProps> = ({
  open,
  onOpenChange,
  coordinator,
  getStudents,
  users,
  userRole,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[95vw] w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 md:p-6">
      <DialogHeader className="mb-4">
        <DialogTitle className="text-base sm:text-lg font-semibold">
          Students Under {coordinator?.user.name}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          View all students managed by this coordinator's mentors.
        </DialogDescription>
      </DialogHeader>
      <div className="relative overflow-x-auto -mx-2 sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] font-medium hidden md:table-cell">ID</TableHead>
              <TableHead className="font-medium min-w-[120px]">Name</TableHead>
              {userRole !== "mentor" && (
                <TableHead className="font-medium min-w-[120px] hidden sm:table-cell">Mentor</TableHead>
              )}
              <TableHead className="font-medium min-w-[100px]">Sessions</TableHead>
              <TableHead className="font-medium min-w-[100px] hidden sm:table-cell">Hours</TableHead>
              <TableHead className="font-medium min-w-[120px] hidden md:table-cell">Payments</TableHead>
              <TableHead className="font-medium w-[120px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coordinator &&
              getStudents(coordinator.user.id).map((student) => {
                const mentor = users.find((u) => u.id === student.mentorId);
                const progress = Math.round(
                  (student.sessionsCompleted / student.totalSessions) * 100
                );
                const paymentProgress = Math.round(
                  (student.paidAmount / student.totalPayment) * 100
                );
                return (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium hidden md:table-cell">
                      {student.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{student.name}</span>
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
                    </TableCell>
                    {userRole !== "mentor" && (
                      <TableCell className="hidden sm:table-cell">
                        {mentor?.name || "Not Assigned"}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          {student.sessionsCompleted}/{student.totalSessions}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {student.sessionsRemaining} left
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          {Math.round(
                            student.sessionsCompleted * student.sessionDuration
                          )}
                          /{student.totalHours}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {Math.round(
                            student.sessionsRemaining * student.sessionDuration
                          )} left
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          ₹{student.paidAmount.toLocaleString()}/₹
                          {student.totalPayment.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {paymentProgress}% paid
                        </span>
                      </div>
                    </TableCell>
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
              })}
            {coordinator &&
              getStudents(coordinator.user.id).length === 0 && (
                <TableRow>
                  <TableCell colSpan={userRole !== "mentor" ? 8 : 7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Users className="h-8 w-8 text-muted-foreground/60" />
                      <p className="text-sm text-muted-foreground">
                        No students found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This coordinator's mentors don't have any assigned students yet
                      </p>
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

export default StudentAssignmentDialog;