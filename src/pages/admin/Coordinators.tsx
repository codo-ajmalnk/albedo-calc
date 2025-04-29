import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users, students, generateDashboardStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/types";
import { UserSearch, Eye, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminCoordinators = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCoordinator, setSelectedCoordinator] = useState<{
    user: User;
    stats: ReturnType<typeof getCoordinatorStats>;
  } | null>(null);
  const [isAddingCoordinator, setIsAddingCoordinator] = useState(false);
  const [newCoordinator, setNewCoordinator] = useState({
    id: `coord${users.filter(u => u.role === "coordinator").length + 1}`,
    name: "",
    email: "",
    phone: "",
    password: "",
  });
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

  const handleViewDetails = (coordinator: User) => {
    const stats = getCoordinatorStats(coordinator.id);
    setSelectedCoordinator({ user: coordinator, stats });
  };

  const handleEditProfile = (coordinatorId: string) => {
    // In a real app, this would navigate to a coordinator edit page
    console.log("Editing coordinator profile:", coordinatorId);
    // navigate(`/admin/coordinators/edit/${coordinatorId}`);
  };

  const handleAddCoordinator = () => {
    // Here you would typically make an API call to create the coordinator
    const newUser: User = {
      id: newCoordinator.id,
      name: newCoordinator.name,
      email: newCoordinator.email,
      role: "coordinator",
      phone: newCoordinator.phone,
    };

    setCoordinators([...coordinators, newUser]);
    setIsAddingCoordinator(false);
    setNewCoordinator({
      id: `coord${users.filter(u => u.role === "coordinator").length + 2}`,
      name: "",
      email: "",
      phone: "",
      password: "",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Coordinators Management</h1>
          
          <Button 
            className="w-full sm:w-auto"
            onClick={() => setIsAddingCoordinator(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
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
                      <p className="text-sm text-muted-foreground">{coordinator.email}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-sm">ID: <span className="font-medium">{coordinator.id}</span></p>
                      <p className="text-sm text-muted-foreground">
                        {coordinator.phone ? `Phone: ${coordinator.phone}` : 'No phone number'}
                      </p>
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
                        onClick={() => handleViewDetails(coordinator)}
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

        <Dialog open={isAddingCoordinator} onOpenChange={setIsAddingCoordinator}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Coordinator</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new coordinator account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="coordinator-id">Coordinator ID</Label>
                <Input
                  id="coordinator-id"
                  value={newCoordinator.id}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, id: e.target.value })}
                  placeholder="coord4"
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newCoordinator.name}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCoordinator.email}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
                  placeholder="coordinator@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newCoordinator.phone}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newCoordinator.password}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingCoordinator(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCoordinator}>Create Coordinator</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedCoordinator} onOpenChange={() => setSelectedCoordinator(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl font-bold">
                    {selectedCoordinator?.user.name}
                  </DialogTitle>
                  <DialogDescription className="mt-1.5">
                    {selectedCoordinator?.user.email}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedCoordinator && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="text-2xl font-bold mt-1">{selectedCoordinator.stats.mentorCount}</p>
                    <p className="text-sm text-muted-foreground">mentors</p>
                  </div>
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold mt-1">{selectedCoordinator.stats.studentCount}</p>
                    <p className="text-sm text-muted-foreground">students</p>
                  </div>
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Students</p>
                    <p className="text-2xl font-bold mt-1">{selectedCoordinator.stats.activeStudents}</p>
                    <p className="text-sm text-muted-foreground">active</p>
                  </div>
                  <div className="p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold mt-1">{selectedCoordinator.stats.overallProgress}%</p>
                    <p className="text-sm text-muted-foreground">completed</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Sessions & Hours</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Sessions</span>
                        <span className="font-medium">{selectedCoordinator.stats.totalSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed Sessions</span>
                        <span className="font-medium">{selectedCoordinator.stats.completedSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Hours</span>
                        <span className="font-medium">{selectedCoordinator.stats.totalHours}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed Hours</span>
                        <span className="font-medium">{selectedCoordinator.stats.completedHours}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Payments</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Payments</span>
                        <span className="font-medium">₹{selectedCoordinator.stats.totalPayments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed Payments</span>
                        <span className="font-medium">₹{selectedCoordinator.stats.completedPayments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending Payments</span>
                        <span className="font-medium">₹{selectedCoordinator.stats.pendingPayments.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Progress Overview</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Sessions Progress</span>
                          <span>{selectedCoordinator.stats.sessionProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedCoordinator.stats.sessionProgress}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Hours Progress</span>
                          <span>{selectedCoordinator.stats.hoursProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedCoordinator.stats.hoursProgress}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Payments Progress</span>
                          <span>{selectedCoordinator.stats.paymentsProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedCoordinator.stats.paymentsProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminCoordinators;
