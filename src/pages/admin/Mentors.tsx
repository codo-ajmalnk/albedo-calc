import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users, students, generateDashboardStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/lib/types";
import { UserSearch, Eye, Edit, Plus, Trash2, Users } from "lucide-react";
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

const AdminMentors = () => {
  const [search, setSearch] = useState("");
  const [coordinatorFilter, setCoordinatorFilter] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<{
    user: User;
    stats: ReturnType<typeof getMentorStats>;
  } | null>(null);
  const [isAddingMentor, setIsAddingMentor] = useState(false);
  const [isEditingMentor, setIsEditingMentor] = useState(false);
  const [isDeletingMentor, setIsDeletingMentor] = useState(false);
  const [isViewingStudents, setIsViewingStudents] = useState(false);
  const [mentors, setMentors] = useState(users.filter((user) => user.role === "mentor"));
  const [newMentor, setNewMentor] = useState({
    id: `mentor${users.filter(u => u.role === "mentor").length + 1}`,
    name: "",
    email: "",
    phone: "",
    password: "",
    supervisorId: "",
  });
  const [editingMentor, setEditingMentor] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    supervisorId: string;
  } | null>(null);

  const coordinators = users.filter((user) => user.role === "coordinator");

  const getMentorStats = (mentorId: string) => {
    const mentorStudents = students.filter(student => student.mentorId === mentorId);
    
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
    const completedHours = mentorStudents.reduce(
      (sum, student) => sum + (student.totalHours * (student.sessionsCompleted / student.totalSessions)),
      0
    );

    const stats = generateDashboardStats(mentorStudents);

    return {
      studentCount: mentorStudents.length,
      totalSessions,
      completedSessions,
      totalHours,
      completedHours: Math.round(completedHours),
      sessionProgress: totalSessions > 0 ? Math.floor((completedSessions / totalSessions) * 100) : 0,
      hoursProgress: totalHours > 0 ? Math.floor((completedHours / totalHours) * 100) : 0,
      overallProgress: stats.overallProgress,
      activeStudents: mentorStudents.filter(s => s.status === 'active').length,
      completedPayments: stats.completedPayments,
      pendingPayments: stats.pendingPayments,
      totalPayments: stats.totalPayments,
      paymentsProgress: stats.totalPayments > 0 ? Math.floor((stats.completedPayments / stats.totalPayments) * 100) : 0,
    };
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name.toLowerCase().includes(search.toLowerCase());
    const matchesCoordinator = coordinatorFilter === "all" || mentor.supervisorId === coordinatorFilter;
    return matchesSearch && matchesCoordinator;
  });

  const getCoordinatorName = (coordinatorId: string) => {
    const coordinator = users.find((user) => user.id === coordinatorId);
    return coordinator ? coordinator.name : "Unassigned";
  };

  const handleViewDetails = (mentor: User) => {
    const stats = getMentorStats(mentor.id);
    setSelectedMentor({ user: mentor, stats });
  };

  const handleViewStudents = (mentor: User) => {
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setIsViewingStudents(true);
  };

  const handleEditProfile = (mentor: User) => {
    setEditingMentor({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone || "",
      password: "",
      supervisorId: mentor.supervisorId || "",
    });
    setIsEditingMentor(true);
  };

  const handleDeleteMentor = (mentor: User) => {
    setSelectedMentor({ user: mentor, stats: getMentorStats(mentor.id) });
    setIsDeletingMentor(true);
  };

  const confirmDeleteMentor = () => {
    if (!selectedMentor) return;
    
    const updatedMentors = mentors.filter(
      (m) => m.id !== selectedMentor.user.id
    );
    setMentors(updatedMentors);
    setIsDeletingMentor(false);
    setSelectedMentor(null);
  };

  const handleAddMentor = () => {
    const newUser: User = {
      id: newMentor.id,
      name: newMentor.name,
      email: newMentor.email,
      role: "mentor",
      phone: newMentor.phone,
      supervisorId: newMentor.supervisorId,
    };

    setMentors([...mentors, newUser]);
    setIsAddingMentor(false);
    setNewMentor({
      id: `mentor${users.filter(u => u.role === "mentor").length + 2}`,
      name: "",
      email: "",
      phone: "",
      password: "",
      supervisorId: "",
    });
  };

  const handleUpdateMentor = () => {
    if (!editingMentor) return;

    const updatedMentors = mentors.map((mentor) =>
      mentor.id === editingMentor.id
        ? {
            ...mentor,
            name: editingMentor.name,
            email: editingMentor.email,
            phone: editingMentor.phone,
            supervisorId: editingMentor.supervisorId,
          }
        : mentor
    );

    setMentors(updatedMentors);
    setIsEditingMentor(false);
    setEditingMentor(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Mentors Management</h1>

          <Button
            className="w-full sm:w-auto text-sm"
            onClick={() => setIsAddingMentor(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add New Mentor
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Filter Mentors</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Search by Name</Label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search mentors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm"
                  />
                  <Button variant="outline" className="shrink-0 text-sm">
                    <UserSearch className="mr-1.5 h-3.5 w-3.5" />
                    Search
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter by Coordinator</Label>
                <Select
                  value={coordinatorFilter}
                  onValueChange={setCoordinatorFilter}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coordinators</SelectItem>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {filteredMentors.map((mentor) => {
            const stats = getMentorStats(mentor.id);
            return (
              <Card key={mentor.id} className="flex flex-col">
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base sm:text-lg">{mentor.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">{mentor.email}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-xs sm:text-sm">ID: <span className="font-medium">{mentor.id}</span></p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {mentor.phone ? `Phone: ${mentor.phone}` : 'No phone number'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Students</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xl sm:text-2xl font-bold">{stats.studentCount}</p>
                          <p className="text-sm text-muted-foreground">total</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coordinator</p>
                        <p className="text-base font-medium truncate">
                          {getCoordinatorName(mentor.supervisorId || "")}
                        </p>
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
                          <span>Payment Progress</span>
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

                    <div className="grid grid-cols-2 gap-4">
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
                        onClick={() => handleViewDetails(mentor)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleViewStudents(mentor)}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        Students
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleEditProfile(mentor)}
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        onClick={() => handleDeleteMentor(mentor)}
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

          {filteredMentors.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No mentors found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog 
        open={!!selectedMentor && !isViewingStudents && !isDeletingMentor} 
        onOpenChange={(open) => {
          if (!open) setSelectedMentor(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold">
                  {selectedMentor?.user.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5">
                  {selectedMentor?.user.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedMentor && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold mt-1">{selectedMentor.stats.studentCount}</p>
                  <p className="text-sm text-muted-foreground">students</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold mt-1">{selectedMentor.stats.activeStudents}</p>
                  <p className="text-sm text-muted-foreground">active</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Coordinator</p>
                  <p className="text-2xl font-bold mt-1 truncate">{getCoordinatorName(selectedMentor.user.supervisorId || "")}</p>
                  <p className="text-sm text-muted-foreground">assigned to</p>
                </div>
                <div className="p-4 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold mt-1">{selectedMentor.stats.overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">completed</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Sessions & Hours</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <span className="font-medium">{selectedMentor.stats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Sessions</span>
                      <span className="font-medium">{selectedMentor.stats.completedSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Hours</span>
                      <span className="font-medium">{selectedMentor.stats.totalHours}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Hours</span>
                      <span className="font-medium">{selectedMentor.stats.completedHours}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Payments</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Payments</span>
                      <span className="font-medium">₹{selectedMentor.stats.totalPayments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Payments</span>
                      <span className="font-medium">₹{selectedMentor.stats.completedPayments.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Payments</span>
                      <span className="font-medium">₹{selectedMentor.stats.pendingPayments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Progress Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Sessions Progress</span>
                        <span>{selectedMentor.stats.sessionProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.sessionProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.sessionProgress >= 75
                              ? 'bg-progress-high'
                              : selectedMentor.stats.sessionProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                          }`}
                          style={{ width: `${selectedMentor.stats.sessionProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Hours Progress</span>
                        <span>{selectedMentor.stats.hoursProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.hoursProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.hoursProgress >= 75
                              ? 'bg-progress-high'
                              : selectedMentor.stats.hoursProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                          }`}
                          style={{ width: `${selectedMentor.stats.hoursProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Payment Progress</span>
                        <span>{selectedMentor.stats.paymentsProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.paymentsProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.paymentsProgress >= 75
                              ? 'bg-progress-high'
                              : selectedMentor.stats.paymentsProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                          }`}
                          style={{ width: `${selectedMentor.stats.paymentsProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{selectedMentor.stats.overallProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedMentor.stats.overallProgress === 100
                              ? 'bg-progress-complete'
                              : selectedMentor.stats.overallProgress >= 75
                              ? 'bg-progress-high'
                              : selectedMentor.stats.overallProgress >= 40
                              ? 'bg-progress-medium'
                              : 'bg-progress-low'
                          }`}
                          style={{ width: `${selectedMentor.stats.overallProgress}%` }}
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

      {/* Add Mentor Dialog */}
      <Dialog open={isAddingMentor} onOpenChange={setIsAddingMentor}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Mentor</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new mentor account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mentor-id">Mentor ID</Label>
              <Input
                id="mentor-id"
                value={newMentor.id}
                onChange={(e) => setNewMentor({ ...newMentor, id: e.target.value })}
                placeholder="mentor4"
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newMentor.name}
                onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newMentor.email}
                onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                placeholder="mentor@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={newMentor.phone}
                onChange={(e) => setNewMentor({ ...newMentor, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coordinator">Coordinator</Label>
              <Select
                value={newMentor.supervisorId}
                onValueChange={(value) => setNewMentor({ ...newMentor, supervisorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Coordinator" />
                </SelectTrigger>
                <SelectContent>
                  {coordinators.map((coordinator) => (
                    <SelectItem key={coordinator.id} value={coordinator.id}>
                      {coordinator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
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

      {/* Edit Mentor Dialog */}
      <Dialog open={isEditingMentor} onOpenChange={setIsEditingMentor}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Mentor</DialogTitle>
            <DialogDescription>
              Update the mentor's information.
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
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingMentor.name}
                  onChange={(e) => setEditingMentor({
                    ...editingMentor,
                    name: e.target.value
                  })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
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
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
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
                <Label htmlFor="edit-coordinator">Coordinator</Label>
                <Select
                  value={editingMentor.supervisorId}
                  onValueChange={(value) => setEditingMentor({
                    ...editingMentor,
                    supervisorId: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Coordinator" />
                  </SelectTrigger>
                  <SelectContent>
                    {coordinators.map((coordinator) => (
                      <SelectItem key={coordinator.id} value={coordinator.id}>
                        {coordinator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeletingMentor} onOpenChange={setIsDeletingMentor}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMentor?.user.name}'s profile and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeletingMentor(false);
              setSelectedMentor(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMentor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Students Dialog */}
      <Dialog 
        open={isViewingStudents} 
        onOpenChange={(open) => {
          setIsViewingStudents(open);
          if (!open) {
            setSelectedMentor(null);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base sm:text-lg font-semibold">Students Under {selectedMentor?.user.name}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              View all students assigned to this mentor.
            </DialogDescription>
          </DialogHeader>

          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] font-medium">ID</TableHead>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMentor &&
                  students.filter(student => student.mentorId === selectedMentor.user.id).map((student) => {
                    const progress = Math.round((student.sessionsCompleted / student.totalSessions) * 100);
                    return (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
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
    </DashboardLayout>
  );
};

export default AdminMentors;
