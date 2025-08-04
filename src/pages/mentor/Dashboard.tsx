import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  students as allStudents,
  generateDashboardStats,
  users,
} from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StudentCard from "@/components/StudentCard";
import { Student } from "@/lib/types";

const COLORS = {
  completed: "#793078", // primary
  active: "#058DCE", // secondary
  pending: "#00996B", // neutral gray (Tailwind gray-400)
  remaining: "#A3A3A3", // neutral gray for remaining
};

const ITEMS_PER_PAGE = 10;

const MentorDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [studentPage, setStudentPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);

  if (!user) return null;

  // Get students for this mentor
  const myStudents = students.filter((student) => student.mentorId === user.id);

  // Generate stats for these students
  const stats = generateDashboardStats(myStudents);

  // Prepare pie chart data
  const sessionsPieData = [
    {
      name: "Completed",
      value: stats.completedSessions,
      color: COLORS.completed,
    },
    { name: "Active", value: stats.activeSessions, color: COLORS.active },
    { name: "Pending", value: stats.pendingSessions, color: COLORS.pending },
  ];

  const hoursPieData = [
    { name: "Completed", value: stats.completedHours, color: COLORS.completed },
    { name: "Active", value: stats.activeHours, color: COLORS.active },
    { name: "Pending", value: stats.pendingHours, color: COLORS.pending },
  ];

  const paymentsPieData = [
    {
      name: "Completed",
      value: stats.completedPayments,
      color: COLORS.completed,
    },
    { name: "Pending", value: stats.pendingPayments, color: COLORS.pending },
  ];

  // Generate student performance data
  const studentPerformanceData = myStudents.map((student) => {
    const completedSessions = student.sessionsCompleted;
    const remainingSessions = student.totalSessions - student.sessionsCompleted;
    const completedHours = Math.round(
      student.totalHours * (student.sessionsCompleted / student.totalSessions)
    );
    const remainingHours = student.totalHours - completedHours;
    const completedPayments = student.paidAmount;
    const remainingPayments = student.totalPayment - student.paidAmount;

    return {
      name: student.name,
      completedSessions,
      remainingSessions,
      completedHours,
      remainingHours,
      progress: Math.floor((completedSessions / student.totalSessions) * 100),
      completedPayments,
      remainingPayments,
    };
  });

  // Paginated student data
  const paginatedStudents = studentPerformanceData.slice(
    (studentPage - 1) * ITEMS_PER_PAGE,
    studentPage * ITEMS_PER_PAGE
  );
  const studentTotalPages = Math.ceil(
    studentPerformanceData.length / ITEMS_PER_PAGE
  );

  // Get teachers for this mentor's students
  const myTeacherIds = Array.from(new Set(myStudents.map((s) => s.teacherId)));
  const myTeachers = users.filter(
    (u) => u.role === "teacher" && myTeacherIds.includes(u.id)
  );

  // Aggregate teacher performance data from students
  const teacherPerformanceData = myTeachers.map((teacher) => {
    const teacherStudents = myStudents.filter(
      (s) => s.teacherId === teacher.id
    );
    const totalSessions = teacherStudents.reduce(
      (sum, s) => sum + s.totalSessions,
      0
    );
    const completedSessions = teacherStudents.reduce(
      (sum, s) => sum + s.sessionsCompleted,
      0
    );
    const remainingSessions = totalSessions - completedSessions;
    const totalHours = teacherStudents.reduce(
      (sum, s) => sum + s.totalHours,
      0
    );
    const completedHours = teacherStudents.reduce(
      (sum, s) =>
        sum +
        Math.round(s.totalHours * (s.sessionsCompleted / s.totalSessions)),
      0
    );
    const remainingHours = totalHours - completedHours;
    const completedPayments = teacherStudents.reduce(
      (sum, s) => sum + (s.paidAmount || 0),
      0
    );
    const totalPayments = teacherStudents.reduce(
      (sum, s) => sum + (s.totalPayment || 0),
      0
    );
    const remainingPayments = totalPayments - completedPayments;
    return {
      name: teacher.name,
      completedSessions,
      remainingSessions,
      completedHours,
      remainingHours,
      progress:
        totalSessions > 0
          ? Math.floor((completedSessions / totalSessions) * 100)
          : 0,
      completedPayments,
      remainingPayments,
    };
  });
  const paginatedTeachers = teacherPerformanceData.slice(
    (teacherPage - 1) * ITEMS_PER_PAGE,
    teacherPage * ITEMS_PER_PAGE
  );
  const teacherTotalPages = Math.ceil(
    teacherPerformanceData.length / ITEMS_PER_PAGE
  );

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x - 11}
        y={y}
        fill="white"
        // textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <DashboardStatsCard
          stats={stats}
          users={users}
          showStudents
          showTeachers
          title="My Students Overview"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="rounded-xl shadow-md hover:shadow-lg transition hover:scale-[1.02] bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle>Sessions Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessionsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                    paddingAngle={4}
                  >
                    {sessionsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md hover:shadow-lg transition hover:scale-[1.02] bg-gradient-to-br from-secondary/5 to-transparent">
            <CardHeader>
              <CardTitle>Hours Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hoursPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                    paddingAngle={4}
                  >
                    {hoursPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md hover:shadow-lg transition hover:scale-[1.02] bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle>Payments Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                    paddingAngle={4}
                  >
                    {paymentsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sessions Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Sessions:</span>
                  <span className="font-bold">{stats.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Sessions:</span>
                  <span className="font-bold">{stats.activeSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Sessions:</span>
                  <span className="font-bold">{stats.completedSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Sessions:</span>
                  <span className="font-bold">{stats.pendingSessions}</span>
                </div>
              <div className="flex justify-between">
                <span>Meetings:</span>
                <span className="font-bold">{stats.meetingSessions}</span>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hours Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Hours:</span>
                  <span className="font-bold">{stats.totalHours}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Hours:</span>
                  <span className="font-bold">{stats.activeHours}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Hours:</span>
                  <span className="font-bold">{stats.completedHours}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Hours:</span>
                  <span className="font-bold">{stats.pendingHours}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Students Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Students:</span>
                  <span className="font-bold">{myStudents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Students:</span>
                  <span className="font-bold">
                    {myStudents.filter((s) => s.status === "active").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Progress:</span>
                  <span className="font-bold">{stats.overallProgress}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Sessions/Student:</span>
                  <span className="font-bold">
                    {myStudents.length > 0
                      ? Math.round(stats.totalSessions / myStudents.length)
                      : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Payments:</span>
                  <span className="font-bold">
                    ₹{stats.totalPayments.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Payments:</span>
                  <span className="font-bold">
                    ₹{stats.completedPayments.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments:</span>
                  <span className="font-bold">
                    ₹{stats.pendingPayments.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Collection Rate:</span>
                  <span className="font-bold">
                    {(
                      (stats.completedPayments / stats.totalPayments) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="student">
          <TabsList>
            <TabsTrigger value="student">Student Performance</TabsTrigger>
            <TabsTrigger value="teacher">Teacher Performance</TabsTrigger>
          </TabsList>

          {/* Student Performance: Chart + Details */}
          <TabsContent value="student" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div
                    style={{
                      minWidth: Math.max(
                        studentPerformanceData.length * 120,
                        800
                      ),
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={studentPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="completedHours"
                          stroke="#793078"
                          name="Completed Hours"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="remainingHours"
                          stroke="#058DCE"
                          name="Remaining Hours"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Workload Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {paginatedStudents.map((student, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <div className="text-sm space-x-4">
                            <span>
                              Sessions: {student.completedSessions}/
                              {student.completedSessions +
                                student.remainingSessions}
                            </span>
                            <span>
                              Hours: {student.completedHours}/
                              {student.completedHours + student.remainingHours}
                            </span>
                            <span>
                              Payments: {student.completedPayments}/
                              {student.completedPayments +
                                student.remainingPayments}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-palette-accent h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            Total Hours:{" "}
                            {student.completedHours + student.remainingHours}
                          </span>
                          <span>Progress: {student.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                      onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                      disabled={studentPage === 1}
                    >
                      Prev
                    </button>
                    <span className="px-2 py-1">
                      {studentPage} / {studentTotalPages}
                    </span>
                    <button
                      className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                      onClick={() =>
                        setStudentPage((p) =>
                          Math.min(studentTotalPages, p + 1)
                        )
                      }
                      disabled={studentPage === studentTotalPages}
                    >
                      Next
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Teacher Performance: Chart + Details */}
          <TabsContent value="teacher" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div
                    style={{
                      minWidth: Math.max(
                        teacherPerformanceData.length * 120,
                        800
                      ),
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={teacherPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="completedHours"
                          stroke="#793078"
                          name="Completed Hours"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="remainingHours"
                          stroke="#058DCE"
                          name="Remaining Hours"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Teacher Workload Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {paginatedTeachers.map((teacher, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{teacher.name}</span>
                          </div>
                          <div className="text-sm space-x-4">
                            <span>
                              Sessions: {teacher.completedSessions}/
                              {teacher.completedSessions +
                                teacher.remainingSessions}
                            </span>
                            <span>
                              Hours: {teacher.completedHours}/
                              {teacher.completedHours + teacher.remainingHours}
                            </span>
                            <span>
                              Payments: {teacher.completedPayments}/
                              {teacher.completedPayments +
                                teacher.remainingPayments}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-palette-accent h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${teacher.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            Total Hours:{" "}
                            {teacher.completedHours + teacher.remainingHours}
                          </span>
                          <span>Progress: {teacher.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                      onClick={() => setTeacherPage((p) => Math.max(1, p - 1))}
                      disabled={teacherPage === 1}
                    >
                      Prev
                    </button>
                    <span className="px-2 py-1">
                      {teacherPage} / {teacherTotalPages}
                    </span>
                    <button
                      className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                      onClick={() =>
                        setTeacherPage((p) =>
                          Math.min(teacherTotalPages, p + 1)
                        )
                      }
                      disabled={teacherPage === teacherTotalPages}
                    >
                      Next
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;
