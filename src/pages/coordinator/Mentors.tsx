
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users, students as allStudents } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const CoordinatorMentors = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get mentors under this coordinator
  const mentors = users.filter(
    (u) => u.role === "mentor" && u.supervisorId === user.id
  );
  
  // Calculate mentor statistics
  const mentorStats = mentors.map((mentor) => {
    const mentorStudents = allStudents.filter(
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
    
    return {
      ...mentor,
      studentCount: mentorStudents.length,
      completedSessions,
      totalSessions,
      progress: Math.floor((completedSessions / totalSessions) * 100),
      totalHours,
    };
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Mentors</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentorStats.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium">{mentor.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{mentor.studentCount}</Badge>
                    </TableCell>
                    <TableCell>{mentor.totalHours}</TableCell>
                    <TableCell>
                      {mentor.completedSessions} / {mentor.totalSessions}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={mentor.progress} className="w-[60%]" />
                        <span className="text-sm">{mentor.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentorStats.map((mentor) => (
            <Card key={mentor.id}>
              <CardHeader>
                <CardTitle>{mentor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{mentor.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span className="font-medium">{mentor.studentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Hours:</span>
                    <span className="font-medium">{mentor.totalHours}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="font-medium">{mentor.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full">
                      <div 
                        className={`h-2.5 rounded-full ${
                          mentor.progress === 100
                            ? "bg-progress-complete"
                            : mentor.progress >= 71
                            ? "bg-progress-high"
                            : mentor.progress >= 31
                            ? "bg-progress-medium"
                            : "bg-progress-low"
                        }`}
                        style={{ width: `${mentor.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions Completed:</span>
                    <span className="font-medium">
                      {mentor.completedSessions} / {mentor.totalSessions}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoordinatorMentors;
