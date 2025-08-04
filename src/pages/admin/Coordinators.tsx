import DashboardLayout from "@/components/DashboardLayout";
import { CoordinatorDialog } from "@/components/DialogOld/CoordinatorDialog";
import { MentorDialog } from "@/components/DialogOld/MentorDialog";
import ProgressBar from "@/components/ProgressBar";
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
import {
  Lightbulb,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MessageCircle,
  Printer,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorAssignmentDialog from "../../components/dialog/MentorAssignmentDialog";
import StudentAssignmentDialog from "../../components/dialog/StudentAssignmentDialog";

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
    "details" | "mentors" | "students" | null
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
  const [newMentor, setNewMentor] = useState({
    id: `mentor${users.filter((u) => u.role === "mentor").length + 1}`,
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });
  const [editingMentor, setEditingMentor] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  } | null>(null);
  const [selectedStudentsToAssign, setSelectedStudentsToAssign] = useState<
    string[]
  >([]);
  const [students, setStudents] = useState(allStudents);

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


  const getAssignedMentors = (coordinatorId: string) => {
    // Filter users to get only mentors with matching supervisorId
    const mentors = users.filter(
      (user) => user.role === "mentor" && user.supervisorId === coordinatorId
    );

    console.log("Getting mentors for coordinator:", coordinatorId);
    console.log("Found mentors:", mentors);

    return mentors;
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
                          href={`https://wa.me/${(
                            coordinator.phone || ""
                          ).replace(/[^\d]/g, "")}?text=${encodeURIComponent(
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
                          onClick={() => alert('Download triggered!')}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden xs:inline">Download</span>
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
          selectedCoordinator={asCoordinator(selectedCoordinator?.user)}
          newCoordinator={newCoordinator}
          editingCoordinator={editingCoordinator}
          stats={selectedCoordinator?.stats}
          allStudents={allStudents}
          onViewDetailsClose={closeAllDialogs}
          setNewCoordinator={setNewCoordinator}
          setEditingCoordinator={setEditingCoordinator}
        />

        <MentorAssignmentDialog
          open={activeDialog === "mentors"}
          onOpenChange={(open) => {
            if (!open) {
              closeAllDialogs();
            }
          }}
          coordinator={selectedCoordinator}
          getAssignedMentors={getAssignedMentors}
          allStudents={allStudents}
          formatCurrency={formatCurrency}
          userRole={"coordinator"}
        />

        <StudentAssignmentDialog
          open={activeDialog === "students"}
          onOpenChange={(open) => {
            if (!open) {
              closeAllDialogs();
            }
          }}
          coordinator={selectedCoordinator}
          getStudents={getCoordinatorStudents}
          users={users}
          userRole={"coordinator"}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminCoordinators;
