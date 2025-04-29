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
    </>
  );
};

export default ViewStudentsModal;
