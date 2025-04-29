import { useState } from "react";
import { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressBar from "@/components/ProgressBar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

interface StudentCardProps {
  student: Student;
  onUpdateStudent: (updatedStudent: Student) => void;
  canEdit: boolean;
}

const StudentCard = ({ student, onUpdateStudent, canEdit }: StudentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student>({...student});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = name === 'sessionsCompleted' || name === 'sessionDuration' 
      ? parseFloat(value) 
      : value;
      
    setEditedStudent(prev => {
      const updated = { 
        ...prev, 
        [name]: numValue 
      };
      
      // Recalculate sessions remaining and progress percentage
      if (name === 'sessionsCompleted') {
        const completed = parseFloat(value);
        updated.sessionsRemaining = updated.totalSessions - completed;
        updated.progressPercentage = Math.floor((completed / updated.totalSessions) * 100);
      }
      
      return updated;
    });
  };
  
  const handleSubmit = () => {
    onUpdateStudent(editedStudent);
    setIsEditing(false);
    toast.success("Student data updated successfully");
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{student.name}</span>
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sessions Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Sessions Overview</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Total Sessions:</div>
            <div>{student.totalSessions}</div>
            
            <div className="font-medium">Completed Sessions:</div>
            <div>{student.sessionsCompleted}</div>
            
            <div className="font-medium">Pending Sessions:</div>
            <div>{student.sessionsRemaining}</div>
            
            <div className="font-medium">Active Sessions:</div>
            <div>{student.activeSessions || 0}</div>
          </div>
        </div>

        {/* Hours Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Hours Overview</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Total Hours:</div>
            <div>{student.totalHours}</div>
            
            <div className="font-medium">Session Duration:</div>
            <div>{student.sessionDuration} hours</div>
            
            <div className="font-medium">Completed Hours:</div>
            <div>{student.completedHours || 0}</div>
            
            <div className="font-medium">Pending Hours:</div>
            <div>{student.pendingHours || 0}</div>
            
            <div className="font-medium">Active Hours:</div>
            <div>{student.activeHours || 0}</div>
          </div>
        </div>

        {/* Payments Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Payments Overview</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Total Payments:</div>
            <div>{student.totalPayments || 0}</div>
            
            <div className="font-medium">Completed Payments:</div>
            <div>{student.completedPayments || 0}</div>
            
            <div className="font-medium">Pending Payments:</div>
            <div>{student.pendingPayments || 0}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Start Date:</div>
            <div>{formatDate(student.startDate)}</div>
            
            <div className="font-medium">End Date:</div>
            <div>{formatDate(student.endDate)}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">{student.progressPercentage}%</span>
          </div>
          <ProgressBar progress={student.progressPercentage} />
        </div>
      </CardContent>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update {student.name}'s Progress</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionsCompleted" className="text-right">
                Completed Sessions
              </Label>
              <Input
                id="sessionsCompleted"
                name="sessionsCompleted"
                type="number"
                value={editedStudent.sessionsCompleted}
                onChange={handleInputChange}
                max={editedStudent.totalSessions}
                min={0}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessionDuration" className="text-right">
                Session Duration (hours)
              </Label>
              <Input
                id="sessionDuration"
                name="sessionDuration"
                type="number"
                step="0.01"
                value={editedStudent.sessionDuration}
                onChange={handleInputChange}
                min={0.1}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StudentCard;
