
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import StudentCard from "@/components/StudentCard";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MentorStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [search, setSearch] = useState("");
  
  if (!user) return null;
  
  // Get students for this mentor
  const myStudents = students.filter((student) => student.mentorId === user.id);
  
  const filteredStudents = myStudents.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Students</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Search Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Students Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{formatDate(student.startDate)}</TableCell>
                    <TableCell>{formatDate(student.endDate)}</TableCell>
                    <TableCell>
                      {student.sessionsCompleted} / {student.totalSessions}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 h-2.5 rounded-full">
                          <div 
                            className={`h-2.5 rounded-full ${
                              student.progressPercentage === 100
                                ? "bg-progress-complete"
                                : student.progressPercentage >= 71
                                ? "bg-progress-high"
                                : student.progressPercentage >= 31
                                ? "bg-progress-medium"
                                : "bg-progress-low"
                            }`}
                            style={{ width: `${student.progressPercentage}%` }}
                          />
                        </div>
                        <span>{student.progressPercentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onUpdateStudent={updateStudent}
              canEdit={true}
            />
          ))}
          
          {filteredStudents.length === 0 && (
            <div className="col-span-3 text-center p-8">
              <p className="text-muted-foreground">
                No students found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorStudents;
