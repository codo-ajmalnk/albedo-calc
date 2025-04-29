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
    phone: "1234567890",
  },
  {
    id: "coord2",
    name: "Coordinator Two",
    email: "coordinator2@example.com",
    role: "coordinator",
    phone: "1234567890",
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
  return Array.from({ length: 5 }, (_, i) => {
    const totalSessions = 12;
    const sessionsCompleted = Math.floor(Math.random() * 13);
    const sessionsRemaining = totalSessions - sessionsCompleted;
    const progressPercentage = Math.round((sessionsCompleted / totalSessions) * 100);

    return {
      id: `student${i + 1}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@example.com`,
      phone: `+91 98765${43210 + i}`,
      mentorId: `mentor${i % 3 + 1}`,
      status: "active" as const,
      totalSessions,
      sessionsCompleted,
      totalHours: 24,
      totalPayment: 12000,
      paidAmount: Math.floor(Math.random() * 12001),
      batchId: `batch${Math.floor(i / 2) + 1}`,
      sessionDuration: 1.33,
      startDate: "January 1, 2024",
      endDate: "June 30, 2024",
      sessionsRemaining,
      progressPercentage
    };
  });
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
  const totalHours = filteredStudents.reduce(
    (sum, student) => sum + student.totalHours,
    0
  );
  const completedHours = filteredStudents.reduce(
    (sum, student) => sum + student.sessionsCompleted * student.sessionDuration,
    0
  );
  const pendingHours = totalHours - completedHours;
  
  // Active hours are hours from sessions that are currently in progress
  const activeHours = filteredStudents.reduce(
    (sum, student) => {
      if (student.status === "active" && student.sessionsCompleted < student.totalSessions) {
        return sum + (student.totalHours / student.totalSessions); // Hours per active session
      }
      return sum;
    },
    0
  );

  const totalPayments = filteredStudents.reduce(
    (sum, student) => sum + student.totalPayment,
    0
  );
  const completedPayments = filteredStudents.reduce(
    (sum, student) => sum + student.paidAmount,
    0
  );
  const pendingPayments = totalPayments - completedPayments;
  
  // Active sessions are sessions that are currently in progress (not completed)
  const activeSessions = filteredStudents.reduce(
    (sum, student) => {
      if (student.status === "active" && student.sessionsCompleted < student.totalSessions) {
        return sum + 1; // Count one active session per active student
      }
      return sum;
    },
    0
  );

  const pendingSessions = totalSessions - completedSessions;
  
  return {
    totalStudents,
    activeSessions,
    completedSessions,
    totalSessions,
    pendingSessions,
    overallProgress: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    totalHours,
    completedHours,
    pendingHours,
    activeHours,
    totalPayments,
    completedPayments,
    pendingPayments,
  };
};
