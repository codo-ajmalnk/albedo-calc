
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateMockStudents } from "@/lib/mock-data";
import { Batch } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, UserPlus } from "lucide-react";
import AddStudentsToBatchModal from "./AddStudentsToBatchModal";

interface ViewStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
}

const ViewStudentsModal = ({ isOpen, onClose, batch }: ViewStudentsModalProps) => {
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const students = generateMockStudents().filter(
    (student) => batch && student.batchId === batch.id
  );

  // Function to determine progress bar color class
  const getProgressColorClass = (progressPercentage: number) => {
    if (progressPercentage < 30) return "bg-progress-low";
    if (progressPercentage < 70) return "bg-progress-medium";
    if (progressPercentage < 100) return "bg-progress-high";
    return "bg-progress-complete";
  };

  if (!batch) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex justify-between items-center">
              <span>Students in {batch.name}</span>
              <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                {students.length} Students
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Manage students in this batch
            </div>
            <Button 
              onClick={() => setIsAddStudentsModalOpen(true)}
              className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Students
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {students.length > 0 ? (
              students.map((student) => (
                <Card key={student.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">{student.name}</span>
                          <span className="text-muted-foreground text-sm">
                            ID: {student.id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Hours:</span>
                          <span>{student.totalHours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span>{student.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>End Date:</span>
                          <span>{student.endDate}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Sessions Completed:</span>
                          <span>
                            {student.sessionsCompleted} / {student.totalSessions}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Progress:</span>
                            <span>{student.progressPercentage}%</span>
                          </div>
                          <Progress
                            value={student.progressPercentage}
                            className="h-2"
                            indicatorClassName={getProgressColorClass(student.progressPercentage)}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining Sessions:</span>
                          <span>{student.sessionsRemaining}</span>
                        </div>
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No students found in this batch.</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
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
