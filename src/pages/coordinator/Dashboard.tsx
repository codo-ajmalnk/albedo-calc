import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  students as allStudents,
  users,
  generateDashboardStats,
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

const COLORS = {
  completed: "#793078", // primary
  active: "#058DCE", // secondary
  pending: "#00996B", // neutral gray (Tailwind gray-400)
  remaining: "#A3A3A3", // neutral gray for remaining
};

const CoordinatorDashboard = () => {
  const [mentorPage, setMentorPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { user } = useAuth();

  if (!user) return null;

  // Get mentors under this coordinator
  const mentors = users.filter(
    (u) => u.role === "mentor" && u.supervisorId === user.id
  );

  const mentorIds = mentors.map((mentor) => mentor.id);

  // Get students under those mentors
  const myStudents = allStudents.filter((student) =>
    mentorIds.includes(student.mentorId)
  );

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

  // Generate performance data for mentors
  const mentorPerformanceData = mentors.map((mentor) => {
    const mentorStudents = myStudents.filter(
      (student) => student.mentorId === mentor.id
    );

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
      (sum, student) =>
        sum +
        student.totalHours *
          (student.sessionsCompleted / student.totalSessions),
      0
    );
    const completedPayments = mentorStudents.reduce(
      (sum, student) => sum + student.paidAmount,
      0
    );
    const totalPayments = mentorStudents.reduce(
      (sum, student) => sum + student.totalPayment,
      0
    );
    const remainingPayments = totalPayments - completedPayments;

    return {
      name: mentor.name,
      students: mentorStudents.length,
      completedSessions,
      remainingSessions: totalSessions - completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      remainingHours: Math.round(totalHours - completedHours),
      progress:
        totalSessions > 0
          ? Math.floor((completedSessions / totalSessions) * 100)
          : 0,
      completedPayments,
      remainingPayments,
    };
  });

  // Generate performance data for teachers
  const teachers = users.filter((u) => u.role === "teacher");
  const teacherPerformanceData = teachers.map((teacher) => {
    const teacherStudents = myStudents.filter(
      (student) => student.teacherId === teacher.id
    );
    const totalSessions = teacherStudents.reduce(
      (sum, student) => sum + student.totalSessions,
      0
    );
    const completedSessions = teacherStudents.reduce(
      (sum, student) => sum + student.sessionsCompleted,
      0
    );
    const totalHours = teacherStudents.reduce(
      (sum, student) => sum + student.totalHours,
      0
    );
    const completedHours = teacherStudents.reduce(
      (sum, student) =>
        sum +
        student.totalHours *
          (student.sessionsCompleted / student.totalSessions),
      0
    );
    const completedPayments = teacherStudents.reduce(
      (sum, student) => sum + student.paidAmount,
      0
    );
    const totalPayments = teacherStudents.reduce(
      (sum, student) => sum + student.totalPayment,
      0
    );
    const remainingPayments = totalPayments - completedPayments;

    return {
      name: teacher.name,
      students: teacherStudents.length,
      completedSessions,
      remainingSessions: totalSessions - completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      remainingHours: Math.round(totalHours - completedHours),
      progress:
        totalSessions > 0
          ? Math.floor((completedSessions / totalSessions) * 100)
          : 0,
      completedPayments,
      remainingPayments,
    };
  });

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
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

  // Sliced data for current page
  const paginatedMentors = mentorPerformanceData.slice(
    (mentorPage - 1) * ITEMS_PER_PAGE,
    mentorPage * ITEMS_PER_PAGE
  );
  const paginatedTeachers = teacherPerformanceData.slice(
    (teacherPage - 1) * ITEMS_PER_PAGE,
    teacherPage * ITEMS_PER_PAGE
  );

  // Total pages
  const mentorTotalPages = Math.ceil(mentorPerformanceData.length / ITEMS_PER_PAGE);
  const teacherTotalPages = Math.ceil(teacherPerformanceData.length / ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardStatsCard
          stats={stats}
          users={users}
          showMentors
          showStudents
          showTeachers
          title="Overall Progress"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <span>Refunded Payments:</span>
                  <span className="font-bold">
                    ₹{stats.refundedPayments.toLocaleString()}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Mentors:</span>
                  <span className="font-bold">{mentors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Students:</span>
                  <span className="font-bold">{myStudents.length}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span>Student-Mentor Ratio:</span>
                  <span className="font-bold">
                    {(myStudents.length / mentors.length).toFixed(1)}:1
                  </span>
                </div> */}
                <div className="flex justify-between">
                  <span>Total Teachers:</span>
                  <span className="font-bold">
                    {users.filter((u) => u.role === "teacher").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Progress:</span>
                  <span className="font-bold">{stats.overallProgress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </div>

        <Tabs defaultValue="mentor">
          <TabsList>
            <TabsTrigger value="mentor">Mentor Performance</TabsTrigger>
            <TabsTrigger value="teacher">Teacher Performance</TabsTrigger>
          </TabsList>

          {/* Mentor Performance: Chart + Details */}
          <TabsContent value="mentor" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div
                    style={{
                      minWidth: Math.max(paginatedMentors.length * 120, 800),
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={paginatedMentors}
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
                  <CardTitle>Mentor Workload Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {paginatedMentors.map((mentor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{mentor.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({mentor.students} students)
                            </span>
                          </div>
                          <div className="text-sm space-x-4">
                            <span>
                              Sessions: {mentor.completedSessions}/
                              {mentor.completedSessions + mentor.remainingSessions}
                            </span>
                            <span>
                              Hours: {mentor.completedHours}/
                              {mentor.completedHours + mentor.remainingHours}
                            </span>
                            <span>
                              Payments: {mentor.completedPayments}/
                              {mentor.completedPayments + mentor.remainingPayments}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-palette-accent h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${mentor.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Total Hours: {mentor.totalHours}</span>
                          <span>Progress: {mentor.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                      onClick={() => setMentorPage((p) => Math.max(1, p - 1))}
                      disabled={mentorPage === 1}
                    >
                      Prev
                    </button>
                    <span className="px-2 py-1">{mentorPage} / {mentorTotalPages}</span>
                    <button
                      className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                      onClick={() => setMentorPage((p) => Math.min(mentorTotalPages, p + 1))}
                      disabled={mentorPage === mentorTotalPages}
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
                      minWidth: Math.max(paginatedTeachers.length * 120, 800),
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={paginatedTeachers}
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
                            <span className="text-sm text-muted-foreground ml-2">
                              ({teacher.students} students)
                            </span>
                          </div>
                          <div className="text-sm space-x-4">
                            <span>
                              Sessions: {teacher.completedSessions}/
                              {teacher.completedSessions + teacher.remainingSessions}
                            </span>
                            <span>
                              Hours: {teacher.completedHours}/
                              {teacher.completedHours + teacher.remainingHours}
                            </span>
                            <span>
                              Payments: {teacher.completedPayments}/
                              {teacher.completedPayments + teacher.remainingPayments}
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
                          <span>Total Hours: {teacher.totalHours}</span>
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
                    <span className="px-2 py-1">{teacherPage} / {teacherTotalPages}</span>
                    <button
                      className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                      onClick={() => setTeacherPage((p) => Math.min(teacherTotalPages, p + 1))}
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

export default CoordinatorDashboard;
