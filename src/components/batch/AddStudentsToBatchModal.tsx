
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Batch, Student } from "@/lib/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";

interface AddStudentsToBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
}

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sessionDuration: z.coerce.number().min(0.5, "Session duration must be at least 0.5 hours"),
  totalHours: z.coerce.number().min(1, "Total hours must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

const AddStudentsToBatchModal = ({ isOpen, onClose, batch }: AddStudentsToBatchModalProps) => {
  const [students, setStudents] = useState<Partial<Student>[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sessionDuration: 1.33, // Default session duration (1 hour 20 mins)
      totalHours: 600, // Default total hours
    },
  });

  const addStudentToList = (data: FormValues) => {
    if (!batch) return;
    
    const totalSessions = Math.ceil(data.totalHours / data.sessionDuration);
    
    const newStudent: Partial<Student> = {
      name: data.name,
      totalHours: data.totalHours,
      sessionDuration: data.sessionDuration,
      totalSessions: totalSessions,
      startDate: batch.sessionStart,
      endDate: batch.sessionEnd,
      sessionsCompleted: 0,
      sessionsRemaining: totalSessions,
      progressPercentage: 0,
      batchId: batch.id,
    };
    
    setStudents([...students, newStudent]);
    form.reset({
      name: "",
      sessionDuration: 1.33,
      totalHours: 600,
    });
  };
  
  const handleSubmit = (data: FormValues) => {
    addStudentToList(data);
  };
  
  const saveAllStudents = () => {
    // In a real app, this would save to a database
    // For now, we'll just show a success message
    toast.success(`${students.length} students added to ${batch?.name}`);
    setStudents([]);
    onClose();
  };

  if (!batch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Add Students to {batch.name}</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sessionDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Duration (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="1.33"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="totalHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="600"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to List
              </Button>
            </form>
          </Form>
          
          <div className="space-y-2">
            <div className="text-sm font-medium flex justify-between">
              <span>Students to add ({students.length})</span>
              {students.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setStudents([])}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {students.length > 0 ? (
                students.map((student, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.totalHours} hours | {student.totalSessions} sessions
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const newStudents = [...students];
                            newStudents.splice(index, 1);
                            setStudents(newStudents);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No students added yet. Add students using the form above.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={saveAllStudents}
            disabled={students.length === 0}
            className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          >
            Save {students.length} Students
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentsToBatchModal;
