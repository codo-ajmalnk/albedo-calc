
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { students as allStudents, users } from "@/lib/mock-data";
import StudentCard from "@/components/StudentCard";
import { Student } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>(allStudents);
  const [search, setSearch] = useState("");
  const [mentorFilter, setMentorFilter] = useState("all");
  
  const mentors = users.filter((user) => user.role === "mentor");
  
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase());
    const matchesMentor = mentorFilter === "all" || student.mentorId === mentorFilter;
    return matchesSearch && matchesMentor;
  });
  
  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };
  
  const getMentorName = (mentorId: string) => {
    const mentor = users.find((user) => user.id === mentorId);
    return mentor ? mentor.name : "Unknown Mentor";
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">All Students</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Filter Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="text-sm font-medium">
                  Search by Name
                </label>
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="mentor" className="text-sm font-medium">
                  Filter by Mentor
                </label>
                <Select
                  value={mentorFilter}
                  onValueChange={setMentorFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentors</SelectItem>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="flex flex-col">
              <div className="text-sm font-medium mb-2 text-muted-foreground">
                Mentor: {getMentorName(student.mentorId)}
              </div>
              <StudentCard
                student={student}
                onUpdateStudent={updateStudent}
                canEdit={true}
              />
            </div>
          ))}
          
          {filteredStudents.length === 0 && (
            <div className="col-span-3 text-center p-8">
              <p className="text-muted-foreground">
                No students found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
