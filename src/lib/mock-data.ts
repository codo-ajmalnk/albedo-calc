
import { Batch, DashboardStats, Role, Student, User } from "./types";

// Mock users
export const users: User[] = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "coord1",
    name: "Coordinator One",
    email: "coordinator1@example.com",
    role: "coordinator",
  },
  {
    id: "coord2",
    name: "Coordinator Two",
    email: "coordinator2@example.com",
    role: "coordinator",
  },
  {
    id: "mentor1",
    name: "Mentor One",
    email: "mentor1@example.com",
    role: "mentor",
    supervisorId: "coord1",
  },
  {
    id: "mentor2",
    name: "Mentor Two",
    email: "mentor2@example.com",
    role: "mentor",
    supervisorId: "coord1",
  },
  {
    id: "mentor3",
    name: "Mentor Three",
    email: "mentor3@example.com",
    role: "mentor",
    supervisorId: "coord1",
  },
  {
    id: "mentor4",
    name: "Mentor Four",
    email: "mentor4@example.com",
    role: "mentor",
    supervisorId: "coord2",
  },
  {
    id: "mentor5",
    name: "Mentor Five",
    email: "mentor5@example.com",
    role: "mentor",
    supervisorId: "coord2",
  },
  {
    id: "mentor6",
    name: "Mentor Six",
    email: "mentor6@example.com",
    role: "mentor",
    supervisorId: "coord2",
  },
];

// Mock batches
export const batches: Batch[] = [
  {
    id: "batch1",
    name: "Batch 1",
    addedOn: "2024-01-28",
    sessionStart: "2024-01-29",
    sessionEnd: "2024-05-29",
    studentCount: 12,
  },
  {
    id: "batch2",
    name: "Batch 2",
    addedOn: "2024-01-29",
    sessionStart: "2024-01-30",
    sessionEnd: "2024-05-30",
    studentCount: 24,
  },
];

// Generate mock students
export const generateMockStudents = (): Student[] => {
  const students: Student[] = [];
  const studentNames = [
    "Student A", "Student B", "Student C", "Student D", "Student E", "Student F",
    "Student G", "Student H", "Student I", "Student J", "Student K", "Student L",
    "Student M", "Student N", "Student O", "Student P", "Student Q", "Student R",
    "Student S", "Student T", "Student U", "Student V", "Student W", "Student X",
    "Student Y", "Student Z", "Student AA", "Student BB", "Student CC", "Student DD",
    "Student EE", "Student FF", "Student GG", "Student HH", "Student II", "Student JJ"
  ];
  
  // Batch 1 students (A to L)
  for (let i = 0; i < 12; i++) {
    const studentName = studentNames[i];
    const mentorIndex = Math.floor(i / 2); // Each mentor has 2 students from batch 1
    const mentorId = `mentor${mentorIndex + 1}`;
    const sessionsCompleted = Math.floor(Math.random() * 450);
    const totalSessions = 450;
    
    students.push({
      id: `student-${i+1}`,
      name: studentName,
      totalHours: 600,
      sessionDuration: 1.33, // ~1 hour 20 minutes
      totalSessions: totalSessions,
      startDate: "2024-01-29",
      endDate: "2024-05-29",
      sessionsCompleted: sessionsCompleted,
      sessionsRemaining: totalSessions - sessionsCompleted,
      progressPercentage: Math.floor((sessionsCompleted / totalSessions) * 100),
      mentorId: mentorId,
      batchId: "batch1"
    });
  }
  
  // Batch 2 students (M to BB)
  for (let i = 12; i < 36; i++) {
    const studentName = studentNames[i];
    const mentorIndex = Math.floor((i - 12) / 4); // Each mentor has 4 students from batch 2
    const mentorId = `mentor${mentorIndex + 1}`;
    const sessionsCompleted = Math.floor(Math.random() * 450);
    const totalSessions = 450;
    
    students.push({
      id: `student-${i+1}`,
      name: studentName,
      totalHours: 600,
      sessionDuration: 1.33, // ~1 hour 20 minutes
      totalSessions: totalSessions,
      startDate: "2024-01-30",
      endDate: "2024-05-30",
      sessionsCompleted: sessionsCompleted,
      sessionsRemaining: totalSessions - sessionsCompleted,
      progressPercentage: Math.floor((sessionsCompleted / totalSessions) * 100),
      mentorId: mentorId,
      batchId: "batch2"
    });
  }
  
  return students;
};

export const students = generateMockStudents();

// Dashboard statistics
export const generateDashboardStats = (
  filteredStudents = students
): DashboardStats => {
  const totalStudents = filteredStudents.length;
  const completedSessions = filteredStudents.reduce(
    (sum, student) => sum + student.sessionsCompleted,
    0
  );
  const totalSessions = filteredStudents.reduce(
    (sum, student) => sum + student.totalSessions,
    0
  );
  
  return {
    totalStudents,
    activeSessions: totalStudents,
    completedSessions,
    overallProgress: Math.floor((completedSessions / totalSessions) * 100),
    totalHours: filteredStudents.reduce((sum, student) => sum + student.totalHours, 0),
  };
};
