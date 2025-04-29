import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users, students, generateDashboardStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student, User } from "@/lib/types";
import { UserSearch, Eye, Edit, Plus, Trash2, Users, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { crudToasts } from "@/lib/toast";

const AdminMentors = () => {
  const [search, setSearch] = useState("");
  const [coordinatorFilter, setCoordinatorFilter] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<{
    user: User;
    stats: ReturnType<typeof getMentorStats>;
  } | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);
  const [isEditingMentor, setIsEditingMentor] = useState(false);
  const [isDeletingMentor, setIsDeletingMentor] = useState(false);
  const [isViewingStudents, setIsViewingStudents] = useState(false);
  const [mentors, setMentors] = useState(users.filter((user) => user.role === "mentor"));
  const [students, setStudents] = useState<Student[]>([]);
  const [newMentor, setNewMentor] = useState({
    id: `mentor${users.filter(u => u.role === "mentor").length + 1}`,
    name: "",
    email: "",
    phone: "",
    password: "",
    supervisorId: "",
    role: "mentor" as const,
  });
  const [editingMentor, setEditingMentor] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    supervisorId: string;
    role: "mentor";
  } | null>(null);

  const coordinators = users.filter((user) => user.role === "coordinator");

  // Add useEffect to initialize students
  useEffect(() => {
    // Initialize students from the mock data
    setStudents(students || []);
  }, []); // Run once on component mount

  const getMentorStats = (mentorId: string) => {
    const mentorStudents = students.filter(student => student.mentorId === mentorId);

    const totalSessions = mentorStudents.reduce(
      (sum, student) => sum + student.totalSessions,
      0
    );
    const completedSessions = mentorStudents.reduce(
      (sum, student) => sum + student.sessionsCompleted,
      0
    );
    const totalHours = mentorStudents.reduce(
      (sum, student) => sum + student.totalHours,
      0
    );
    const completedHours = mentorStudents.reduce(
      (sum, student) => sum + (student.totalHours * (student.sessionsCompleted / student.totalSessions)),
      0
    );

    const stats = generateDashboardStats(mentorStudents);

    return {
      studentCount: mentorStudents.length,
      totalSessions,
      completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      sessionProgress: totalSessions > 0 ? Math.floor((completedSessions / totalSessions) * 100) : 0,
      hoursProgress: totalHours > 0 ? Math.floor((completedHours / totalHours) * 100) : 0,
      overallProgress: stats.overallProgress,
      activeStudents: mentorStudents.filter(s => s.status === 'active').length,
      completedPayments: stats.completedPayments,
      pendingPayments: stats.pendingPayments,
      totalPayments: stats.totalPayments,
      paymentsProgress: stats.totalPayments > 0 ? Math.floor((stats.completedPayments / stats.totalPayments) * 100) : 0,
    };
  };
  
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name.toLowerCase().includes(search.toLowerCase());
    const matchesCoordinator = coordinatorFilter === "all" || mentor.supervisorId === coordinatorFilter;
    return matchesSearch && matchesCoordinator;
  });

  const getCoordinatorName = (coordinatorId: string) => {
    const coordinator = users.find((user) => user.id === coordinatorId);
    return coordinator ? coordinator.name : "Unassigned";
  };
  
  const handleViewDetails = (mentor: User) => {
    const stats = getMentorStats(mentor.id);
    setSelectedMentor({ user: mentor, stats });
  };

  const handleViewStudents = (mentor: User) => {
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setIsViewingStudents(true);
  };

  const handleEditProfile = (mentor: User) => {
    setEditingMentor({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone || "",
      password: "",
      supervisorId: mentor.supervisorId || "",
      role: "mentor",
    });
    setIsEditingMentor(true);
  };

  const handleDeleteMentor = (mentor: User) => {
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setIsDeletingMentor(true);
  };

  const confirmDeleteMentor = () => {
    if (!selectedMentor) return;
    
    try {
      setMentors(mentors.filter(mentor => mentor.id !== selectedMentor.user.id));
      setIsDeletingMentor(false);
      setSelectedMentor(null);
      crudToasts.delete.success("Mentor");
    } catch (error) {
      crudToasts.delete.error("Mentor");
    }
  };

  const handleAddMentor = () => {
    try {
      if (!newMentor.name || !newMentor.email || !newMentor.phone) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      setMentors([...mentors, { ...newMentor, role: "mentor" }]);
      setIsAddingMentor(false);
      setNewMentor({
        id: `mentor${mentors.length + 2}`,
        name: "",
        email: "",
        phone: "",
        password: "",
        supervisorId: "",
        role: "mentor" as const,
      });
      crudToasts.create.success("Mentor");
    } catch (error) {
      crudToasts.create.error("Mentor");
    }
  };

  const handleUpdateMentor = () => {
    if (!editingMentor) return;
    
    try {
      setMentors(mentors.map(mentor =>
        mentor.id === editingMentor.id ? { ...editingMentor, role: "mentor" } : mentor
      ));
      setIsEditingMentor(false);
      setEditingMentor(null);
      crudToasts.update.success("Mentor");
    } catch (error) {
      crudToasts.update.error("Mentor");
    }
  };

  // Add new state variables for student management
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Student>({
    id: `student${students.length + 1}`,
    name: "",
    email: "",
    phone: "",
    mentorId: "",
    status: "active",
    totalSessions: 12,
    sessionsCompleted: 0,
    totalHours: 24,
    totalPayment: 12000,
    paidAmount: 0,
    batchId: "",
    sessionsRemaining: 12,
    progressPercentage: 0,
    startDate: "",
    endDate: "",
    sessionDuration: 1.33
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Add handlers for student operations
  const handleAddStudent = () => {
    if (!selectedMentor) return;

    students.push({
      ...newStudent,
      id: `student${students.length + 1}`,
      mentorId: selectedMentor.user.id
    });

    setIsAddingStudent(false);
    setNewStudent({
      id: `student${students.length + 2}`,
      name: "",
      email: "",
      phone: "",
      mentorId: selectedMentor.user.id,
      status: "active",
      totalSessions: 12,
      sessionsCompleted: 0,
      totalHours: 24,
      totalPayment: 12000,
      paidAmount: 0,
      batchId: "",
      sessionsRemaining: 12,
      progressPercentage: 0,
      startDate: "",
      endDate: "",
      sessionDuration: 1.33
    });
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditingStudent(true);
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    const updatedStudents = students.map(student =>
      student.id === editingStudent.id ? editingStudent : student
    );
    students.length = 0;
    students.push(...updatedStudents);
    setIsEditingStudent(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeletingStudent(true);
  };

  const confirmDeleteStudent = () => {
    if (!selectedStudent) return;

    const updatedStudents = students.filter(
      student => student.id !== selectedStudent.id
    );
    students.length = 0;
    students.push(...updatedStudents);
    setIsDeletingStudent(false);
    setSelectedStudent(null);
  };

  // Add new state variables for assigning students
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Add handler for assigning students
  const handleAssignStudents = () => {
    if (!selectedMentor) return;

    const updatedStudents = students.map(student => {
      if (selectedStudentsToAssign.includes(student.id)) {
        return {
          ...student,
          mentorId: selectedMentor.user.id
        };
      }
      return student;
    });

    students.length = 0;
    students.push(...updatedStudents);
    setIsAssigningStudents(false);
    setSelectedStudentsToAssign([]);
    setStudentSearchQuery("");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Mentors Management</h1>

          <Button
            className="w-full sm:w-auto text-sm"
            onClick={() => setIsAddingMentor(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add New Mentor
          </Button>
        </div>
        
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Mentors</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search by Name</Label>
                <div className="flex items-center gap-3">
                <Input
                  placeholder="Search mentors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm"
                />
                  <Button variant="outline" className="shrink-0 text-sm">
                    <UserSearch className="mr-1.5 h-3.5 w-3.5" />
                    Search
                  </Button>
              </div>
              </div>
              <div className="space-y-2">
                <Label>Filter by Coordinator</Label>
                <Select
                  value={coordinatorFilter}
                  onValueChange={setCoordinatorFilter}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coordinators</SelectItem>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredMentors.map((mentor) => {
            const stats = getMentorStats(mentor.id);
            return (
              <Card key={mentor.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">{mentor.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">{mentor.email}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm">ID: <span className="font-medium">{mentor.id}</span></p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {mentor.phone ? `Phone: ${mentor.phone}` : 'No phone number'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Students</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl sm:text-2xl font-bold">{stats.studentCount}</p>
                          <p className="text-sm text-muted-foreground">total</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coordinator</p>
                        <p className="text-base font-medium truncate">
                          {getCoordinatorName(mentor.supervisorId || "")}
                        </p>
                      </div>
                    </div>

                  <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sessions Progress</span>
                          <span className="font-medium">{stats.sessionProgress}%</span>
                    </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${stats.sessionProgress === 100
                                ? 'bg-progress-complete'
                                : stats.sessionProgress >= 75
                                  ? 'bg-progress-high'
                                  : stats.sessionProgress >= 40
                                    ? 'bg-progress-medium'
                                    : 'bg-progress-low'
                              }`}
                            style={{ width: `${stats.sessionProgress}%` }}
                          />
                    </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.completedSessions} completed</span>
                          <span>{stats.totalSessions} total</span>
                    </div>
                    </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Hours Progress</span>
                          <span className="font-medium">{stats.hoursProgress}%</span>
                    </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${stats.hoursProgress === 100
                                ? 'bg-progress-complete'
                                : stats.hoursProgress >= 75
                                  ? 'bg-progress-high'
                                  : stats.hoursProgress >= 40
                                    ? 'bg-progress-medium'
                                    : 'bg-progress-low'
                              }`}
                            style={{ width: `${stats.hoursProgress}%` }}
                          />
                    </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.completedHours} completed</span>
                          <span>{stats.totalHours} total</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Payment Progress</span>
                          <span className="font-medium">{stats.paymentsProgress}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${stats.paymentsProgress === 100
                                ? 'bg-progress-complete'
                                : stats.paymentsProgress >= 75
                                  ? 'bg-progress-high'
                                  : stats.paymentsProgress >= 40
                                    ? 'bg-progress-medium'
                                    : 'bg-progress-low'
                              }`}
                            style={{ width: `${stats.paymentsProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>₹{stats.completedPayments.toLocaleString()} completed</span>
                          <span>₹{stats.totalPayments.toLocaleString()} total</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Progress</span>
                          <span className="font-medium">{stats.overallProgress}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${stats.overallProgress === 100
                                ? 'bg-progress-complete'
                                : stats.overallProgress >= 75
                                  ? 'bg-progress-high'
                                  : stats.overallProgress >= 40
                                    ? 'bg-progress-medium'
                                    : 'bg-progress-low'
                              }`}
                            style={{ width: `${stats.overallProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Active Students</p>
                        <p className="text-lg font-medium mt-1">{stats.activeStudents}</p>
                      </div>
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pending Payments</p>
                        <p className="text-lg font-medium mt-1">₹{stats.pendingPayments.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 xs:grid-cols-5 gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewDetails(mentor)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewStudents(mentor)}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        Students
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleEditProfile(mentor)}
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleDeleteMentor(mentor)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredMentors.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No mentors found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog
        open={!!selectedMentor && !isViewingStudents && !isDeletingMentor}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMentor(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {selectedMentor?.user.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  {selectedMentor?.user.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedMentor && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold mt-1">{selectedMentor.stats.studentCount}</p>
                  <p className="text-sm text-muted-foreground">students</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold mt-1">{selectedMentor.stats.activeStudents}</p>
                  <p className="text-sm text-muted-foreground">active</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Coordinator</p>
                  <p className="text-2xl font-bold mt-1 truncate">{getCoordinatorName(selectedMentor.user.supervisorId || "")}</p>
                  <p className="text-sm text-muted-foreground">assigned to</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold mt-1">{selectedMentor.stats.overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">completed</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Sessions & Hours</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <span className="font-medium">{selectedMentor.stats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Sessions</span>
                      <span className="font-medium">{selectedMentor.stats.completedSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Hours</span>
                      <span className="font-medium">{selectedMentor.stats.totalHours}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Hours</span>
                      <span className="font-medium">{selectedMentor.stats.completedHours}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Payments</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Payments</span>
                      <span className="font-medium">₹{selectedMentor.stats.totalPayments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Payments</span>
                      <span className="font-medium">₹{selectedMentor.stats.completedPayments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Payments</span>
                      <span className="font-medium">₹{selectedMentor.stats.pendingPayments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Progress Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sessions Progress</span>
                        <span>{selectedMentor.stats.sessionProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${selectedMentor.stats.sessionProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.sessionProgress >= 75
                                ? 'bg-progress-high'
                                : selectedMentor.stats.sessionProgress >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
                            }`}
                          style={{ width: `${selectedMentor.stats.sessionProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Hours Progress</span>
                        <span>{selectedMentor.stats.hoursProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${selectedMentor.stats.hoursProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.hoursProgress >= 75
                                ? 'bg-progress-high'
                                : selectedMentor.stats.hoursProgress >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
                            }`}
                          style={{ width: `${selectedMentor.stats.hoursProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Payment Progress</span>
                        <span>{selectedMentor.stats.paymentsProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${selectedMentor.stats.paymentsProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.paymentsProgress >= 75
                                ? 'bg-progress-high'
                                : selectedMentor.stats.paymentsProgress >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
                            }`}
                          style={{ width: `${selectedMentor.stats.paymentsProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{selectedMentor.stats.overallProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${selectedMentor.stats.overallProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.overallProgress >= 75
                                ? 'bg-progress-high'
                                : selectedMentor.stats.overallProgress >= 40
                                  ? 'bg-progress-medium'
                                  : 'bg-progress-low'
                            }`}
                          style={{ width: `${selectedMentor.stats.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Mentor Dialog */}
      <Dialog open={isAddingMentor} onOpenChange={setIsAddingMentor}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Add New Mentor</DialogTitle>
            <DialogDescription>
              Fill in the mentor details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mentor-id">Mentor ID</Label>
                <Input
                  id="mentor-id"
                  value={newMentor.id}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newMentor.name}
                  onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                  placeholder="Enter mentor's full name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMentor.email}
                  onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                  placeholder="mentor@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newMentor.phone}
                  onChange={(e) => setNewMentor({ ...newMentor, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coordinator">Assigned Coordinator *</Label>
                <Select
                  value={newMentor.supervisorId}
                  onValueChange={(value) => setNewMentor({ ...newMentor, supervisorId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newMentor.password}
                  onChange={(e) => setNewMentor({ ...newMentor, password: e.target.value })}
                  placeholder="Enter secure password"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAddingMentor(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleAddMentor} className="w-full sm:w-auto">
              Create Mentor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mentor Dialog */}
      <Dialog open={isEditingMentor} onOpenChange={setIsEditingMentor}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Edit Mentor</DialogTitle>
            <DialogDescription>
              Update the mentor's information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          {editingMentor && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mentor-id">Mentor ID</Label>
                  <Input
                    id="edit-mentor-id"
                    value={editingMentor.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingMentor.name}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      name: e.target.value
                    })}
                    placeholder="Enter mentor's full name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingMentor.email}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      email: e.target.value
                    })}
                    placeholder="mentor@example.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingMentor.phone}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      phone: e.target.value
                    })}
                    placeholder="+91 98765 43210"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-coordinator">Assigned Coordinator *</Label>
                  <Select
                    value={editingMentor.supervisorId}
                    onValueChange={(value) => setEditingMentor({
                      ...editingMentor,
                      supervisorId: value
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a coordinator" />
                    </SelectTrigger>
                    <SelectContent>
                      {coordinators.map((coordinator) => (
                        <SelectItem key={coordinator.id} value={coordinator.id}>
                          {coordinator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">New Password (optional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingMentor.password}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      password: e.target.value
                    })}
                    placeholder="Leave blank to keep current password"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setIsEditingMentor(false);
              setEditingMentor(null);
            }} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateMentor} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeletingMentor} onOpenChange={setIsDeletingMentor}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMentor?.user.name}'s profile and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeletingMentor(false);
              setSelectedMentor(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMentor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Students Dialog */}
      <Dialog
        open={isViewingStudents}
        onOpenChange={(open) => {
          if (!open) {
            setIsViewingStudents(false);
            setSelectedMentor(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assigned Students - {selectedMentor?.user.name}</DialogTitle>
              <DialogDescription>
                Manage students assigned to this mentor.
              </DialogDescription>
            </DialogHeader>
            <DialogHeader>
              <div className="flex justify-end gap-4 mb-4">
                <Button variant="outline" onClick={() => setIsAssigningStudents(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Assign Students
                </Button>
                <Button onClick={() => setIsAddingStudent(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Student
                </Button>
              </div>
          </DialogHeader>

          <div className="relative overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="w-full overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px] font-medium">ID</TableHead>
                      <TableHead className="font-medium min-w-[200px]">Name</TableHead>
                      <TableHead className="font-medium w-[100px]">Status</TableHead>
                      <TableHead className="font-medium w-[140px]">Progress</TableHead>
                      <TableHead className="font-medium w-[100px]">Sessions</TableHead>
                      <TableHead className="font-medium min-w-[140px]">Payment</TableHead>
                      <TableHead className="font-medium w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMentor &&
                      students
                        ?.filter(student => student.mentorId === selectedMentor.user.id)
                        .map((student) => {
                          const progress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
                          const paymentProgress = Math.round((student.paidAmount / student.totalPayment) * 100);
                          return (
                            <TableRow key={student.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{student.id}</TableCell>
                              <TableCell>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium truncate">{student.name}</span>
                                  <span className="text-xs sm:text-sm text-muted-foreground truncate">{student.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {student.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="w-full">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <Progress
                                    value={progress}
                                    className="h-2"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm whitespace-nowrap">
                                  <span className="font-medium">{student.sessionsCompleted}</span>
                                  <span className="text-muted-foreground">/{student.totalSessions}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm whitespace-nowrap">
                                  <span className="font-medium">₹{student.paidAmount.toLocaleString()}</span>
                                  <span className="text-muted-foreground">/₹{student.totalPayment.toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditStudent(student)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteStudent(student)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    {(!selectedMentor?.user.id || students?.filter(student => student.mentorId === selectedMentor.user.id).length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl font-bold">Add New Student</DialogTitle>
            <DialogDescription className="text-sm">
              Fill in the student details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:gap-6 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="student-id" className="text-sm">Student ID</Label>
                <Input
                  id="student-id"
                  value={newStudent.id}
                  disabled
                  className="bg-muted h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name *</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student's full name"
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@example.com"
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="mentor" className="text-sm">Assigned Mentor</Label>
                <Input
                  id="mentor"
                  value={selectedMentor?.user.name || ""}
                  disabled
                  className="bg-muted h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="status" className="text-sm">Status *</Label>
                <Select
                  value={newStudent.status}
                  onValueChange={(value) => setNewStudent({ ...newStudent, status: value as "active" | "inactive" })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="total-sessions" className="text-sm">Total Sessions *</Label>
                <Input
                  id="total-sessions"
                  type="number"
                  min="0"
                  value={newStudent.totalSessions}
                  onChange={(e) => setNewStudent({ ...newStudent, totalSessions: parseInt(e.target.value) })}
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="total-hours" className="text-sm">Total Hours *</Label>
                <Input
                  id="total-hours"
                  type="number"
                  min="0"
                  value={newStudent.totalHours}
                  onChange={(e) => setNewStudent({ ...newStudent, totalHours: parseInt(e.target.value) })}
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1.5 sm:space-y-2">
                <Label htmlFor="total-payment" className="text-sm">Total Payment (₹) *</Label>
                <Input
                  id="total-payment"
                  type="number"
                  min="0"
                  value={newStudent.totalPayment}
                  onChange={(e) => setNewStudent({ ...newStudent, totalPayment: parseInt(e.target.value) })}
                  className="h-8 sm:h-9 text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-2 sm:mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddingStudent(false)}
              className="w-full sm:w-auto text-sm h-8 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              className="w-full sm:w-auto text-sm h-8 sm:h-9"
            >
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditingStudent} onOpenChange={setIsEditingStudent}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-student-id">Student ID</Label>
                  <Input
                    id="edit-student-id"
                    value={editingStudent.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      name: e.target.value
                    })}
                    placeholder="Enter student's full name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      email: e.target.value
                    })}
                    placeholder="student@example.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      phone: e.target.value
                    })}
                    placeholder="+91 98765 43210"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select
                    value={editingStudent.status}
                    onValueChange={(value) => setEditingStudent({
                      ...editingStudent,
                      status: value as "active" | "inactive"
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sessions-completed">Completed Sessions *</Label>
                  <Input
                    id="edit-sessions-completed"
                    type="number"
                    min="0"
                    value={editingStudent.sessionsCompleted}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      sessionsCompleted: parseInt(e.target.value),
                      sessionsRemaining: editingStudent.totalSessions - parseInt(e.target.value),
                      progressPercentage: Math.round((parseInt(e.target.value) / editingStudent.totalSessions) * 100)
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-sessions">Total Sessions *</Label>
                  <Input
                    id="edit-total-sessions"
                    type="number"
                    min="0"
                    value={editingStudent.totalSessions}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      totalSessions: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-hours">Total Hours *</Label>
                  <Input
                    id="edit-total-hours"
                    type="number"
                    min="0"
                    value={editingStudent.totalHours}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      totalHours: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-paid-amount">Paid Amount (₹) *</Label>
                  <Input
                    id="edit-paid-amount"
                    type="number"
                    min="0"
                    value={editingStudent.paidAmount}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      paidAmount: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-total-payment">Total Payment (₹) *</Label>
                  <Input
                    id="edit-total-payment"
                    type="number"
                    min="0"
                    value={editingStudent.totalPayment}
                    onChange={(e) => setEditingStudent({
                      ...editingStudent,
                      totalPayment: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setIsEditingStudent(false);
              setEditingStudent(null);
            }} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <AlertDialog open={isDeletingStudent} onOpenChange={setIsDeletingStudent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedStudent?.name}'s profile and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeletingStudent(false);
              setSelectedStudent(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Students Dialog */}
      <Dialog open={isAssigningStudents} onOpenChange={setIsAssigningStudents}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Existing Students</DialogTitle>
            <DialogDescription>
              Select students to assign to {selectedMentor?.user.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student-select">Select Students</Label>
              <Select
                value={selectedStudentsToAssign[0] || ""}
                onValueChange={(value) => {
                  setSelectedStudentsToAssign([value]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students
                    ?.filter(s => !s.mentorId || s.mentorId === selectedMentor?.user.id)
                    ?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAssigningStudents(false);
              setSelectedStudentsToAssign([]);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignStudents}
              disabled={selectedStudentsToAssign.length === 0}
            >
              Assign Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminMentors;
