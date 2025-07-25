import DashboardLayout from "@/components/DashboardLayout";
import { CoordinatorDialog } from "@/components/dialog/CoordinatorDialog";
import { MentorDialog } from "@/components/dialog/MentorDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  students as allStudents,
  generateDashboardStats,
  users,
} from "@/lib/mock-data";
import { crudToasts } from "@/lib/toast";
import type { Coordinator, Student } from "@/lib/types";
import { User } from "@/lib/types";
import {
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { Lightbulb, TrendingUp, Users, Mail, Phone, MessageCircle, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import coordinator-related types
interface NewCoordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  password: string;
  useDefaultPassword: boolean;
}

interface EditingCoordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  password: string;
}

// Extend User type locally to include createdAt for filtering
interface UserWithCreatedAt extends User {
  createdAt?: string;
}

const AdminCoordinators = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });

  // Helper function to format currency
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const [selectedCoordinator, setSelectedCoordinator] = useState<{
    user: User;
    stats: ReturnType<typeof getCoordinatorStats>;
  } | null>(null);

  // Single dialog state to manage all dialogs
  const [activeDialog, setActiveDialog] = useState<
    "details" | "add" | "edit" | "delete" | "mentors" | "students" | null
  >(null);

  const [editingCoordinator, setEditingCoordinator] =
    useState<EditingCoordinator | null>(null);
  const [newCoordinator, setNewCoordinator] = useState<NewCoordinator>({
    id: `coord${users.filter((u) => u.role === "coordinator").length + 1}`,
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
    useDefaultPassword: true,
  });
  const [coordinators, setCoordinators] = useState<UserWithCreatedAt[]>(
    users.filter((user) => user.role === "coordinator") as UserWithCreatedAt[]
  );
  const [isViewingMentors, setIsViewingMentors] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);
  const [isEditingMentor, setIsEditingMentor] = useState(false);
  const [isDeletingCoordinator, setIsDeletingCoordinator] = useState(false);
  const [newMentor, setNewMentor] = useState({
    id: `mentor${users.filter((u) => u.role === "mentor").length + 1}`,
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });
  const [isDeletingMentor, setIsDeletingMentor] = useState(false);
  const [editingMentor, setEditingMentor] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  } | null>(null);
  const [isAssigningMentor, setIsAssigningMentor] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [isViewingStudents, setIsViewingStudents] = useState(false);
  const [isAssigningStudents, setIsAssigningStudents] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<
    string[]
  >([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState(allStudents);
  const [newStudent, setNewStudent] = useState<Student>({
    id: `student${allStudents.length + 1}`,
    name: "",
    email: "",
    phone: "",
    mentorId: selectedMentor?.id || "",
    status: "active",
    totalSessions: 12,
    sessionsCompleted: 0,
    totalHours: 24,
    totalPayment: 12000,
    paidAmount: 0,
    sessionsRemaining: 12,
    progressPercentage: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    sessionDuration: 60,
    teachersPayment: 0,
    hourlyPayment: 0,
    sessionAddedOn: new Date().toISOString(),
    expenseRatio: 0,
    classTakeAmount: 0,
    teacherSalary: 0,
  });

  const filteredCoordinators = coordinators.filter((coordinator) => {
    const matchesSearch = coordinator.name
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!matchesSearch) return false;
    const c = coordinator as UserWithCreatedAt;
    if (!c.createdAt) return true;
    const createdAt = parseISO(c.createdAt);
    switch (timeFilter) {
      case "today":
        return isToday(createdAt);
      case "this_week":
        return isThisWeek(createdAt, { weekStartsOn: 1 });
      case "this_month":
        return isThisMonth(createdAt);
      case "this_year":
        return isThisYear(createdAt);
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return isWithinInterval(createdAt, {
            start: parseISO(customDateRange.from),
            end: parseISO(customDateRange.to),
          });
        }
        return true;
      default:
        return true;
    }
  });

  // Get coordinator performance data
  const getCoordinatorStats = (coordinatorId: string) => {
    const mentors = users.filter(
      (user) => user.role === "mentor" && user.supervisorId === coordinatorId
    );

    const mentorIds = mentors.map((mentor) => mentor.id);
    const coordinatorStudents = allStudents.filter((student) =>
      mentorIds.includes(student.mentorId)
    );

    const classTakeAmount = coordinatorStudents.reduce(
      (sum, student) => sum + (student.sessionsCompleted || 0),
      0
    );
    const teacherSalary = coordinatorStudents.reduce(
      (sum, student) => sum + (student.teachersPayment || 0),
      0
    );
    const expenseRatio =
      classTakeAmount > 0
        ? Math.round((teacherSalary / classTakeAmount) * 100)
        : 0;

    const totalSessions = coordinatorStudents.reduce(
      (sum, student) => sum + student.totalSessions,
      0
    );
    const completedSessions = coordinatorStudents.reduce(
      (sum, student) => sum + student.sessionsCompleted,
      0
    );
    const totalHours = coordinatorStudents.reduce(
      (sum, student) => sum + student.totalHours,
      0
    );
    const completedHours = coordinatorStudents.reduce(
      (sum, student) =>
        sum +
        student.totalHours *
          (student.sessionsCompleted / student.totalSessions),
      0
    );

    const stats = generateDashboardStats(coordinatorStudents);

    // Calculate coordinator-level expense data
    const coordinatorStats = {
      ...stats,
      mentorCount: mentors.length,
      studentCount: coordinatorStudents.length,
      teacherCount: 1000,
      totalSessions,
      completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      sessionProgress:
        totalSessions > 0
          ? Math.floor((completedSessions / totalSessions) * 100)
          : 0,
      hoursProgress:
        totalHours > 0 ? Math.floor((completedHours / totalHours) * 100) : 0,
      activeStudents: coordinatorStudents.filter((s) => s.status === "active")
        .length,
      completedPayments: stats.completedPayments,
      pendingPayments: stats.pendingPayments,
      totalPayments: stats.totalPayments,
      paymentsProgress:
        stats.totalPayments > 0
          ? Math.floor((stats.completedPayments / stats.totalPayments) * 100)
          : 0,
      classTakeAmount,
      teacherSalary,
      expenseRatio,
      refundSpot: 0,
      refundPackage: 0,
    };
    return coordinatorStats;
  };

  // Helper function to close all dialogs
  const closeAllDialogs = () => {
    setActiveDialog(null);
    setSelectedCoordinator(null);
    setEditingCoordinator(null);
  };

  const handleViewDetails = (coordinator: User) => {
    const stats = getCoordinatorStats(coordinator.id);
    setSelectedCoordinator({ user: coordinator, stats });
    setActiveDialog("details");
  };

  const handleEditProfile = (coordinator: User) => {
    setEditingCoordinator({
      id: coordinator.id,
      name: coordinator.name,
      email: coordinator.email,
      phone: coordinator.phone || "",
      password: "",
      status: coordinator.status || "active",
    });
    setActiveDialog("edit");
  };

  const handleAddCoordinator = () => {
    try {
      // Validate required fields
      if (
        !newCoordinator.name ||
        !newCoordinator.email ||
        !newCoordinator.phone ||
        !newCoordinator.password
      ) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      const newUser: User = {
        id: newCoordinator.id,
        name: newCoordinator.name,
        email: newCoordinator.email,
        role: "coordinator",
        phone: newCoordinator.phone,
        status: newCoordinator.status,
      };

      setCoordinators([...coordinators, newUser]);
      setActiveDialog(null);
      setNewCoordinator({
        id: `coord${coordinators.length + 2}`,
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "active",
        useDefaultPassword: true,
      });
      crudToasts.create.success("Coordinator");
    } catch (error) {
      crudToasts.create.error("Coordinator");
    }
  };

  const handleUpdateCoordinator = () => {
    if (!editingCoordinator) return;

    try {
      const updatedCoordinators = coordinators.map((coord) =>
        coord.id === editingCoordinator.id
          ? {
              ...coord,
              name: editingCoordinator.name,
              email: editingCoordinator.email,
              phone: editingCoordinator.phone,
              status: editingCoordinator.status,
            }
          : coord
      );

      setCoordinators(updatedCoordinators);
      setActiveDialog(null);
      crudToasts.update.success("Coordinator");
    } catch (error) {
      crudToasts.update.error("Coordinator");
    }
  };

  const handleViewMentors = (coordinator: User) => {
    const stats = getCoordinatorStats(coordinator.id);
    setSelectedCoordinator({ user: coordinator, stats });
    setActiveDialog("mentors");
  };

  const handleViewStudents = (coordinator: Coordinator) => {
    // Close all other dialogs first
    closeAllDialogs();
    // Set the selected coordinator and open students dialog
    setSelectedCoordinator({
      user: coordinator,
      stats: getCoordinatorStats(coordinator.id),
    });
    setActiveDialog("students");
  };

  const handleDeleteCoordinator = (coordinator: User) => {
    const stats = getCoordinatorStats(coordinator.id);
    setSelectedCoordinator({ user: coordinator, stats });
    setActiveDialog("delete");
  };

  const confirmDeleteCoordinator = () => {
    if (!selectedCoordinator) return;

    try {
      // Remove from users array first
      const userIndex = users.findIndex(
        (u) => u.id === selectedCoordinator.user.id
      );
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }

      // Update local coordinators state
      setCoordinators((prev) =>
        prev.filter((c) => c.id !== selectedCoordinator.user.id)
      );

      // Close dialog and reset selected coordinator
      setActiveDialog(null);
      setSelectedCoordinator(null);

      crudToasts.delete.success("Coordinator");
    } catch (error) {
      crudToasts.delete.error("Coordinator");
    }
  };

  const getAssignedMentors = (coordinatorId: string) => {
    // Filter users to get only mentors with matching supervisorId
    const mentors = users.filter(
      (user) => user.role === "mentor" && user.supervisorId === coordinatorId
    );

    console.log("Getting mentors for coordinator:", coordinatorId);
    console.log("Found mentors:", mentors);

    return mentors;
  };

  const handleAddMentor = () => {
    if (!selectedCoordinator) {
      console.log("No coordinator selected");
      return;
    }

    try {
      console.log("Attempting to create mentor:", newMentor);

      // Validate required fields
      if (!newMentor.name || !newMentor.email || !newMentor.phone) {
        console.log("Validation failed:", newMentor);
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      const mentorId = `mentor${
        users.filter((u) => u.role === "mentor").length + 1
      }`;
      const newUser: User = {
        id: mentorId,
        name: newMentor.name,
        email: newMentor.email,
        role: "mentor",
        supervisorId: selectedCoordinator.user.id,
        phone: newMentor.phone,
        status: newMentor.status as "active" | "inactive",
      };

      console.log("Creating new mentor:", newUser);

      // Add the new mentor to the users array
      users.push(newUser);
      console.log("Updated users array:", users);

      // Close the dialog and reset form
      setIsAddingMentor(false);
      setNewMentor({
        id: `mentor${users.filter((u) => u.role === "mentor").length + 1}`,
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "active",
      });

      // Force a re-render of the mentors list
      setSelectedCoordinator((prev) => (prev ? { ...prev } : null));

      crudToasts.create.success("Mentor");
    } catch (error) {
      console.error("Error creating mentor:", error);
      crudToasts.create.error("Mentor");
    }
  };

  const handleDeleteMentor = (mentor: User) => {
    setSelectedMentor(mentor);
    setIsDeletingMentor(true);
  };

  const confirmDeleteMentor = () => {
    if (!selectedMentor) return;

    // Here you would typically make an API call to delete the mentor
    const updatedUsers = users.filter((u) => u.id !== selectedMentor.id);
    users.length = 0;
    users.push(...updatedUsers);
    setIsDeletingMentor(false);
    setSelectedMentor(null);
  };

  const handleEditMentor = (mentor: User) => {
    setEditingMentor({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone || "",
      password: "",
    });
    setIsEditingMentor(true);
  };

  const handleUpdateMentor = () => {
    if (!editingMentor) return;

    // Here you would typically make an API call to update the mentor
    const updatedUsers = users.map((user) =>
      user.id === editingMentor.id
        ? {
            ...user,
            name: editingMentor.name,
            email: editingMentor.email,
            phone: editingMentor.phone,
          }
        : user
    );
    users.length = 0;
    users.push(...updatedUsers);
    setIsEditingMentor(false);
    setEditingMentor(null);
  };

  const getUnassignedMentors = () => {
    return users
      .filter((user) => user.role === "mentor")
      .map((mentor) => ({
        ...mentor,
        isAssigned: !!mentor.supervisorId,
        currentCoordinator: mentor.supervisorId
          ? users.find((u) => u.id === mentor.supervisorId)?.name
          : null,
      }));
  };

  const handleAssignMentor = () => {
    if (!selectedCoordinator || !selectedMentorId) return;

    try {
      // Find the mentor to be assigned
      const mentorToAssign = users.find((user) => user.id === selectedMentorId);
      if (!mentorToAssign) {
        crudToasts.assign.error("Mentor", "coordinator");
        return;
      }

      // Update the mentor's supervisorId
      const updatedUsers = users.map((user) => {
        if (user.id === selectedMentorId) {
          return { ...user, supervisorId: selectedCoordinator.user.id };
        }
        return user;
      });

      // Update the users array
      users.length = 0;
      users.push(...updatedUsers);

      // Close dialog and reset state
      setIsAssigningMentor(false);
      setSelectedMentorId("");

      // Show success message
      crudToasts.assign.success("Mentor", "coordinator");
    } catch (error) {
      crudToasts.assign.error("Mentor", "coordinator");
    }
  };

  const getCoordinatorStudents = (coordinatorId: string) => {
    // Get all mentors under this coordinator
    const mentors = users.filter(
      (user) => user.role === "mentor" && user.supervisorId === coordinatorId
    );

    // Get IDs of all mentors under this coordinator
    const mentorIds = mentors.map((mentor) => mentor.id);

    // Get all students assigned to these mentors
    return allStudents.filter((student) =>
      mentorIds.includes(student.mentorId)
    );
  };

  // Add type guard function
  const asCoordinator = (user: User | null): Coordinator | null => {
    if (user?.role === "coordinator") {
      return user as Coordinator;
    }
    return null;
  };

  // Update the mock data initialization if needed
  useEffect(() => {
    // Initialize coordinators if not already present
    const initialCoordinators = [
      {
        id: "coord1",
        name: "John Coordinator",
        email: "john@example.com",
        role: "coordinator",
        phone: "+91 98765 43211",
        status: "active",
      },
      {
        id: "coord2",
        name: "Jane Coordinator",
        email: "jane@example.com",
        role: "coordinator",
        phone: "+91 98765 43212",
        status: "active",
      },
    ];

    // Initialize mentors with correct supervisor IDs
    const initialMentors = [
      {
        id: "mentor1",
        name: "Mike Mentor",
        email: "mike@example.com",
        role: "mentor",
        supervisorId: "coord1",
        phone: "+91 98765 43213",
        status: "active",
      },
      {
        id: "mentor2",
        name: "Mary Mentor",
        email: "mary@example.com",
        role: "mentor",
        supervisorId: "coord1",
        phone: "+91 98765 43214",
        status: "active",
      },
      {
        id: "mentor3",
        name: "Sam Mentor",
        email: "sam@example.com",
        role: "mentor",
        supervisorId: "coord2",
        phone: "+91 98765 43215",
        status: "active",
      },
      {
        id: "mentor4",
        name: "Sarah Mentor",
        email: "sarah@example.com",
        role: "mentor",
        supervisorId: "coord2",
        phone: "+91 98765 43216",
        status: "active",
      },
    ];

    // Add coordinators to users array if not present
    initialCoordinators.forEach((coordinator) => {
      if (!users.some((user) => user.id === coordinator.id)) {
        users.push(coordinator as User);
      }
    });

    // Add mentors to users array if not present
    initialMentors.forEach((mentor) => {
      if (!users.some((user) => user.id === mentor.id)) {
        users.push(mentor as User);
      }
    });

    // Add mock createdAt to coordinators
    users.forEach((user) => {
      if (
        user.role === "coordinator" &&
        !(user as UserWithCreatedAt).createdAt
      ) {
        // Random date in the last year
        const randomDate = new Date(
          Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
        );
        (user as UserWithCreatedAt).createdAt = randomDate.toISOString();
      }
    });

    // Update coordinators state
    setCoordinators(
      users.filter((user) => user.role === "coordinator") as UserWithCreatedAt[]
    );
  }, []);

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsEditingMentor(true);
  };

  const handleDeleteStudent = (student: Student) => {
    try {
      const updatedStudents = students.filter((s) => s.id !== student.id);
      setStudents(updatedStudents);
      allStudents.splice(
        allStudents.findIndex((s) => s.id === student.id),
        1
      );
      crudToasts.delete.success("Student");
    } catch (error) {
      crudToasts.delete.error("Student");
    }
  };

  const handleAddStudent = () => {
    try {
      if (!newStudent.name || !newStudent.email || !newStudent.phone) {
        crudToasts.validation.error("Please fill in all required fields.");
        return;
      }

      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      allStudents.push(newStudent);
      setIsAddingStudent(false);
      setNewStudent({
        id: `student${allStudents.length + 1}`,
        name: "",
        email: "",
        phone: "",
        mentorId: selectedMentor?.id || "",
        status: "active",
        totalSessions: 12,
        sessionsCompleted: 0,
        totalHours: 24,
        totalPayment: 12000,
        paidAmount: 0,
        sessionsRemaining: 12,
        progressPercentage: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        sessionDuration: 60,
        teachersPayment: 0,
        hourlyPayment: 0,
        sessionAddedOn: new Date().toISOString(),
        expenseRatio: 0,
        classTakeAmount: 0,
        teacherSalary: 0,
      });
      crudToasts.create.success("Student");
    } catch (error) {
      crudToasts.create.error("Student");
    }
  };

  const handleAssignStudents = () => {
    try {
      if (selectedStudentsToAssign.length === 0) {
        crudToasts.validation.error(
          "Please select at least one student to assign."
        );
        return;
      }

      const updatedStudents = students.map((student) => {
        if (selectedStudentsToAssign.includes(student.id)) {
          return { ...student, mentorId: selectedMentor?.id };
        }
        return student;
      });

      setStudents(updatedStudents);
      selectedStudentsToAssign.forEach((studentId) => {
        const student = allStudents.find((s) => s.id === studentId);
        if (student) {
          student.mentorId = selectedMentor?.id;
        }
      });

      setIsAssigningStudents(false);
      setSelectedStudentsToAssign([]);
      crudToasts.assign.success("Students", "mentor");
    } catch (error) {
      crudToasts.assign.error("Students", "mentor");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            Coordinators Management
          </h1>
        </div>

        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Coordinators</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-end">
              {/* Search by Name */}
              <div className="w-full md:flex-1 min-w-[180px]">
                <Label className="mb-1 block">Search by Name</Label>
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              {/* Filter by Date */}
              <div className="w-full md:w-auto">
                <Label className="mb-1 block">Filter by Date</Label>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {timeFilter === "custom" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 w-full sm:w-[120px]"
                        >
                          {customDateRange.from
                            ? new Date(
                                customDateRange.from
                              ).toLocaleDateString()
                            : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="p-0 w-auto max-w-xs sm:max-w-sm"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            customDateRange.from
                              ? new Date(customDateRange.from)
                              : undefined
                          }
                          onSelect={(date) =>
                            setCustomDateRange((r) => ({
                              ...r,
                              from: date
                                ? date.toLocaleDateString("en-CA")
                                : "",
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                  {timeFilter === "custom" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 w-full sm:w-[120px]"
                        >
                          {customDateRange.to
                            ? new Date(customDateRange.to).toLocaleDateString()
                            : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="p-0 w-auto max-w-xs sm:max-w-sm"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            customDateRange.to
                              ? new Date(customDateRange.to)
                              : undefined
                          }
                          onSelect={(date) => {
                            setCustomDateRange((r) => ({
                              ...r,
                              to: date ? date.toLocaleDateString("en-CA") : "",
                            }));
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredCoordinators.map((coordinator) => {
            const stats = getCoordinatorStats(coordinator.id);
            const coordinatorMentors = users.filter(
              (user) =>
                user.role === "mentor" && user.supervisorId === coordinator.id
            );

            return (
              <Card key={coordinator.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base sm:text-lg">
                          {coordinator.name} ({coordinator.id})
                        </CardTitle>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            coordinator.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {coordinator.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex flex-wrap gap-2 mt-1 justify-start sm:justify-end">
                        <a
                          href={`mailto:${coordinator.email}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="hidden xs:inline">Mail</span>
                        </a>
                        <a
                          href={`tel:${coordinator.phone || ""}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="hidden xs:inline">Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${(coordinator.phone || "").replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                            `Hello ${coordinator.name} (ID: ${coordinator.id}),\n\nThis is a message from Albedo Educator.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-100 text-green-900 hover:bg-green-200 text-xs font-medium transition"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden xs:inline">WhatsApp</span>
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
                          onClick={() => window.print()}
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden xs:inline">Print</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">Mentors</p>
                        <p className="text-2xl font-bold break-words text-center">
                          {stats.mentorCount}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">
                          Students
                        </p>
                        <p className="text-2xl font-bold break-words text-center">
                          {stats.studentCount}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">
                          Teachers
                        </p>
                        <p className="text-2xl font-bold break-words text-center">
                          {stats.teacherCount}
                        </p>
                      </div>
                    </div>
                    {/* Progress Bars - Each in its own row with motivational icon */}
                    <div className="flex flex-col gap-4 w-full pt-4">
                      {/* Sessions Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your sessions!"
                        >
                          <TrendingUp className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Sessions
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.sessionProgress === 100
                                ? "bg-palette-info"
                                : stats.sessionProgress >= 75
                                ? "bg-palette-accent"
                                : stats.sessionProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{
                              width: `${stats.sessionProgress}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {stats.completedSessions}/{stats.totalSessions} (
                              {stats.sessionProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {stats.totalSessions - stats.completedSessions} (
                              {100 - stats.sessionProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Hours Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your hours!"
                        >
                          <Lightbulb className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Hours
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.hoursProgress === 100
                                ? "bg-palette-info"
                                : stats.hoursProgress >= 75
                                ? "bg-palette-accent"
                                : stats.hoursProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${stats.hoursProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {stats.completedHours}/{stats.totalHours} (
                              {stats.hoursProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {stats.totalHours - stats.completedHours} (
                              {100 - stats.hoursProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Payments Progress */}
                      <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col min-w-0 w-full relative">
                        <div
                          className="absolute top-3 right-4"
                          title="Keep going! Complete your payments!"
                        >
                          <TrendingUp className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Payments
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.paymentsProgress === 100
                                ? "bg-palette-info"
                                : stats.paymentsProgress >= 75
                                ? "bg-palette-accent"
                                : stats.paymentsProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${stats.paymentsProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              ₹{stats.completedPayments.toLocaleString()}/₹
                              {stats.totalPayments.toLocaleString()} (
                              {stats.paymentsProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              ₹
                              {(
                                stats.totalPayments - stats.completedPayments
                              ).toLocaleString()}{" "}
                              ({100 - stats.paymentsProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Financial Stats - First Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      {/* Refund Spot */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Refund Spot</p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{stats.refundSpot}</p>
                        </div>
                      </div>
                      {/* Refund Package */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Refund Package
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{stats.refundPackage}</p>
                        </div>
                      </div>
                    </div>
                    {/* Financial Stats - Second Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      {/* Class Take Amount */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Class Take Amount
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{stats.classTakeAmount}</p>
                        </div>
                      </div>
                      {/* Teacher Salary */}
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Teacher Salary
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{stats.teacherSalary}</p>
                        </div>
                      </div>
                      {/* Expense Ratio */}
                      <div
                        className={`p-3 sm:p-4 rounded-lg border border-indigo-100/50 dark:bg-gray-900/100 bg-white shadow-sm ${
                          stats.expenseRatio > 100
                            ? "bg-red-100/60 text-red-700 border-red-200"
                            : stats.expenseRatio > 75
                            ? "bg-yellow-100/60 text-yellow-800 border-yellow-200"
                            : stats.expenseRatio > 50
                            ? "bg-blue-100/60 text-blue-800 border-blue-200"
                            : "bg-green-100/60 text-green-800 border-green-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Expense Ratio</p>
                        </div>
                        <div className="space-y-1">
                          <p className="">{stats.expenseRatio}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewMentors(coordinator)}
                      >
                        Mentors
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => {
                          const coordUser = asCoordinator(coordinator);
                          if (coordUser) {
                            handleViewStudents(coordUser);
                            setActiveDialog("students");
                          }
                        }}
                      >
                        Students
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredCoordinators.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No coordinators found matching your search.
              </p>
            </div>
          )}
        </div>

        <CoordinatorDialog
          isViewDetailsOpen={activeDialog === "details"}
          isAddOpen={activeDialog === "add"}
          isEditOpen={activeDialog === "edit"}
          isDeleteOpen={activeDialog === "delete"}
          selectedCoordinator={asCoordinator(selectedCoordinator?.user)}
          newCoordinator={newCoordinator}
          editingCoordinator={editingCoordinator}
          stats={selectedCoordinator?.stats}
          allStudents={allStudents}
          onViewDetailsClose={closeAllDialogs}
          onAddClose={closeAllDialogs}
          onEditClose={closeAllDialogs}
          onDeleteClose={closeAllDialogs}
          onAddCoordinator={handleAddCoordinator}
          onUpdateCoordinator={handleUpdateCoordinator}
          onDeleteCoordinator={confirmDeleteCoordinator}
          setNewCoordinator={setNewCoordinator}
          setEditingCoordinator={setEditingCoordinator}
        />

        <Dialog
          open={activeDialog === "mentors"}
          onOpenChange={(open) => {
            if (!open) {
              closeAllDialogs();
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Assigned Mentors - {selectedCoordinator?.user.name}
              </DialogTitle>
              <DialogDescription>
                Manage mentors assigned to this coordinator.
              </DialogDescription>
            </DialogHeader>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Students Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCoordinator?.user.id &&
                    getAssignedMentors(selectedCoordinator.user.id).map(
                      (mentor) => (
                        <TableRow key={mentor.id}>
                          <TableCell className="font-medium">
                            {mentor.id}
                          </TableCell>
                          <TableCell>{mentor.name}</TableCell>
                          <TableCell>{mentor.email}</TableCell>
                          <TableCell>
                            {mentor.phone || "No phone number"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                mentor.status === "active"
                                  ? "bg-green-100 text-palette-accent"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {mentor.status || "active"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {
                              allStudents.filter(
                                (student) => student.mentorId === mentor.id
                              ).length
                            }
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  {(!selectedCoordinator?.user.id ||
                    getAssignedMentors(selectedCoordinator.user.id).length ===
                      0) && (
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

        <MentorDialog
          isViewDetailsOpen={false}
          isAddOpen={isAddingMentor}
          isEditOpen={isEditingMentor}
          isDeleteOpen={isDeletingMentor}
          isViewStudentsOpen={false}
          selectedMentor={selectedMentor}
          selectedCoordinator={selectedCoordinator}
          newMentor={newMentor}
          editingMentor={editingMentor}
          students={students}
          onViewDetailsClose={() => {}}
          onAddClose={() => setIsAddingMentor(false)}
          onEditClose={() => setIsEditingMentor(false)}
          onDeleteClose={() => setIsDeletingMentor(false)}
          onViewStudentsClose={() => {}}
          onAddMentor={handleAddMentor}
          onUpdateMentor={handleUpdateMentor}
          onDeleteMentor={confirmDeleteMentor}
          setNewMentor={setNewMentor}
          setEditingMentor={setEditingMentor}
          isAssigningStudents={isAssigningStudents}
          isAddingStudent={isAddingStudent}
          setIsAssigningStudents={setIsAssigningStudents}
          setIsAddingStudent={setIsAddingStudent}
          handleEditStudent={handleEditStudent}
          handleDeleteStudent={handleDeleteStudent}
          handleAddStudent={handleAddStudent}
          handleAssignStudents={handleAssignStudents}
          selectedStudentsToAssign={selectedStudentsToAssign}
          setSelectedStudentsToAssign={setSelectedStudentsToAssign}
          newStudent={newStudent}
          setNewStudent={setNewStudent}
        />

        <Dialog open={isAssigningMentor} onOpenChange={setIsAssigningMentor}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Mentor</DialogTitle>
              <DialogDescription>
                Select a mentor to assign to {selectedCoordinator?.user.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="mentor-select">Select Mentor</Label>
                <Select
                  value={selectedMentorId}
                  onValueChange={setSelectedMentorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnassignedMentors().map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{mentor.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {mentor.isAssigned
                              ? `Currently assigned to: ${mentor.currentCoordinator}`
                              : "Not assigned to any coordinator"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssigningMentor(false);
                  setSelectedMentorId("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignMentor} disabled={!selectedMentorId}>
                {selectedMentorId &&
                getUnassignedMentors().find((m) => m.id === selectedMentorId)
                  ?.isAssigned
                  ? "Reassign Mentor"
                  : "Assign Mentor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={activeDialog === "students"}
          onOpenChange={(open) => {
            if (!open) {
              closeAllDialogs();
            }
          }}
        >
          <DialogContent className="max-w-[95vw] w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 md:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-base sm:text-lg font-semibold">
                Students Under {selectedCoordinator?.user.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                View all students managed by this coordinator's mentors.
              </DialogDescription>
            </DialogHeader>

            <div className="relative overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px] font-medium hidden md:table-cell">
                      ID
                    </TableHead>
                    <TableHead className="font-medium min-w-[120px]">
                      Name
                    </TableHead>
                    <TableHead className="font-medium min-w-[120px] hidden sm:table-cell">
                      Mentor
                    </TableHead>
                    <TableHead className="font-medium w-[100px]">
                      Status
                    </TableHead>
                    <TableHead className="font-medium min-w-[100px]">
                      Sessions
                    </TableHead>
                    <TableHead className="font-medium min-w-[100px] hidden sm:table-cell">
                      Hours
                    </TableHead>
                    <TableHead className="font-medium min-w-[120px] hidden md:table-cell">
                      Payments
                    </TableHead>
                    <TableHead className="font-medium w-[120px]">
                      Progress
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCoordinator &&
                    getCoordinatorStudents(selectedCoordinator.user.id).map(
                      (student) => {
                        const mentor = users.find(
                          (u) => u.id === student.mentorId
                        );
                        const progress = Math.round(
                          (student.sessionsCompleted / student.totalSessions) *
                            100
                        );
                        const paymentProgress = Math.round(
                          (student.paidAmount / student.totalPayment) * 100
                        );

                        return (
                          <TableRow
                            key={student.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium hidden md:table-cell">
                              {student.id}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {student.name}
                                </div>
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  Mentor: {mentor?.name || "Not Assigned"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {mentor?.name || "Not Assigned"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  student.status === "active"
                                    ? "bg-green-100 text-palette-accent"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {student.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="text-sm whitespace-nowrap">
                                  {student.sessionsCompleted}/
                                  {student.totalSessions}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {student.sessionsRemaining} left
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm whitespace-nowrap">
                                  {Math.round(
                                    student.sessionsCompleted *
                                      student.sessionDuration
                                  )}
                                  /{student.totalHours}
                                </span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {Math.round(
                                    student.sessionsRemaining *
                                      student.sessionDuration
                                  )}{" "}
                                  left
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm whitespace-nowrap">
                                  ₹{student.paidAmount.toLocaleString()}/₹
                                  {student.totalPayment.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {paymentProgress}% paid
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      progress === 100
                                        ? "bg-progress-complete"
                                        : progress >= 75
                                        ? "bg-progress-high"
                                        : progress >= 40
                                        ? "bg-progress-medium"
                                        : "bg-progress-low"
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium tabular-nums w-[3ch]">
                                  {progress}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  {selectedCoordinator &&
                    getCoordinatorStudents(selectedCoordinator.user.id)
                      .length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Users className="h-8 w-8 text-muted-foreground/60" />
                            <p className="text-sm text-muted-foreground">
                              No students found
                            </p>
                            <p className="text-xs text-muted-foreground">
                              This coordinator's mentors don't have any assigned
                              students yet
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
      </div>
    </DashboardLayout>
  );
};

export default AdminCoordinators;

{
  /* <Button variant="outline" className="w-full sm:w-auto text-sm">
                <UserSearch className="mr-1.5 h-3.5 w-3.5" />
                Search
              </Button> */
}
