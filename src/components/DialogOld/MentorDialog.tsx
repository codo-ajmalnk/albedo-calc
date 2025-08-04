import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { Student, User } from "@/lib/types";
import { format } from "date-fns";

interface MentorDialogProps {
  isViewDetailsOpen: boolean;
  isViewStudentsOpen: boolean;
  selectedMentor: User | null;
  students: Student[];
  onViewDetailsClose: () => void;
  onViewStudentsClose: () => void;
}

export function MentorDialog({
  isViewDetailsOpen,
  isViewStudentsOpen,
  selectedMentor,
  students,
  onViewDetailsClose,
  onViewStudentsClose,
}: MentorDialogProps) {
  // Helper function to close all dialogs
  const closeAllDialogs = () => {
    onViewDetailsClose();
    onViewStudentsClose();
  };

  const handleViewDetailsClose = () => {
    closeAllDialogs();
  };

  const handleViewStudentsClose = () => {
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

      {/* View Students Dialog */}
      <Dialog open={isViewStudentsOpen} onOpenChange={handleViewStudentsClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assigned Students - {selectedMentor?.name}</DialogTitle>
            <DialogDescription>
              Students assigned to this mentor.
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
    </>
  );
} 