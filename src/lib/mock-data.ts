import { DashboardStats, Role, Student, User, Coordinator } from "./types";

// Mock users with strict typing
export const users: User[] = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin" as const,
    phone: "+91 98765 43210",
    status: "active" as const
  },
  {
    id: "coord1",
    name: "John Coordinator",
    email: "john@example.com",
    role: "coordinator" as const,
    phone: "+91 98765 43211",
    status: "active" as const
  },
  {
    id: "coord2",
    name: "Jane Coordinator",
    email: "jane@example.com",
    role: "coordinator" as const,
    phone: "+91 98765 43212",
    status: "active" as const
  },
  {
    id: "mentor1",
    name: "Mike Mentor",
    email: "mike@example.com",
    role: "mentor" as const,
    supervisorId: "coord1",
    phone: "+91 98765 43213",
    status: "active" as const
  },
  {
    id: "mentor2",
    name: "Mary Mentor",
    email: "mary@example.com",
    role: "mentor" as const,
    supervisorId: "coord1",
    phone: "+91 98765 43214",
    status: "active" as const
  },
  {
    id: "mentor3",
    name: "Mark Mentor",
    email: "mark@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43215",
    status: "active" as const
  },
  {
    id: "mentor4",
    name: "Mentor Four",
    email: "mentor4@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43216",
    status: "active" as const
  },
  {
    id: "mentor5",
    name: "Mentor Five",
    email: "mentor5@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43217",
    status: "active" as const
  },
  {
    id: "mentor6",
    name: "Mentor Six",
    email: "mentor6@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43218",
    status: "active" as const
  },
  {
    id: "mentor7",
    name: "Mentor Seven",
    email: "mentor7@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43217",
    status: "active" as const
  },
  {
    id: "mentor8",
    name: "Mentor Eight",
    email: "mentor8@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43218",
    status: "active" as const
  },
  {
    id: "mentor9",
    name: "Mentor Nine",
    email: "mentor9@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43217",
    status: "active" as const
  },
  {
    id: "mentor10",
    name: "Mentor Ten",
    email: "mentor10@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43218",
    status: "active" as const
  },
  {
    id: "mentor11",
    name: "Mentor Eleven",
    email: "mentor11@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43217",
    status: "active" as const
  },
  {
    id: "mentor12",
    name: "Mentor Twelve",
    email: "mentor12@example.com",
    role: "mentor" as const,
    supervisorId: "coord2",
    phone: "+91 98765 43218",
    status: "active" as const
  },
  {
    id: "teacher1",
    name: "Teacher Henry",
    email: "teacher1@example.com",
    role: "teacher" as const,
    phone: "+91 98765 43219",
    status: "active" as const
  },
  {
    id: "teacher2",
    name: "Teacher John",
    email: "teacher2@example.com",
    role: "teacher" as const,
    phone: "+91 98765 43220",
    status: "active" as const
  },
  {
    id: "teacher3",
    name: "Teacher Mark",
    email: "teacher3@example.com",
    role: "teacher" as const,
    phone: "+91 98765 43221",
    status: "active" as const
  },
  {
    id: "teacher4",
    name: "Teacher Mary",
    email: "teacher4@example.com",
    role: "teacher" as const,
    phone: "+91 98765 43222",
    status: "active" as const
  },
  {
    id: "teacher5",
    name: "Teacher John",
    email: "teacher5@example.com",
    role: "teacher" as const,
    phone: "+91 98765 43220",
    status: "active" as const
  },
  {
    id: "teacher6",
    name: "Teacher Mark",
    email: "teacher6@example.com",
    role: "teacher" as const,
    phone: "+91 98765 43221",
    status: "active" as const
  },
  {
    id: "teacher7",
    name: "Teacher Mary",
    email: "teacher7@example.com",
    role: "teacher" as const,
    phone: "+91 98765 43222",
    status: "active" as const
  },
];

export const packages = Array.from({ length: 6 }, (_, i) => {
  const totalSessions = Math.floor(Math.random() * 100);
  const completedSessions = Math.floor(Math.random() * (totalSessions + 1));
  return {
    id: `package${i + 1}`,
    name: `Package ${i + 1}`,
    teacherId: `teacher${Math.floor(Math.random() * 10) + 1}`,
    price: Math.floor(Math.random() * 10000),
    totalSessions,
    completedSessions,
    hours: Math.floor(Math.random() * 100),
    durationDays: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 101), // 0 to 100 inclusive
    completedHours: Math.floor(Math.random() * 100),
    paidAmount: Math.floor(Math.random() * 10000),
    sessionDuration: Math.floor(Math.random() * 100),
  };
});

// Generate mock students with strict typing
export const generateMockStudents = (): Student[] => {
  return Array.from({ length: 6 }, (_, i) => {
    const totalSessions = 12;
    const sessionsCompleted = Math.floor(Math.random() * 13);
    const upcomingSessions = Math.floor(Math.random() * 13);
    const meetingSessions = Math.floor(Math.random() * 13);
    const sessionsRemaining = totalSessions - sessionsCompleted;
    const progressPercentage = Math.round((sessionsCompleted / totalSessions) * 100);
    const totalHours = 24;
    const sessionDuration = 1.5;
    const totalPayment = 12000;
    const paidAmount = Math.floor(Math.random() * 12001);
    const teachersPayment = Math.floor(paidAmount * 0.7);
    const hourlyPayment = Math.floor(teachersPayment / totalHours);
    
    // Calculate additional stats
    const completedHours = sessionsCompleted * sessionDuration;
    const pendingHours = totalHours - completedHours;
    const activeHours = sessionsRemaining * sessionDuration;
    const activeSessions = sessionsRemaining;
    const totalPayments = totalPayment;
    const completedPayments = paidAmount;
    const pendingPayments = totalPayment - paidAmount;
    const refundedPayments = Math.floor(Math.random() * 1001);
    // Calculate expense-related properties
    const expenseRatio = Math.random() * 0.3 + 0.1; // 10-40%
    const classTakeAmount = Math.floor(totalPayment * expenseRatio);
    const teacherSalary = Math.floor(teachersPayment * 0.8);

    return {
      id: `student${i + 1}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@example.com`,
      phone: `+91 98765${43210 + i}`,
      mentorId: `mentor${i % 3 + 1}`,
      teacherId: `teacher${i % 4 + 1}`,
      packageId: `package${i % 6 + 1}`,
      status: "active" as const,
      totalSessions,
      sessionsCompleted,
      upcomingSessions,
      meetingSessions,
      totalHours,
      totalPayment,
      paidAmount,
      teachersPayment,
      expenseRatio,
      classTakeAmount,
      teacherSalary,
      hourlyPayment,
      sessionDuration,
      startDate: "January 1, 2024",
      endDate: "June 30, 2024",
      sessionAddedOn: "January 1, 2024",
      sessionsRemaining,
      progressPercentage,
      // Additional stats
      completedHours,
      pendingHours,
      activeHours,
      activeSessions,
      totalPayments,
      completedPayments,
      pendingPayments,
      refundedPayments
    } satisfies Student;
  });
};

export const students = generateMockStudents();

// Dashboard statistics with strict typing
export const generateDashboardStats = (
  filteredStudents = students
): DashboardStats => {
  const totalStudents = filteredStudents.length;
  const completedSessions = filteredStudents.reduce(
    (sum, student) => sum + student.sessionsCompleted,
    0
  );
  const upcomingSessions = filteredStudents.reduce(
    (sum, student) => sum + student.upcomingSessions,
    0
  );
  const meetingSessions = filteredStudents.reduce(
    (sum, student) => sum + student.meetingSessions,
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
  const refundedPayments = filteredStudents.reduce(
    (sum, student) => sum + student.refundedPayments,
    0
  );
  
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
    upcomingSessions,
    meetingSessions,
    pendingSessions,
    overallProgress: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    totalHours,
    completedHours,
    pendingHours,
    activeHours,
    totalPayments,
    completedPayments,
    pendingPayments,
    refundedPayments
  } satisfies DashboardStats;
};
