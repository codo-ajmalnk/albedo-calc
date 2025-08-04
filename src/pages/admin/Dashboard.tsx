import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import { generateDashboardStats, students, users } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = {
  completed: "#793078", // primary
  active: "#058DCE", // secondary
  upcoming: "#00996B",
  meeting: "#00996B",
  pending: "#00996B", // neutral gray (Tailwind gray-400)
  remaining: "#A3A3A3", // neutral gray for remaining
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(generateDashboardStats());
  console.log("Generated stats:", stats);
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

  // Generate data for teacher charts
  const teacherData = users
    .filter((user) => user.role === "teacher")
    .map((teacher) => {
      const teacherStudents = students.filter(
        (student) => student.teacherId === teacher.id
      );
      const completedSessions = teacherStudents.reduce(
        (sum, student) => sum + student.sessionsCompleted,
        0
      );
      const totalSessions = teacherStudents.reduce(
        (sum, student) => sum + student.totalSessions,
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
      return {
        name: teacher.name,
        students: teacherStudents.length,
        completedSessions,
        remainingSessions: totalSessions - completedSessions,
        completedHours: Math.round(completedHours),
        remainingHours: Math.round(totalHours - completedHours),
        progress: Math.floor((completedSessions / totalSessions) * 100),
        completedPayments,
        totalPayments: completedPayments,
      };
    });

  // Generate data for mentor charts
  const mentorData = users
    .filter((user) => user.role === "mentor")
    .map((mentor) => {
      const mentorStudents = students.filter(
        (student) => student.mentorId === mentor.id
      );
      const completedSessions = mentorStudents.reduce(
        (sum, student) => sum + student.sessionsCompleted,
        0
      );
      const totalSessions = mentorStudents.reduce(
        (sum, student) => sum + student.totalSessions,
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

      return {
        name: mentor.name,
        students: mentorStudents.length,
        completedSessions,
        remainingSessions: totalSessions - completedSessions,
        completedHours: Math.round(completedHours),
        remainingHours: Math.round(totalHours - completedHours),
        progress: Math.floor((completedSessions / totalSessions) * 100),
        completedPayments,
        totalPayments,
      };
    });

  // Generate data for coordinator performance
  const coordinatorData = users
    .filter((user) => user.role === "coordinator")
    .map((coordinator) => {
      const coordinatorMentors = users.filter(
        (user) => user.role === "mentor" && user.supervisorId === coordinator.id
      );

      const mentorIds = coordinatorMentors.map((mentor) => mentor.id);
      const coordinatorStudents = students.filter((student) =>
        mentorIds.includes(student.mentorId)
      );

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
      const completedPayments = coordinatorStudents.reduce(
        (sum, student) => sum + student.paidAmount,
        0
      );
      const totalPayments = coordinatorStudents.reduce(
        (sum, student) => sum + student.totalPayment,
        0
      );

      return {
        name: coordinator.name,
        mentors: coordinatorMentors.length,
        students: coordinatorStudents.length,
        completedSessions,
        remainingSessions: totalSessions - completedSessions,
        completedHours: Math.round(completedHours),
        remainingHours: Math.round(totalHours - completedHours),
        progress:
          totalSessions > 0
            ? Math.floor((completedSessions / totalSessions) * 100)
            : 0,
        completedPayments,
        totalPayments,
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

  // Pagination state
  const [coordinatorPage, setCoordinatorPage] = useState(1);
  const [mentorPage, setMentorPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Sliced data for current page
  const paginatedCoordinators = coordinatorData.slice(
    (coordinatorPage - 1) * ITEMS_PER_PAGE,
    coordinatorPage * ITEMS_PER_PAGE
  );
  const paginatedMentors = mentorData.slice(
    (mentorPage - 1) * ITEMS_PER_PAGE,
    mentorPage * ITEMS_PER_PAGE
  );
  const paginatedTeachers = teacherData.slice(
    (teacherPage - 1) * ITEMS_PER_PAGE,
    teacherPage * ITEMS_PER_PAGE
  );

  // Total pages
  const coordinatorTotalPages = Math.ceil(coordinatorData.length / ITEMS_PER_PAGE);
  const mentorTotalPages = Math.ceil(mentorData.length / ITEMS_PER_PAGE);
  const teacherTotalPages = Math.ceil(teacherData.length / ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* <h1 className="text-2xl font-bold">Admin Dashboard</h1> */}

        <DashboardStatsCard
          stats={stats}
          users={users}
          showCoordinators
          showMentors
          showStudents
          showTeachers
          title="System Overview"
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
              <CardTitle>Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Coordinators:</span>
                  <span className="font-bold">
                    {users.filter((u) => u.role === "coordinator").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mentors:</span>
                  <span className="font-bold">
                    {users.filter((u) => u.role === "mentor").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Students:</span>
                  <span className="font-bold">{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Teachers:</span>
                  <span className="font-bold">
                    {users.filter((u) => u.role === "teacher").length}
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
                  <span className="font-bold">{stats.totalPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Payments:</span>
                  <span className="font-bold">{stats.completedPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments:</span>
                  <span className="font-bold">{stats.pendingPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refunded Payments:</span>
                  <span className="font-bold">{stats.refundedPayments}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="coordinators">
          <TabsList>
            <TabsTrigger value="coordinators">
              Coordinator Performance
            </TabsTrigger>
            <TabsTrigger value="mentors">Mentor Performance</TabsTrigger>
            <TabsTrigger value="teachers">Teacher Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="coordinators" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Coordinator Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div
                    style={{
                      minWidth: Math.max(coordinatorData.length * 120, 800),
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={paginatedCoordinators}
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
                  <CardTitle>Coordinator Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {paginatedCoordinators.map((coordinator, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">
                              {coordinator.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({coordinator.mentors} mentors,{" "}
                              {coordinator.students} students)
                            </span>
                          </div>
                          <div className="text-sm space-x-4">
                            <span>
                              Hours: {coordinator.completedHours}/
                              {coordinator.completedHours +
                                coordinator.remainingHours}
                            </span>
                            <span>
                              Payments: ₹
                              {coordinator.completedPayments.toLocaleString()}/₹
                              {coordinator.totalPayments.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full">
                          <div
                            className="bg-palette-accent h-2.5 rounded-full"
                            style={{ width: `${coordinator.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress: {coordinator.progress}%</span>
                          <span>
                            Payment:{" "}
                            {coordinator.totalPayments > 0
                              ? Math.round(
                                  (coordinator.completedPayments /
                                    coordinator.totalPayments) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              <button
                className="px-3 py-1 rounded bg-gray-600 disabled:opacity-50"
                onClick={() => setCoordinatorPage((p) => Math.max(1, p - 1))}
                disabled={coordinatorPage === 1}
              >
                Prev
              </button>
              <span className="px-2 py-1">{coordinatorPage} / {coordinatorTotalPages}</span>
              <button
                className="px-3 py-1  rounded bg-gray-600 disabled:opacity-50"
                onClick={() => setCoordinatorPage((p) => Math.min(coordinatorTotalPages, p + 1))}
                disabled={coordinatorPage === coordinatorTotalPages}
              >
                Next
              </button>
            </div>
          </TabsContent>

          <TabsContent value="mentors" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div
                    style={{ minWidth: Math.max(mentorData.length * 120, 800) }}
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
                  <CardTitle>Mentor Details</CardTitle>
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
                              {mentor.completedSessions +
                                mentor.remainingSessions}
                            </span>
                            <span>
                              Hours: {mentor.completedHours}/
                              {mentor.completedHours + mentor.remainingHours}
                            </span>
                            <span>
                              Payments: ₹
                              {mentor.completedPayments.toLocaleString()}/₹
                              {mentor.totalPayments.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full">
                          <div
                            className="bg-palette-accent h-2.5 rounded-full"
                            style={{ width: `${mentor.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress: {mentor.progress}%</span>
                          <span>
                            Payment:{" "}
                            {mentor.totalPayments > 0
                              ? Math.round(
                                  (mentor.completedPayments /
                                    mentor.totalPayments) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
          </TabsContent>

          <TabsContent value="teachers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div
                    style={{ minWidth: Math.max(teacherData.length * 120, 800) }}
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
                  <CardTitle>Teacher Details</CardTitle>
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
                              {teacher.completedSessions +
                                teacher.remainingSessions}
                            </span>
                            <span>
                              Hours: {teacher.completedHours}/
                              {teacher.completedHours +
                                teacher.remainingHours}
                            </span>
                            <span>
                              Payments: ₹
                              {teacher.completedPayments.toLocaleString()}/₹
                              {teacher.totalPayments.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full">
                          <div
                            className="bg-palette-accent h-2.5 rounded-full"
                            style={{ width: `${teacher.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
