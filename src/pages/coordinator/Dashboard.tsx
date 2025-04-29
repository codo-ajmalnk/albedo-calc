
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents, users, generateDashboardStats } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const CoordinatorDashboard = () => {
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
  
  // Progress distribution data
  const progressData = [
    { name: "0-30%", value: 0, color: "#dc2626" },
    { name: "31-70%", value: 0, color: "#f97316" },
    { name: "71-99%", value: 0, color: "#16a34a" },
    { name: "100%", value: 0, color: "#2563eb" },
  ];
  
  myStudents.forEach((student) => {
    const progress = student.progressPercentage;
    if (progress === 100) progressData[3].value++;
    else if (progress >= 71) progressData[2].value++;
    else if (progress >= 31) progressData[1].value++;
    else progressData[0].value++;
  });
  
  // Mentor workload data
  const mentorWorkloadData = mentors.map((mentor) => {
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
    
    return {
      name: mentor.name,
      completedSessions,
      remainingSessions: totalSessions - completedSessions,
    };
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
        
        <DashboardStatsCard stats={stats} title="My Team Overview" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={progressData.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Mentors:</span>
                  <span className="font-bold">{mentors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Students:</span>
                  <span className="font-bold">{myStudents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions Completed:</span>
                  <span className="font-bold">{stats.completedSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hours:</span>
                  <span className="font-bold">{stats.totalHours}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Progress:</span>
                  <span className="font-bold">{stats.overallProgress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mentor Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mentorWorkloadData.map((mentor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{mentor.name}</span>
                    <span>
                      {mentor.completedSessions} / {mentor.completedSessions + mentor.remainingSessions} sessions completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full">
                    <div 
                      className="bg-primary h-2.5 rounded-full"
                      style={{ 
                        width: `${Math.floor(mentor.completedSessions / (mentor.completedSessions + mentor.remainingSessions) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CoordinatorDashboard;
