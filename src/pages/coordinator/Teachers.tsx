import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Lightbulb,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  TrendingUp,
  Download, // Add Download icon
} from "lucide-react";
import { useState } from "react";
import MentorAssignmentDialog from "@/components/dialog/MentorAssignmentDialog";
import StudentAssignmentDialog from "@/components/dialog/StudentAssignmentDialog";
// Mock data for users and students (replace with your actual imports if available)
import { users as allUsers, students as allStudents } from "@/lib/mock-data";

// Mock data for teachers
const mockTeachers = [
  {
    id: "teacher1",
    name: "Alice Teacher",
    email: "alice.teacher@example.com",
    phone: "+91 98765 43221",
    status: "active",
    coordinatorId: "coord1",
    mentorId: `mentor${Math.floor(Math.random() * 10) + 1}`,
    students: 12,
    packages: 12,
    sessions: 24,
    completedSessions: 18,
    totalHours: 48,
    completedHours: 36,
    totalPayment: 24000,
    paidAmount: 18000,
  },
  {
    id: "teacher2",
    name: "Bob Teacher",
    email: "bob.teacher@example.com",
    phone: "+91 98765 43222",
    status: "inactive",
    coordinatorId: "coord2",
    mentorId: `mentor${Math.floor(Math.random() * 10) + 1}`,
    students: 8,
    sessions: 16,
    completedSessions: 10,
    totalHours: 32,
    completedHours: 20,
    totalPayment: 16000,
    paidAmount: 10000,
  },
];

const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

export default function CoordinatorTeachers() {
  const [search, setSearch] = useState("");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [dialogTeacher, setDialogTeacher] = useState<any | null>(null);

  // Helper: get mentors assigned to a coordinator (teacher)
  const getAssignedMentors = (coordinatorId: string) => {
    return allUsers.filter(
      (u) => u.role === "mentor" && u.supervisorId === coordinatorId
    );
  };

  // Helper: get students for a coordinator's mentors
  const getStudents = (coordinatorId: string) => {
    const mentorIds = allUsers
      .filter((u) => u.role === "mentor" && u.supervisorId === coordinatorId)
      .map((m) => m.id);
    return allStudents.filter((s) => mentorIds.includes(s.mentorId));
  };

  const myMentors = allUsers.filter((u) => u.role === "mentor");

  const filteredTeachers = mockTeachers.filter((teacher) => {
    const matchesSearch = teacher.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesMentor =
      mentorFilter === "all" ||
      teacher.mentorId === mentorFilter;
    return matchesSearch && matchesMentor;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            Teachers Management
          </h1>
        </div>
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Teachers</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-end">
              {/* Search by Name */}
              <div className="w-full md:flex-1 min-w-[180px]">
                <Label className="mb-1 block">Search by Name</Label>
                <Input
                  placeholder="Search teachers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              {/* Filter by Coordinator */}
              <div className="w-full md:flex-1 min-w-[180px]">
                <Label className="mb-1 block">Filter by Mentors</Label>
                <Select
                  value={mentorFilter}
                  onValueChange={setMentorFilter}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentors</SelectItem>
                    {myMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name} ({mentor.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          {filteredTeachers.map((teacher) => {
            const sessionsProgress = Math.round(
              (teacher.completedSessions / teacher.sessions) * 100
            );
            const hoursProgress = Math.round(
              (teacher.completedHours / teacher.totalHours) * 100
            );
            const paymentProgress = Math.round(
              (teacher.paidAmount / teacher.totalPayment) * 100
            );
            return (
              <Card key={teacher.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">
                        {teacher.name} ({teacher.id})
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {teacher.email}
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex flex-wrap gap-2 mt-1 justify-start sm:justify-end">
                        <a
                          href={`mailto:${teacher.email}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="hidden xs:inline">Mail</span>
                        </a>
                        <a
                          href={`tel:${teacher.phone || ""}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="hidden xs:inline">Call</span>
                        </a>
                        <a
                          href={`https://wa.me/${(teacher.phone || "").replace(
                            /[^\d]/g,
                            ""
                          )}?text=${encodeURIComponent(
                            `Hello ${teacher.name} (ID: ${teacher.id}),\n\nThis is a message from Albedo Educator.`
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
                        <p className="text-sm text-muted-foreground">
                          Students
                        </p>
                        <p className="text-2xl font-bold break-words text-center">
                          {teacher.students ? (
                            teacher.students
                          ) : (
                            <span className="text-xs text-muted-foreground font-normal">
                              No active Students
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex-1 min-w-[100px] bg-card rounded-lg p-3 flex flex-col items-center justify-center border">
                        <p className="text-sm text-muted-foreground">
                          Packages
                        </p>
                        <p className="text-2xl font-bold break-words text-center">
                          {teacher.packages ? (
                            teacher.packages
                          ) : (
                            <span className="text-xs text-muted-foreground font-normal">
                              No active Packages
                            </span>
                          )}
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
                              sessionsProgress === 100
                                ? "bg-palette-info"
                                : sessionsProgress >= 75
                                ? "bg-palette-accent"
                                : sessionsProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${sessionsProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {teacher.completedSessions}/{teacher.sessions} (
                              {sessionsProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {teacher.sessions - teacher.completedSessions} (
                              {100 - sessionsProgress}%)
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
                              hoursProgress === 100
                                ? "bg-palette-info"
                                : hoursProgress >= 75
                                ? "bg-palette-accent"
                                : hoursProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${hoursProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              {teacher.completedHours}/{teacher.totalHours} (
                              {hoursProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              {teacher.totalHours - teacher.completedHours} (
                              {100 - hoursProgress}%)
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
                              paymentProgress === 100
                                ? "bg-palette-info"
                                : paymentProgress >= 75
                                ? "bg-palette-accent"
                                : paymentProgress >= 40
                                ? "bg-palette-warning"
                                : "bg-palette-danger"
                            }`}
                            style={{ width: `${paymentProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground flex-wrap">
                          <div className="flex flex-col break-words text-center">
                            <span>Completed:</span>
                            <span>
                              ₹{teacher.paidAmount.toLocaleString()}/₹
                              {teacher.totalPayment.toLocaleString()} (
                              {paymentProgress}%)
                            </span>
                          </div>
                          <div className="flex flex-col break-words text-center">
                            <span>Pending:</span>
                            <span>
                              ₹
                              {(
                                teacher.totalPayment - teacher.paidAmount
                              ).toLocaleString()}{" "}
                              ({100 - paymentProgress}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Financial Stats - Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Teacher Salary
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p>{formatCurrency(0)}</p>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg border border-purple-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">
                            Class Take Amount
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p>{formatCurrency(0)}</p>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-lg border border-indigo-100/50 dark:bg-gray-900/100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-muted-foreground">Expense Ratio</p>
                        </div>
                        <div className="space-y-1">
                          <p>0%</p>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => {
                          setDialogTeacher(teacher);
                          setIsMentorDialogOpen(true);
                        }}
                      >
                        Mentors
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => {
                          setDialogTeacher(teacher);
                          setIsStudentDialogOpen(true);
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
          {filteredTeachers.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No teachers found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
      {dialogTeacher && (
        <MentorAssignmentDialog
          open={isMentorDialogOpen}
          onOpenChange={setIsMentorDialogOpen}
          coordinator={{ user: dialogTeacher }}
          getAssignedMentors={getAssignedMentors}
          allStudents={allStudents}
          formatCurrency={formatCurrency}
          userRole={"admin"}
        />
      )}
      {dialogTeacher && (
        <StudentAssignmentDialog
          open={isStudentDialogOpen}
          onOpenChange={setIsStudentDialogOpen}
          coordinator={{ user: dialogTeacher }}
          getStudents={getStudents}
          users={allUsers}
          userRole={"admin"}
        />
      )}
    </DashboardLayout>
  );
}
