import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents, users, generateDashboardStats } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";

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
  
  // Generate performance data for mentors
  const mentorPerformanceData = mentors.map(mentor => {
    const mentorStudents = myStudents.filter(
      student => student.mentorId === mentor.id
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
      (sum, student) => sum + (student.totalHours * (student.sessionsCompleted / student.totalSessions)),
      0
    );
    
    return {
      name: mentor.name,
      students: mentorStudents.length,
      completedSessions,
      remainingSessions: totalSessions - completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      remainingHours: Math.round(totalHours - completedHours),
      progress: totalSessions > 0 ? Math.floor((completedSessions / totalSessions) * 100) : 0
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
                  <span>Student-Mentor Ratio:</span>
                  <span className="font-bold">{Math.round(myStudents.length / mentors.length)}:1</span>
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
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Mentor Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mentorPerformanceData}>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Mentor Workload Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mentorPerformanceData.map((mentor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{mentor.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({mentor.students} students)
                      </span>
                    </div>
                    <div className="text-sm space-x-4">
                      <span>Sessions: {mentor.completedSessions}/{mentor.completedSessions + mentor.remainingSessions}</span>
                      <span>Hours: {mentor.completedHours}/{mentor.completedHours + mentor.remainingHours}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full">
                    <div 
                      className="bg-primary h-2.5 rounded-full"
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CoordinatorDashboard;
