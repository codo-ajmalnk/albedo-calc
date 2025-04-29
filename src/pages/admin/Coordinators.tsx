import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users, students, generateDashboardStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/types";
import { UserSearch, Eye, Edit, Plus, Trash2, Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminCoordinators = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCoordinator, setSelectedCoordinator] = useState<{
    user: User;
    stats: ReturnType<typeof getCoordinatorStats>;
  } | null>(null);
  const [isAddingCoordinator, setIsAddingCoordinator] = useState(false);
  const [isEditingCoordinator, setIsEditingCoordinator] = useState(false);
  const [editingCoordinator, setEditingCoordinator] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  } | null>(null);
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
  const [isViewingMentors, setIsViewingMentors] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);
  const [isEditingMentor, setIsEditingMentor] = useState(false);
  const [isDeletingCoordinator, setIsDeletingCoordinator] = useState(false);
  const [newMentor, setNewMentor] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isDeletingMentor, setIsDeletingMentor] = useState(false);
  const [editingMentor, setEditingMentor] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  } | null>(null);
  const [isAssigningMentor, setIsAssigningMentor] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [isViewingStudents, setIsViewingStudents] = useState(false);
  
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

  const handleEditProfile = (coordinator: User) => {
    setEditingCoordinator({
      id: coordinator.id,
      name: coordinator.name,
      email: coordinator.email,
      phone: coordinator.phone || "",
      password: "", // Empty password field in edit mode
    });
    setIsEditingCoordinator(true);
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

  const handleUpdateCoordinator = () => {
    if (!editingCoordinator) return;

    // Here you would typically make an API call to update the coordinator
    const updatedCoordinators = coordinators.map((coord) =>
      coord.id === editingCoordinator.id
        ? {
          ...coord,
          name: editingCoordinator.name,
          email: editingCoordinator.email,
          phone: editingCoordinator.phone,
        }
        : coord
    );

    setCoordinators(updatedCoordinators);
    setIsEditingCoordinator(false);
    setEditingCoordinator(null);
  };

  const handleViewMentors = (coordinator: User) => {
    // Only set what's needed for mentor management
    setSelectedCoordinator({ user: coordinator, stats: getCoordinatorStats(coordinator.id) });
    setIsViewingMentors(true);
  };

  const handleDeleteCoordinator = (coordinator: User) => {
    // Only set what's needed for delete confirmation
    setSelectedCoordinator({ user: coordinator, stats: getCoordinatorStats(coordinator.id) });
    setIsDeletingCoordinator(true);
  };

  const confirmDeleteCoordinator = () => {
    if (!selectedCoordinator) return;

    const updatedCoordinators = coordinators.filter(
      (c) => c.id !== selectedCoordinator.user.id
    );
    setCoordinators(updatedCoordinators);
    setIsDeletingCoordinator(false);
    setSelectedCoordinator(null);
  };

  const getAssignedMentors = (coordinatorId: string) => {
    return users.filter(user => user.role === "mentor" && user.supervisorId === coordinatorId);
  };

  const handleAddMentor = () => {
    if (!selectedCoordinator) return;

    const mentorId = `mentor${users.filter(u => u.role === "mentor").length + 1}`;
    const newUser: User = {
      id: mentorId,
      name: newMentor.name,
      email: newMentor.email,
      role: "mentor",
      supervisorId: selectedCoordinator.user.id,
      phone: newMentor.phone,
    };

    // Here you would typically make an API call to create the mentor
    users.push(newUser);
    setIsAddingMentor(false);
    setNewMentor({
      id: "",
      name: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  const handleDeleteMentor = (mentor: User) => {
    setSelectedMentor(mentor);
    setIsDeletingMentor(true);
  };

  const confirmDeleteMentor = () => {
    if (!selectedMentor) return;

    // Here you would typically make an API call to delete the mentor
    const updatedUsers = users.filter(
      (u) => u.id !== selectedMentor.id
    );
    users.length = 0;
    users.push(...updatedUsers);
    setIsDeletingMentor(false);
    setSelectedMentor(null);
  };

  const handleEditMentor = (mentor: User) => {
    setEditingMentor({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone || "",
      password: "",
    });
    setIsEditingMentor(true);
  };

  const handleUpdateMentor = () => {
    if (!editingMentor) return;

    // Here you would typically make an API call to update the mentor
    const updatedUsers = users.map((user) =>
      user.id === editingMentor.id
        ? {
          ...user,
          name: editingMentor.name,
          email: editingMentor.email,
          phone: editingMentor.phone,
        }
        : user
    );
    users.length = 0;
    users.push(...updatedUsers);
    setIsEditingMentor(false);
    setEditingMentor(null);
  };

  const getUnassignedMentors = () => {
    return users.filter(user =>
      user.role === "mentor" &&
      (!user.supervisorId || user.supervisorId === "")
    );
  };

  const handleAssignMentor = () => {
    if (!selectedCoordinator || !selectedMentorId) return;

    // Here you would typically make an API call to assign the mentor
    const updatedUsers = users.map(user => {
      if (user.id === selectedMentorId) {
        return { ...user, supervisorId: selectedCoordinator.user.id };
      }
      return user;
    });
    users.length = 0;
    users.push(...updatedUsers);

    setIsAssigningMentor(false);
    setSelectedMentorId("");
  };

  const handleViewStudents = (coordinator: User) => {
    setSelectedCoordinator({ user: coordinator, stats: getCoordinatorStats(coordinator.id) });
    setIsViewingStudents(true);
  };

  const getCoordinatorStudents = (coordinatorId: string) => {
    const mentors = users.filter(
      user => user.role === "mentor" && user.supervisorId === coordinatorId
    );
    const mentorIds = mentors.map(mentor => mentor.id);
    return students.filter(student => mentorIds.includes(student.mentorId));
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Coordinators Management</h1>

          <Button
            className="w-full sm:w-auto text-sm"
            onClick={() => setIsAddingCoordinator(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add New Coordinator
          </Button>
        </div>
        
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Search Coordinators</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-sm text-sm"
              />
              <Button variant="outline" className="w-full sm:w-auto text-sm">
                <UserSearch className="mr-1.5 h-3.5 w-3.5" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredCoordinators.map((coordinator) => {
            const stats = getCoordinatorStats(coordinator.id);
            return (
              <Card key={coordinator.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">{coordinator.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">{coordinator.email}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm">ID: <span className="font-medium">{coordinator.id}</span></p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {coordinator.phone ? `Phone: ${coordinator.phone}` : 'No phone number'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
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
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.sessionProgress === 100
                                ? 'bg-progress-complete'
                                : stats.sessionProgress >= 75
                                ? 'bg-progress-high'
                                : stats.sessionProgress >= 40
                                ? 'bg-progress-medium'
                                : 'bg-progress-low'
                            }`}
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
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.hoursProgress === 100
                                ? 'bg-progress-complete'
                                : stats.hoursProgress >= 75
                                ? 'bg-progress-high'
                                : stats.hoursProgress >= 40
                                ? 'bg-progress-medium'
                                : 'bg-progress-low'
                            }`}
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
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.paymentsProgress === 100
                                ? 'bg-progress-complete'
                                : stats.paymentsProgress >= 75
                                ? 'bg-progress-high'
                                : stats.paymentsProgress >= 40
                                ? 'bg-progress-medium'
                                : 'bg-progress-low'
                            }`}
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
                        <div className="w-full bg-muted h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.overallProgress === 100
                                ? 'bg-progress-complete'
                                : stats.overallProgress >= 75
                                ? 'bg-progress-high'
                                : stats.overallProgress >= 40
                                ? 'bg-progress-medium'
                                : 'bg-progress-low'
                            }`}
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

                    <div className="grid grid-cols-3 xs:grid-cols-5 gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewDetails(coordinator)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewMentors(coordinator)}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        Mentors
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewStudents(coordinator)}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        Students
                      </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleEditProfile(coordinator)}
                    >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>
                    <Button 
                        variant="destructive"
                      size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleDeleteCoordinator(coordinator)}
                    >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
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
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold">Add New Coordinator</DialogTitle>
              <DialogDescription>
                Fill in the coordinator details below. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coordinator-id">Coordinator ID</Label>
                  <Input
                    id="coordinator-id"
                    value={newCoordinator.id}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newCoordinator.name}
                    onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })}
                    placeholder="Enter coordinator's full name"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCoordinator.email}
                    onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
                    placeholder="coordinator@example.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newCoordinator.phone}
                    onChange={(e) => setNewCoordinator({ ...newCoordinator, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newCoordinator.password}
                  onChange={(e) => setNewCoordinator({ ...newCoordinator, password: e.target.value })}
                  placeholder="Enter secure password"
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsAddingCoordinator(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleAddCoordinator} className="w-full sm:w-auto">
                Create Coordinator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!selectedCoordinator && !isViewingMentors && !isDeletingCoordinator}
          onOpenChange={(open) => {
            if (!open) setSelectedCoordinator(null);
          }}
        >
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
                            className={`h-2 rounded-full transition-all duration-300 ${
                              selectedCoordinator.stats.sessionProgress === 100
                                ? 'bg-progress-complete'
                                : selectedCoordinator.stats.sessionProgress >= 75
                                ? 'bg-progress-high'
                                : selectedCoordinator.stats.sessionProgress >= 40
                                ? 'bg-progress-medium'
                                : 'bg-progress-low'
                            }`}
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
                            className={`h-2 rounded-full transition-all duration-300 ${
                              selectedCoordinator.stats.hoursProgress === 100
                                ? 'bg-progress-complete'
                                : selectedCoordinator.stats.hoursProgress >= 75
                                ? 'bg-progress-high'
                                : selectedCoordinator.stats.hoursProgress >= 40
                                ? 'bg-progress-medium'
                                : 'bg-progress-low'
                            }`}
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
                            className={`h-2 rounded-full transition-all duration-300 ${
                              selectedCoordinator.stats.paymentsProgress === 100
                                ? 'bg-progress-complete'
                                : selectedCoordinator.stats.paymentsProgress >= 75
                                ? 'bg-progress-high'
                                : selectedCoordinator.stats.paymentsProgress >= 40
                                ? 'bg-progress-medium'
                                : 'bg-progress-low'
                            }`}
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

        <Dialog open={isEditingCoordinator} onOpenChange={setIsEditingCoordinator}>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold">Edit Coordinator</DialogTitle>
              <DialogDescription>
                Update the coordinator's information. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            {editingCoordinator && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-coordinator-id">Coordinator ID</Label>
                    <Input
                      id="edit-coordinator-id"
                      value={editingCoordinator.id}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={editingCoordinator.name}
                      onChange={(e) => setEditingCoordinator({
                        ...editingCoordinator,
                        name: e.target.value
                      })}
                      placeholder="Enter coordinator's full name"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingCoordinator.email}
                      onChange={(e) => setEditingCoordinator({
                        ...editingCoordinator,
                        email: e.target.value
                      })}
                      placeholder="coordinator@example.com"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number *</Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      value={editingCoordinator.phone}
                      onChange={(e) => setEditingCoordinator({
                        ...editingCoordinator,
                        phone: e.target.value
                      })}
                      placeholder="+91 98765 43210"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-password">New Password (optional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingCoordinator.password}
                    onChange={(e) => setEditingCoordinator({
                      ...editingCoordinator,
                      password: e.target.value
                    })}
                    placeholder="Leave blank to keep current password"
                    className="w-full"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => {
                setIsEditingCoordinator(false);
                setEditingCoordinator(null);
              }} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleUpdateCoordinator} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeletingCoordinator} onOpenChange={setIsDeletingCoordinator}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedCoordinator?.user.name}'s profile and remove all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeletingCoordinator(false);
                setSelectedCoordinator(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteCoordinator}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={isViewingMentors}
          onOpenChange={(open) => {
            setIsViewingMentors(open);
            if (!open) {
              setSelectedCoordinator(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assigned Mentors - {selectedCoordinator?.user.name}</DialogTitle>
              <DialogDescription>
                Manage mentors assigned to this coordinator.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-4 mb-4">
              <Button variant="outline" onClick={() => setIsAssigningMentor(true)}>
                <Users className="mr-2 h-4 w-4" />
                Assign Mentor
              </Button>
              <Button onClick={() => setIsAddingMentor(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Mentor
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCoordinator &&
                  getAssignedMentors(selectedCoordinator.user.id).map((mentor) => (
                    <TableRow key={mentor.id}>
                      <TableCell>{mentor.id}</TableCell>
                      <TableCell>{mentor.name}</TableCell>
                      <TableCell>{mentor.email}</TableCell>
                      <TableCell>{mentor.phone || "No phone number"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMentor(mentor);
                            setIsEditingMentor(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMentor(mentor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingMentor} onOpenChange={setIsAddingMentor}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Mentor</DialogTitle>
              <DialogDescription>
                Add a new mentor to {selectedCoordinator?.user.name}'s team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="mentor-name">Full Name</Label>
                <Input
                  id="mentor-name"
                  value={newMentor.name}
                  onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mentor-email">Email</Label>
                <Input
                  id="mentor-email"
                  type="email"
                  value={newMentor.email}
                  onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                  placeholder="mentor@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mentor-phone">Phone Number</Label>
                <Input
                  id="mentor-phone"
                  type="tel"
                  value={newMentor.phone}
                  onChange={(e) => setNewMentor({ ...newMentor, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mentor-password">Password</Label>
                <Input
                  id="mentor-password"
                  type="password"
                  value={newMentor.password}
                  onChange={(e) => setNewMentor({ ...newMentor, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingMentor(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMentor}>Create Mentor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeletingMentor} onOpenChange={setIsDeletingMentor}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {selectedMentor?.name}'s profile and remove all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteMentor}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isEditingMentor} onOpenChange={setIsEditingMentor}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Mentor</DialogTitle>
              <DialogDescription>
                Update mentor's information.
              </DialogDescription>
            </DialogHeader>
            {editingMentor && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-mentor-id">Mentor ID</Label>
                  <Input
                    id="edit-mentor-id"
                    value={editingMentor.id}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-mentor-name">Full Name</Label>
                  <Input
                    id="edit-mentor-name"
                    value={editingMentor.name}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      name: e.target.value
                    })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-mentor-email">Email</Label>
                  <Input
                    id="edit-mentor-email"
                    type="email"
                    value={editingMentor.email}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      email: e.target.value
                    })}
                    placeholder="mentor@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-mentor-phone">Phone Number</Label>
                  <Input
                    id="edit-mentor-phone"
                    type="tel"
                    value={editingMentor.phone}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      phone: e.target.value
                    })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-mentor-password">New Password (optional)</Label>
                  <Input
                    id="edit-mentor-password"
                    type="password"
                    value={editingMentor.password}
                    onChange={(e) => setEditingMentor({
                      ...editingMentor,
                      password: e.target.value
                    })}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingMentor(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMentor}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAssigningMentor} onOpenChange={setIsAssigningMentor}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Existing Mentor</DialogTitle>
              <DialogDescription>
                Select a mentor to assign to {selectedCoordinator?.user.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="mentor-select">Select Mentor</Label>
                <Select
                  value={selectedMentorId}
                  onValueChange={setSelectedMentorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnassignedMentors().map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name} ({mentor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAssigningMentor(false);
                setSelectedMentorId("");
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignMentor}
                disabled={!selectedMentorId}
              >
                Assign Mentor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog 
          open={isViewingStudents} 
          onOpenChange={(open) => {
            setIsViewingStudents(open);
            if (!open) {
              setSelectedCoordinator(null);
            }
          }}
        >
          <DialogContent className="max-w-[95vw] w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-base sm:text-lg font-semibold">Students Under {selectedCoordinator?.user.name}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                View all students managed by this coordinator's mentors.
              </DialogDescription>
            </DialogHeader>

            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px] font-medium">ID</TableHead>
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Mentor</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCoordinator &&
                    getCoordinatorStudents(selectedCoordinator.user.id).map((student) => {
                      const mentor = users.find(u => u.id === student.mentorId);
                      const progress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
                      return (
                        <TableRow key={student.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{student.id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{mentor?.name || 'Not Assigned'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              student.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {student.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    progress === 100
                                      ? 'bg-progress-complete'
                                      : progress >= 75
                                      ? 'bg-progress-high'
                                      : progress >= 40
                                      ? 'bg-progress-medium'
                                      : 'bg-progress-low'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm tabular-nums w-[3ch]">
                                {progress}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminCoordinators;
