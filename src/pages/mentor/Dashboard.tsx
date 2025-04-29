
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents, generateDashboardStats } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import StudentCard from "@/components/StudentCard";
import { Student } from "@/lib/types";

const MentorDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>(allStudents);
  
  if (!user) return null;
  
  // Get students for this mentor
  const myStudents = students.filter((student) => student.mentorId === user.id);
  
  // Generate stats for these students
  const stats = generateDashboardStats(myStudents);
  
  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
        
        <DashboardStatsCard stats={stats} title="My Students Overview" />
        
        <h2 className="text-xl font-bold mt-8">My Students</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onUpdateStudent={updateStudent}
              canEdit={true}
            />
          ))}
          
          {myStudents.length === 0 && (
            <div className="col-span-3 text-center p-8">
              <p className="text-muted-foreground">
                You don't have any students assigned yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;
