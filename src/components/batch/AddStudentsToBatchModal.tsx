import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Batch, Student } from "@/lib/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AddStudentsToBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
}

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  sessionDuration: z.coerce.number().min(0.5, "Session duration must be at least 0.5 hours"),
  totalHours: z.coerce.number().min(1, "Total hours must be at least 1"),
  totalPayment: z.coerce.number().min(0, "Total payment cannot be negative"),
});

type FormValues = z.infer<typeof formSchema>;

const AddStudentsToBatchModal = ({ isOpen, onClose, batch }: AddStudentsToBatchModalProps) => {
  const [students, setStudents] = useState<Partial<Student>[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      sessionDuration: 1.33,
      totalHours: 24,
      totalPayment: 12000,
    },
  });

  const addStudentToList = (data: FormValues) => {
    if (!batch) return;
    
    const totalSessions = Math.ceil(data.totalHours / data.sessionDuration);
    
    const newStudent: Partial<Student> = {
      id: `student${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      mentorId: "",
      status: "active" as const,
      totalSessions: 12,
      sessionsCompleted: 0,
      totalHours: 24,
      totalPayment: data.totalPayment,
      paidAmount: 0,
      batchId: batch.id,
      sessionDuration: data.sessionDuration,
      startDate: batch.sessionStart,
      endDate: batch.sessionEnd,
      sessionsRemaining: totalSessions,
      progressPercentage: 0
    };
    
    setStudents([...students, newStudent]);
    form.reset({
      name: "",
      email: "",
      phone: "",
      sessionDuration: 1.33,
      totalHours: 24,
      totalPayment: 12000,
    });
  };
  
  const handleSubmit = (data: FormValues) => {
    addStudentToList(data);
  };
  
  const saveAllStudents = () => {
    toast.success(`${students.length} students added to ${batch?.name}`);
    setStudents([]);
    onClose();
  };

  if (!batch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold">Add Students</DialogTitle>
          <DialogDescription>
            Add new students to {batch.name}. Students will start from {batch.sessionStart}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter student name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="student@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Payment *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="12000"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sessionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Duration (hours) *</FormLabel>
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
                        <FormLabel>Total Hours *</FormLabel>
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
              </div>
              
              <Button type="submit" className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add to List
              </Button>
            </form>
          </Form>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Students to Add</h4>
                <p className="text-sm text-muted-foreground">
                  {students.length} student{students.length !== 1 ? 's' : ''} in list
                </p>
              </div>
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
                  <Card key={index} className="border-border/40">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium truncate">{student.name}</div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {student.totalSessions} sessions
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {student.email} | {student.phone}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.totalHours} hours | ₹{student.totalPayment}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            const newStudents = [...students];
                            newStudents.splice(index, 1);
                            setStudents(newStudents);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="py-8 border-dashed">
                  <div className="text-center text-muted-foreground">
                    No students added yet. Use the form above to add students.
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={saveAllStudents}
            disabled={students.length === 0}
          >
            Save {students.length} Student{students.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentsToBatchModal;
