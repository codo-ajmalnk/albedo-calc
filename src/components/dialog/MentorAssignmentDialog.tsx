import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import ProgressBar from "../ProgressBar";
import { Users } from "lucide-react";

// Define the types for the props
interface MentorAssignmentDialogProps {
  open: boolean;
  userRole: string;
  onOpenChange: (open: boolean) => void;
  coordinator?: { user: { id: string; name: string } };
  getAssignedMentors: (coordinatorId: string) => any[];
  allStudents: any[];
  formatCurrency: (amount: number) => string;
}

const MentorAssignmentDialog: React.FC<MentorAssignmentDialogProps> = ({
  open,
  userRole,
  onOpenChange,
  coordinator,
  getAssignedMentors,
  allStudents,
  formatCurrency,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          Assigned Mentors - {coordinator?.user.name}
        </DialogTitle>
        <DialogDescription>
          Manage mentors assigned to this coordinator.
        </DialogDescription>
      </DialogHeader>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead className="text-center">Sessions</TableHead>
              <TableHead className="text-center">Hours</TableHead>
              <TableHead className="text-center">Payments</TableHead>
              <TableHead className="text-center">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coordinator?.user.id &&
              getAssignedMentors(coordinator.user.id).map((mentor: any) => {
                const mentorStudents = allStudents.filter(
                  (student: any) => student.mentorId === mentor.id
                );
                const totalSessions = mentorStudents.reduce(
                  (sum: number, student: any) => sum + student.totalSessions,
                  0
                );
                const completedSessions = mentorStudents.reduce(
                  (sum: number, student: any) => sum + student.sessionsCompleted,
                  0
                );
                const totalHours = mentorStudents.reduce(
                  (sum: number, student: any) => sum + student.totalHours,
                  0
                );
                const completedHours = mentorStudents.reduce(
                  (sum: number, student: any) =>
                    sum +
                    student.totalHours *
                      (student.sessionsCompleted / student.totalSessions),
                  0
                );
                const totalPayments = mentorStudents.reduce(
                  (sum: number, student: any) => sum + student.totalPayment,
                  0
                );
                const completedPayments = mentorStudents.reduce(
                  (sum: number, student: any) => sum + student.paidAmount,
                  0
                );
                const progressPercentage =
                  totalSessions > 0
                    ? Math.floor((completedSessions / totalSessions) * 100)
                    : 0;

                return (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium">{mentor.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{mentor.name}</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              mentor.status === "active"
                                ? "bg-green-100 text-palette-accent"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {mentor.status || "active"}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {mentor.phone || "No phone number"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {
                            mentorStudents.filter(
                              (student: any) => student.status === "active"
                            ).length
                          }
                          /{mentorStudents.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {completedSessions}/{totalSessions}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {completedSessions} completed
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {Math.round(completedHours)}/{totalHours}h
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(completedHours)}h completed
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatCurrency(completedPayments)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          of {formatCurrency(totalPayments)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <ProgressBar progress={progressPercentage} className="w-16" />
                        <span className="text-xs text-muted-foreground">
                          {progressPercentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            {(!coordinator?.user.id ||
              getAssignedMentors(coordinator.user.id).length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Users className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">
                      No mentors found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assign or add new mentors to get started
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

export default MentorAssignmentDialog;