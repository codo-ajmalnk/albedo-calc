import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateMockStudents } from "@/lib/mock-data";
import { Batch } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, UserPlus, Search, Mail, Phone, IndianRupee } from "lucide-react";
import AddStudentsToBatchModal from "./AddStudentsToBatchModal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Student } from "@/lib/types";

interface ViewStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
}

const ViewStudentsModal = ({ isOpen, onClose, batch }: ViewStudentsModalProps) => {
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const allStudents = generateMockStudents().filter(
    (student) => batch && student.batchId === batch.id
  );

  const students = allStudents.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.id.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
  };

  // Function to determine progress bar color class
  const getProgressColorClass = (progressPercentage: number) => {
    if (progressPercentage < 30) return "bg-red-500";
    if (progressPercentage < 70) return "bg-yellow-500";
    if (progressPercentage < 100) return "bg-green-500";
    return "bg-blue-500";
  };

  // Function to get student status
  const getStudentStatus = (progressPercentage: number) => {
    if (progressPercentage === 0) return { label: "Not Started", class: "bg-gray-500/10 text-gray-500" };
    if (progressPercentage === 100) return { label: "Completed", class: "bg-green-500/10 text-green-500" };
    return { label: "In Progress", class: "bg-yellow-500/10 text-yellow-500" };
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!batch) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">
              Students in {batch.name}
            </DialogTitle>
            <DialogDescription>
              View and manage students enrolled in this batch. Total students: {allStudents.length}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Button 
                onClick={() => setIsAddStudentsModalOpen(true)}
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Students
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {students.length > 0 ? (
                students.map((student) => {
                  const status = getStudentStatus(student.progressPercentage);
                  const paymentProgress = (student.paidAmount / student.totalPayment) * 100;
                  return (
                    <Card key={student.id} className="border-border/40 hover:border-border/80 transition-colors">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div className="space-y-1">
                                <h3 className="font-semibold">{student.name}</h3>
                                <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                              </div>
                              <Badge variant="secondary" className={status.class}>
                                {status.label}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-[20px_1fr] gap-2 text-sm items-center">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{student.email}</span>
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{student.phone}</span>
                              <IndianRupee className="h-4 w-4 text-muted-foreground" />
                              <span>{formatCurrency(student.paidAmount)} / {formatCurrency(student.totalPayment)}</span>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Payment Progress</span>
                                <span className="text-sm font-medium">{Math.round(paymentProgress)}%</span>
                              </div>
                              <Progress
                                value={paymentProgress}
                                className="h-2"
                                indicatorClassName={getProgressColorClass(paymentProgress)}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Session Progress</span>
                                <span className="text-sm font-medium">{student.progressPercentage}%</span>
                              </div>
                              <Progress
                                value={student.progressPercentage}
                                className="h-2"
                                indicatorClassName={getProgressColorClass(student.progressPercentage)}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="space-y-2">
                                <div className="text-muted-foreground">Sessions Completed</div>
                                <div className="text-muted-foreground">Remaining Sessions</div>
                                <div className="text-muted-foreground">Total Hours</div>
                                <div className="text-muted-foreground">Session Duration</div>
                              </div>
                              <div className="space-y-2 font-medium">
                                <div>{student.sessionsCompleted} / {student.totalSessions}</div>
                                <div>{student.sessionsRemaining}</div>
                                <div>{student.totalHours} hours</div>
                                <div>{student.sessionDuration}h per session</div>
                              </div>
                            </div>

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleViewDetails(student)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="py-8 border-dashed">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      {allStudents.length === 0 
                        ? "No students found in this batch."
                        : "No students found matching your search criteria."
                      }
                    </p>
                    {search && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setSearch("")}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddStudentsToBatchModal
        isOpen={isAddStudentsModalOpen}
        onClose={() => setIsAddStudentsModalOpen(false)}
        batch={batch}
      />

      {/* Student Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {selectedStudent && (
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
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold mt-1">{selectedStudent.status}</p>
                  <p className="text-sm text-muted-foreground">current</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="text-2xl font-bold mt-1 truncate">{selectedStudent.batchId}</p>
                  <p className="text-sm text-muted-foreground">assigned to</p>
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
                      <span className="text-sm">Remaining Sessions</span>
                      <span className="font-medium">{selectedStudent.sessionsRemaining}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Sessions</span>
                      <span className="font-medium">{selectedStudent.activeSessions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Hours</span>
                      <span className="font-medium">{selectedStudent.totalHours}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Hours</span>
                      <span className="font-medium">{selectedStudent.completedHours?.toFixed(1) || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Hours</span>
                      <span className="font-medium">{selectedStudent.pendingHours?.toFixed(1) || (selectedStudent.totalHours - selectedStudent.sessionsCompleted * selectedStudent.sessionDuration).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Hours</span>
                      <span className="font-medium">{selectedStudent.activeHours?.toFixed(1) || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Payments</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Payment</span>
                      <span className="font-medium">₹{selectedStudent.totalPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Paid Amount</span>
                      <span className="font-medium">₹{selectedStudent.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Payment</span>
                      <span className="font-medium">₹{(selectedStudent.totalPayment - selectedStudent.paidAmount).toLocaleString()}</span>
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
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 === 100
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
                        <span>{Math.round((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 === 100
                              ? 'bg-progress-complete'
                              : ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 >= 75
                              ? 'bg-progress-high'
                              : ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                          }`}
                          style={{ width: `${((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100}%` }}
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
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100 === 100
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
                        <span>{Math.round((
                          (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                          ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 +
                          (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100
                        ) / 3)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            ((
                              (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                              ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 +
                              (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100
                            ) / 3) === 100
                              ? 'bg-progress-complete'
                              : ((
                                  (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                  ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 +
                                  (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100
                                ) / 3) >= 75
                              ? 'bg-progress-high'
                              : ((
                                  (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                                  ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 +
                                  (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100
                                ) / 3) >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                          }`}
                          style={{ width: `${(
                            (selectedStudent.sessionsCompleted / selectedStudent.totalSessions) * 100 +
                            ((selectedStudent.completedHours || (selectedStudent.sessionsCompleted * selectedStudent.sessionDuration)) / selectedStudent.totalHours) * 100 +
                            (selectedStudent.paidAmount / selectedStudent.totalPayment) * 100
                          ) / 3}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-sm">{selectedStudent.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="text-sm">{selectedStudent.endDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewStudentsModal;
