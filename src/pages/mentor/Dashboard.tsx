import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents, generateDashboardStats, users } from "@/lib/mock-data";
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
  active: "#058DCE",    // secondary
  pending: "#00996B",  // neutral gray (Tailwind gray-400)
  remaining: "#A3A3A3", // neutral gray for remaining
};

const MentorDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(allStudents);

  if (!user) return null;

  // Get students for this mentor
  const myStudents = students.filter((student) => student.mentorId === user.id);

  // Generate stats for these students
  const stats = generateDashboardStats(myStudents);

  // Prepare pie chart data
  const sessionsPieData = [
    { name: "Completed", value: stats.completedSessions, color: COLORS.completed },
    { name: "Active", value: stats.activeSessions, color: COLORS.active },
    { name: "Pending", value: stats.pendingSessions, color: COLORS.pending },
  ];

  const hoursPieData = [
    { name: "Completed", value: stats.completedHours, color: COLORS.completed },
    { name: "Active", value: stats.activeHours, color: COLORS.active },
    { name: "Pending", value: stats.pendingHours, color: COLORS.pending },
  ];

  const paymentsPieData = [
    { name: "Completed", value: stats.completedPayments, color: COLORS.completed },
    { name: "Pending", value: stats.pendingPayments, color: COLORS.pending },
  ];

  // Generate student performance data
  const studentPerformanceData = myStudents.map(student => {
    const completedSessions = student.sessionsCompleted;
    const remainingSessions = student.totalSessions - student.sessionsCompleted;
    const completedHours = Math.round(student.totalHours * (student.sessionsCompleted / student.totalSessions));
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
      remainingPayments
    };
  });

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x-11}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {myStudents.filter(s => s.status === 'active').length}
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
                  <span className="font-bold">₹{stats.totalPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Payments:</span>
                  <span className="font-bold">₹{stats.completedPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments:</span>
                  <span className="font-bold">₹{stats.pendingPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Collection Rate:</span>
                  <span className="font-bold">
                    {((stats.completedPayments / stats.totalPayments) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Student Performance</TabsTrigger>
            <TabsTrigger value="details">Student Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: Math.max(studentPerformanceData.length * 120, 800) }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={studentPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="completedHours" stroke="#793078" name="Completed Hours" strokeWidth={2} />
                        <Line type="monotone" dataKey="remainingHours" stroke="#058DCE" name="Remaining Hours" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {studentPerformanceData.map((student, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="text-sm space-x-4">
                          <span>Sessions: {student.completedSessions}/{student.completedSessions + student.remainingSessions}</span>
                          <span>Hours: {student.completedHours}/{student.completedHours + student.remainingHours}</span>
                          <span>Payments: {student.completedPayments}/{student.completedPayments + student.remainingPayments}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-palette-accent h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total Hours: {student.completedHours + student.remainingHours}</span>
                        <span>Progress: {student.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;
