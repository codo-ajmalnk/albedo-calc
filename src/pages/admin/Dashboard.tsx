
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import { generateDashboardStats, students, users } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(generateDashboardStats());
  
  // Generate data for charts
  const mentorData = users
    .filter(user => user.role === "mentor")
    .map(mentor => {
      const mentorStudents = students.filter(
        student => student.mentorId === mentor.id
      );
      const completedSessions = mentorStudents.reduce(
        (sum, student) => sum + student.sessionsCompleted,
        0
      );
      const totalSessions = mentorStudents.reduce(
        (sum, student) => sum + student.totalSessions,
        0
      );
      
      return {
        name: mentor.name,
        students: mentorStudents.length,
        completedSessions,
        remainingSessions: totalSessions - completedSessions,
        progress: Math.floor((completedSessions / totalSessions) * 100)
      };
    });

  // Count students in progress ranges
  const progressRanges = [
    { name: "0-30%", count: 0 },
    { name: "31-70%", count: 0 },
    { name: "71-99%", count: 0 },
    { name: "100%", count: 0 },
  ];
  
  students.forEach(student => {
    const progress = student.progressPercentage;
    if (progress === 100) progressRanges[3].count++;
    else if (progress >= 71) progressRanges[2].count++;
    else if (progress >= 31) progressRanges[1].count++;
    else progressRanges[0].count++;
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        <DashboardStatsCard stats={stats} title="System Overview" />
        
        <Tabs defaultValue="mentors">
          <TabsList>
            <TabsTrigger value="mentors">Mentor Performance</TabsTrigger>
            <TabsTrigger value="progress">Progress Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mentors" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mentorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completedSessions" stackId="a" fill="#16a34a" name="Completed Sessions" />
                    <Bar dataKey="remainingSessions" stackId="a" fill="#f97316" name="Remaining Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Students Progress Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={progressRanges} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2563eb" name="Number of Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Coordinators:</span>
                  <span className="font-bold">{users.filter(u => u.role === "coordinator").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mentors:</span>
                  <span className="font-bold">{users.filter(u => u.role === "mentor").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Students:</span>
                  <span className="font-bold">{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student-Mentor Ratio:</span>
                  <span className="font-bold">6:1</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Workload Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Sessions Per Mentor:</span>
                  <span className="font-bold">450</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Hours Per Mentor:</span>
                  <span className="font-bold">600</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Sessions:</span>
                  <span className="font-bold">2700</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hours:</span>
                  <span className="font-bold">3600</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
