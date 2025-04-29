import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users, students, generateDashboardStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/types";
import { UserSearch, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCoordinators = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [coordinators, setCoordinators] = useState(
    users.filter((user) => user.role === "coordinator")
  );

  const filteredCoordinators = coordinators.filter((coordinator) =>
    coordinator.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get coordinator performance data
  const getCoordinatorStats = (coordinatorId: string) => {
    const mentors = users.filter(
      (user) => user.role === "mentor" && user.supervisorId === coordinatorId
    );

    const mentorIds = mentors.map(mentor => mentor.id);
    const coordinatorStudents = students.filter(
      student => mentorIds.includes(student.mentorId)
    );

    const totalSessions = coordinatorStudents.reduce(
      (sum, student) => sum + student.totalSessions,
      0
    );
    const completedSessions = coordinatorStudents.reduce(
      (sum, student) => sum + student.sessionsCompleted,
      0
    );
    const totalHours = coordinatorStudents.reduce(
      (sum, student) => sum + student.totalHours,
      0
    );
    const completedHours = coordinatorStudents.reduce(
      (sum, student) => sum + (student.totalHours * (student.sessionsCompleted / student.totalSessions)),
      0
    );

    const stats = generateDashboardStats(coordinatorStudents);

    return {
      mentorCount: mentors.length,
      studentCount: coordinatorStudents.length,
      totalSessions,
      completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      sessionProgress: totalSessions > 0 ? Math.floor((completedSessions / totalSessions) * 100) : 0,
      hoursProgress: totalHours > 0 ? Math.floor((completedHours / totalHours) * 100) : 0,
      overallProgress: stats.overallProgress,
      activeStudents: coordinatorStudents.filter(s => s.status === 'active').length,
      completedPayments: stats.completedPayments,
      pendingPayments: stats.pendingPayments,
      totalPayments: stats.totalPayments,
      paymentsProgress: stats.totalPayments > 0 ? Math.floor((stats.completedPayments / stats.totalPayments) * 100) : 0,
    };
  };

  const handleViewDetails = (coordinatorId: string) => {
    // In a real app, this would navigate to a coordinator detail page
    console.log("Viewing coordinator details:", coordinatorId);
    // navigate(`/admin/coordinators/${coordinatorId}`);
  };

  const handleEditProfile = (coordinatorId: string) => {
    // In a real app, this would navigate to a coordinator edit page
    console.log("Editing coordinator profile:", coordinatorId);
    // navigate(`/admin/coordinators/edit/${coordinatorId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Coordinators Management</h1>

          <Button className="w-full sm:w-auto">
            Add New Coordinator
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Search Coordinators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-sm"
              />
              <Button variant="outline" className="w-full sm:w-auto">
                <UserSearch className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredCoordinators.map((coordinator) => {
            const stats = getCoordinatorStats(coordinator.id);
            return (
              <Card key={coordinator.id} className="flex flex-col">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg sm:text-xl">{coordinator.name}</CardTitle>
                      <p className="text-sm text-muted-foreground break-all">{coordinator.email}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium">ID: {coordinator.id}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 sm:p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Team Size</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl sm:text-2xl font-bold">{stats.mentorCount}</p>
                          <p className="text-sm text-muted-foreground">mentors</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Students</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl sm:text-2xl font-bold">{stats.studentCount}</p>
                          <p className="text-sm text-muted-foreground">total</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sessions Progress</span>
                          <span className="font-medium">{stats.sessionProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.sessionProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.completedSessions} completed</span>
                          <span>{stats.totalSessions} total</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Hours Progress</span>
                          <span className="font-medium">{stats.hoursProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.hoursProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats.completedHours} completed</span>
                          <span>{stats.totalHours} total</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Payments Progress</span>
                          <span className="font-medium">{stats.paymentsProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.paymentsProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>₹{stats.completedPayments.toLocaleString()} completed</span>
                          <span>₹{stats.totalPayments.toLocaleString()} total</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Progress</span>
                          <span className="font-medium">{stats.overallProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.overallProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Active Students</p>
                        <p className="text-lg font-medium mt-1">{stats.activeStudents}</p>
                      </div>
                      <div className="p-3 bg-muted/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pending Payments</p>
                        <p className="text-lg font-medium mt-1">₹{stats.pendingPayments.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleViewDetails(coordinator.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleEditProfile(coordinator.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredCoordinators.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No coordinators found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCoordinators;
