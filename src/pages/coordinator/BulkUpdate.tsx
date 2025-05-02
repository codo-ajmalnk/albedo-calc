import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Save, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { students as allStudents, users } from "@/lib/mock-data";
import { Student, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";

const bulkUpdateSchema = z.object({
  selectedFields: z.array(z.string()).min(1, {
    message: "Select at least one field to update",
  }),
  status: z.string().optional(),
  mentorId: z.string().optional(),
  totalSessions: z.number().optional(),
  sessionsCompleted: z.number().optional(),
  totalHours: z.number().optional(),
  completedHours: z.number().optional(),
  totalPayment: z.number().optional(),
  paidAmount: z.number().optional(),
  teachersPayment: z.number().optional(),
  hourlyPayment: z.number().optional(),
  sessionDuration: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sessionAddedOn: z.date().optional(),
});

type BulkUpdateFormValues = z.infer<typeof bulkUpdateSchema>;

export default function BulkUpdate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Get mentors under this coordinator
  const myMentors = users.filter(
    (u) => u.role === "mentor" && u.supervisorId === user?.id
  );
  const mentorIds = myMentors.map((mentor) => mentor.id);
  // Only students under this coordinator's mentors
  const initialStudents = allStudents.filter((student) =>
    mentorIds.includes(student.mentorId)
  );

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMentor, setFilterMentor] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editableStudents, setEditableStudents] = useState<Record<string, Partial<Student>>>({});

  // Form for bulk updates
  const form = useForm<BulkUpdateFormValues>({
    resolver: zodResolver(bulkUpdateSchema),
    defaultValues: {
      selectedFields: [],
      status: undefined,
      mentorId: undefined,
      totalSessions: undefined,
      sessionsCompleted: undefined,
      totalHours: undefined,
      completedHours: undefined,
      totalPayment: undefined,
      paidAmount: undefined,
      teachersPayment: undefined,
      hourlyPayment: undefined,
      sessionDuration: undefined,
      startDate: undefined,
      endDate: undefined,
      sessionAddedOn: undefined,
    },
  });

  // Apply filters
  useEffect(() => {
    let result = students;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term)
      );
    }
    if (filterMentor) {
      result = result.filter(student => student.mentorId === filterMentor);
    }
    if (filterStatus) {
      result = result.filter(student => student.status === filterStatus);
    }
    setFilteredStudents(result);
  }, [searchTerm, filterMentor, filterStatus, students]);

  // Initialize editable students
  useEffect(() => {
    const newEditableStudents: Record<string, Partial<Student>> = {};
    students.forEach(student => {
      newEditableStudents[student.id] = {
        status: student.status,
        mentorId: student.mentorId,
        totalSessions: student.totalSessions,
        sessionsCompleted: student.sessionsCompleted,
        totalHours: student.totalHours,
        completedHours: student.completedHours,
        totalPayment: student.totalPayment,
        paidAmount: student.paidAmount,
        teachersPayment: student.teachersPayment,
        hourlyPayment: student.hourlyPayment,
        sessionDuration: student.sessionDuration,
        startDate: student.startDate,
        endDate: student.endDate,
        sessionAddedOn: student.sessionAddedOn,
      };
    });
    setEditableStudents(newEditableStudents);
  }, [students]);

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  // Handle single student selection
  const handleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterMentor(null);
    setFilterStatus(null);
  };

  // Handle field change for an individual student
  const handleFieldChange = (studentId: string, field: keyof Student, value: any) => {
    setEditableStudents(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      }
    }));
  };

  // Save changes for all edited students
  const saveChanges = () => {
    setIsUpdating(true);
    try {
      const updatedStudents = students.map(student => {
        const editedFields = editableStudents[student.id];
        if (!editedFields) return student;
        const updatedStudent = { ...student };
        if (editedFields.status) {
          updatedStudent.status = editedFields.status as "active" | "inactive";
        }
        if (editedFields.mentorId) {
          updatedStudent.mentorId = editedFields.mentorId;
        }
        if (editedFields.totalSessions) {
          updatedStudent.totalSessions = Number(editedFields.totalSessions);
          updatedStudent.sessionsRemaining = updatedStudent.totalSessions - updatedStudent.sessionsCompleted;
          updatedStudent.progressPercentage = Math.round((updatedStudent.sessionsCompleted / updatedStudent.totalSessions) * 100);
        }
        if (editedFields.totalHours) {
          updatedStudent.totalHours = Number(editedFields.totalHours);
        }
        if (editedFields.totalPayment) {
          updatedStudent.totalPayment = Number(editedFields.totalPayment);
        }
        if (editedFields.sessionDuration) {
          updatedStudent.sessionDuration = Number(editedFields.sessionDuration);
        }
        if (editedFields.startDate) {
          updatedStudent.startDate = editedFields.startDate;
        }
        if (editedFields.endDate) {
          updatedStudent.endDate = editedFields.endDate;
        }
        if (editedFields.sessionAddedOn) {
          updatedStudent.sessionAddedOn = editedFields.sessionAddedOn;
        }
        return updatedStudent;
      });
      setStudents(updatedStudents);
      addNotification(
        "Update Successful",
        "Updated student data successfully.",
        "success"
      );
    } catch (error) {
      addNotification(
        "Update Failed",
        "There was an error updating the students. Please try again.",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle bulk update submission
  const handleBulkUpdate = (values: BulkUpdateFormValues) => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to update.",
        variant: "destructive",
      });
      return;
    }
    if (values.selectedFields.length === 0) {
      toast({
        title: "No fields selected",
        description: "Please select at least one field to update.",
        variant: "destructive",
      });
      return;
    }
    setIsUpdating(true);
    try {
      const updatedStudents = students.map(student => {
        if (!selectedStudents.includes(student.id)) {
          return student;
        }
        const updatedStudent = { ...student };
        if (values.selectedFields.includes("status") && values.status) {
          updatedStudent.status = values.status as "active" | "inactive";
          handleFieldChange(student.id, "status", values.status);
        }
        if (values.selectedFields.includes("mentorId") && values.mentorId) {
          updatedStudent.mentorId = values.mentorId;
          handleFieldChange(student.id, "mentorId", values.mentorId);
        }
        if (values.selectedFields.includes("totalSessions") && values.totalSessions) {
          updatedStudent.totalSessions = values.totalSessions;
          updatedStudent.sessionsRemaining = values.totalSessions - updatedStudent.sessionsCompleted;
          updatedStudent.progressPercentage = Math.round((updatedStudent.sessionsCompleted / values.totalSessions) * 100);
          handleFieldChange(student.id, "totalSessions", values.totalSessions);
        }
        if (values.selectedFields.includes("sessionsCompleted") && values.sessionsCompleted) {
          updatedStudent.sessionsCompleted = values.sessionsCompleted;
          updatedStudent.sessionsRemaining = updatedStudent.totalSessions - values.sessionsCompleted;
          updatedStudent.progressPercentage = Math.round((values.sessionsCompleted / updatedStudent.totalSessions) * 100);
          handleFieldChange(student.id, "sessionsCompleted", values.sessionsCompleted);
        }
        if (values.selectedFields.includes("totalHours") && values.totalHours) {
          updatedStudent.totalHours = values.totalHours;
          handleFieldChange(student.id, "totalHours", values.totalHours);
        }
        if (values.selectedFields.includes("completedHours") && values.completedHours) {
          updatedStudent.completedHours = values.completedHours;
          handleFieldChange(student.id, "completedHours", values.completedHours);
        }
        if (values.selectedFields.includes("totalPayment") && values.totalPayment) {
          updatedStudent.totalPayment = values.totalPayment;
          handleFieldChange(student.id, "totalPayment", values.totalPayment);
        }
        if (values.selectedFields.includes("paidAmount") && values.paidAmount) {
          updatedStudent.paidAmount = values.paidAmount;
          handleFieldChange(student.id, "paidAmount", values.paidAmount);
        }
        if (values.selectedFields.includes("teachersPayment") && values.teachersPayment) {
          updatedStudent.teachersPayment = values.teachersPayment;
          handleFieldChange(student.id, "teachersPayment", values.teachersPayment);
        }
        if (values.selectedFields.includes("hourlyPayment") && values.hourlyPayment) {
          updatedStudent.hourlyPayment = values.hourlyPayment;
          handleFieldChange(student.id, "hourlyPayment", values.hourlyPayment);
        }
        if (values.selectedFields.includes("sessionDuration") && values.sessionDuration) {
          updatedStudent.sessionDuration = values.sessionDuration;
          handleFieldChange(student.id, "sessionDuration", values.sessionDuration);
        }
        if (values.selectedFields.includes("startDate") && values.startDate) {
          updatedStudent.startDate = values.startDate.toISOString();
          handleFieldChange(student.id, "startDate", values.startDate.toISOString());
        }
        if (values.selectedFields.includes("endDate") && values.endDate) {
          updatedStudent.endDate = values.endDate.toISOString();
          handleFieldChange(student.id, "endDate", values.endDate.toISOString());
        }
        if (values.selectedFields.includes("sessionAddedOn") && values.sessionAddedOn) {
          updatedStudent.sessionAddedOn = values.sessionAddedOn.toISOString();
          handleFieldChange(student.id, "sessionAddedOn", values.sessionAddedOn.toISOString());
        }
        return updatedStudent;
      });
      setStudents(updatedStudents);
      setSelectedStudents([]);
      form.reset({
        selectedFields: [],
        status: undefined,
        mentorId: undefined,
        totalSessions: undefined,
        sessionsCompleted: undefined,
        totalHours: undefined,
        completedHours: undefined,
        totalPayment: undefined,
        paidAmount: undefined,
        teachersPayment: undefined,
        hourlyPayment: undefined,
        sessionDuration: undefined,
        startDate: undefined,
        endDate: undefined,
        sessionAddedOn: undefined,
      });
      addNotification(
        "Bulk Update Successful",
        `Updated ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''} successfully.`,
        "success"
      );
    } catch (error) {
      addNotification(
        "Update Failed",
        "There was an error updating the students. Please try again.",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Bulk Student Updates</h1>
            <p className="text-muted-foreground">
              Update multiple students simultaneously
            </p>
          </div>
          <Button onClick={saveChanges} disabled={isUpdating} className="gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
        {/* Filters */}
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center">
              <CardTitle>Filter Students</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs flex items-center gap-2"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search by Name/Email/ID</Label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter by Mentor</Label>
                <Select
                  value={filterMentor || "all"}
                  onValueChange={(value) => setFilterMentor(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentors</SelectItem>
                    {myMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Filter by Status</Label>
                <Select
                  value={filterStatus || "all"}
                  onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6">
          {/* Student Table */}
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex justify-between items-center">
                <CardTitle>Students ({filteredStudents.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedStudents.length > 0 ? "default" : "outline"}>
                    {selectedStudents.length} selected
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredStudents.length > 0 &&
                          selectedStudents.length === filteredStudents.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Sessions Completed</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Completed Hours</TableHead>
                    <TableHead>Total Payment (₹)</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Teachers Payment</TableHead>
                    <TableHead>Hourly Payment</TableHead>
                    <TableHead>Session Duration</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Session Added On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="h-24 text-center">
                        No students match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudents.includes(student.id);
                      const editable = editableStudents[student.id] || {};
                      return (
                        <TableRow
                          key={student.id}
                          className={cn(isSelected && "bg-muted/50")}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectStudent(student.id)}
                              aria-label={`Select ${student.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <Select
                              value={editable.status || student.status}
                              onValueChange={(value) => handleFieldChange(student.id, "status", value)}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editable.mentorId || student.mentorId}
                              onValueChange={(value) => handleFieldChange(student.id, "mentorId", value)}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {myMentors.map((mentor) => (
                                  <SelectItem key={mentor.id} value={mentor.id}>
                                    {mentor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.totalSessions || student.totalSessions}
                              onChange={(e) => handleFieldChange(student.id, "totalSessions", parseInt(e.target.value) || 0)}
                              min={1}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.sessionsCompleted || student.sessionsCompleted}
                              onChange={(e) => handleFieldChange(student.id, "sessionsCompleted", parseInt(e.target.value) || 0)}
                              min={0}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.totalHours || student.totalHours}
                              onChange={(e) => handleFieldChange(student.id, "totalHours", parseInt(e.target.value) || 0)}
                              min={1}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.completedHours || student.completedHours}
                              onChange={(e) => handleFieldChange(student.id, "completedHours", parseInt(e.target.value) || 0)}
                              min={0}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.totalPayment || student.totalPayment}
                              onChange={(e) => handleFieldChange(student.id, "totalPayment", parseInt(e.target.value) || 0)}
                              min={0}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.paidAmount || student.paidAmount}
                              onChange={(e) => handleFieldChange(student.id, "paidAmount", parseInt(e.target.value) || 0)}
                              min={0}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.teachersPayment || student.teachersPayment}
                              onChange={(e) => handleFieldChange(student.id, "teachersPayment", parseInt(e.target.value) || 0)}
                              min={0}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-full h-8 text-xs sm:text-sm px-2"
                              value={editable.hourlyPayment || student.hourlyPayment}
                              onChange={(e) => handleFieldChange(student.id, "hourlyPayment", parseInt(e.target.value) || 0)}
                              min={0}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={(editable.sessionDuration || student.sessionDuration).toString()}
                              onValueChange={(value) => handleFieldChange(student.id, "sessionDuration", parseInt(value))}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 Minutes</SelectItem>
                                <SelectItem value="45">45 Minutes</SelectItem>
                                <SelectItem value="60">60 Minutes</SelectItem>
                                <SelectItem value="90">90 Minutes</SelectItem>
                                <SelectItem value="120">120 Minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="w-full h-8 text-xs font-normal"
                                >
                                  {editable.startDate ? format(new Date(editable.startDate), "dd/MM/yy") :
                                    student.startDate ? format(new Date(student.startDate), "dd/MM/yy") :
                                      "Pick date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={editable.startDate ? new Date(editable.startDate) :
                                    student.startDate ? new Date(student.startDate) : undefined}
                                  onSelect={(date) => handleFieldChange(student.id, "startDate", date ? date.toISOString() : '')}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="w-full h-8 text-xs font-normal"
                                >
                                  {editable.endDate ? format(new Date(editable.endDate), "dd/MM/yy") :
                                    student.endDate ? format(new Date(student.endDate), "dd/MM/yy") :
                                      "Pick date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={editable.endDate ? new Date(editable.endDate) :
                                    student.endDate ? new Date(student.endDate) : undefined}
                                  onSelect={(date) => handleFieldChange(student.id, "endDate", date ? date.toISOString() : '')}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="w-full h-8 text-xs font-normal"
                                >
                                  {editable.sessionAddedOn ? format(new Date(editable.sessionAddedOn), "dd/MM/yy") :
                                    student.sessionAddedOn ? format(new Date(student.sessionAddedOn), "dd/MM/yy") :
                                      "Pick date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={editable.sessionAddedOn ? new Date(editable.sessionAddedOn) :
                                    student.sessionAddedOn ? new Date(student.sessionAddedOn) : undefined}
                                  onSelect={(date) => handleFieldChange(student.id, "sessionAddedOn", date ? date.toISOString() : '')}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Bulk Update Form */}
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle>Bulk Update Selected Students</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleBulkUpdate)} className="space-y-6">
                  <div className="space-y-3">
                    <FormLabel>Select fields to update</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["status", "mentorId", "totalSessions", "sessionsCompleted", "totalHours", "completedHours", "totalPayment", "paidAmount", "teachersPayment", "hourlyPayment", "sessionDuration", "startDate", "endDate", "sessionAddedOn"].map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={form.watch("selectedFields").includes(field)}
                            onCheckedChange={(checked) => {
                              const currentSelected = form.watch("selectedFields");
                              if (checked) {
                                form.setValue("selectedFields", [...currentSelected, field]);
                              } else {
                                form.setValue(
                                  "selectedFields",
                                  currentSelected.filter((f) => f !== field)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={field}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {field
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Render form fields as in admin BulkUpdate, using myMentors for mentor select */}
                    {form.watch("selectedFields").includes("status") && (
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("mentorId") && (
                      <FormField
                        control={form.control}
                        name="mentorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned Mentor</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mentor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {myMentors.map((mentor) => (
                                  <SelectItem key={mentor.id} value={mentor.id}>
                                    {mentor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {/* ...other fields as in admin BulkUpdate... */}
                    {form.watch("selectedFields").includes("totalSessions") && (
                      <FormField
                        control={form.control}
                        name="totalSessions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Sessions</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("sessionsCompleted") && (
                      <FormField
                        control={form.control}
                        name="sessionsCompleted"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sessions Completed</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("totalHours") && (
                      <FormField
                        control={form.control}
                        name="totalHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Hours</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("completedHours") && (
                      <FormField
                        control={form.control}
                        name="completedHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Completed Hours</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("totalPayment") && (
                      <FormField
                        control={form.control}
                        name="totalPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Payment (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("paidAmount") && (
                      <FormField
                        control={form.control}
                        name="paidAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paid Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("teachersPayment") && (
                      <FormField
                        control={form.control}
                        name="teachersPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teachers Payment</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("hourlyPayment") && (
                      <FormField
                        control={form.control}
                        name="hourlyPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Payment</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("sessionDuration") && (
                      <FormField
                        control={form.control}
                        name="sessionDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Duration (minutes)</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30">30 Minutes</SelectItem>
                                <SelectItem value="45">45 Minutes</SelectItem>
                                <SelectItem value="60">60 Minutes</SelectItem>
                                <SelectItem value="90">90 Minutes</SelectItem>
                                <SelectItem value="120">120 Minutes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("startDate") && (
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Session Starting Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("endDate") && (
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Session Ending Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {form.watch("selectedFields").includes("sessionAddedOn") && (
                      <FormField
                        control={form.control}
                        name="sessionAddedOn"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Session Added On</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <div className="pt-4 space-x-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        setSelectedStudents([]);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isUpdating ||
                        selectedStudents.length === 0 ||
                        form.watch("selectedFields").length === 0
                      }
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Update Selected
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 