import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { users, students, generateDashboardStats } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSearch, Eye, Users } from "lucide-react";
import { ViewToggle } from "@/components/ViewToggle";
import { ListCard } from "@/components/ListCard";

const CoordinatorMentors = () => {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Get mentors under this coordinator
  const myMentors = users.filter(
    (user) => user.role === "mentor" && user.supervisorId === currentUser.id
  );

  // Filter mentors based on search
  const filteredMentors = myMentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(search.toLowerCase())
  );

  const getMentorStats = (mentorId: string) => {
    const mentorStudents = students.filter(student => student.mentorId === mentorId);

    const totalSessions = mentorStudents.reduce(
      (sum, student) => sum + student.totalSessions, 0
    );
    const completedSessions = mentorStudents.reduce(
      (sum, student) => sum + student.sessionsCompleted, 0
    );
    const totalHours = mentorStudents.reduce(
      (sum, student) => sum + student.totalHours, 0
    );
    const completedHours = mentorStudents.reduce(
      (sum, student) => sum + (student.totalHours * (student.sessionsCompleted / student.totalSessions)), 0
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

  return (
    <DashboardLayout>
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-lg sm:text-xl font-bold">My Mentors</h1>
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle>Search Mentors</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline">
                <UserSearch className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {view === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMentors.map((mentor) => {
              const stats = getMentorStats(mentor.id);
              
              return (
                <Card key={mentor.id} className="flex flex-col">
                  <CardHeader className="p-3 sm:p-4 md:p-6">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{mentor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{mentor.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">ID: <span className="font-medium">{mentor.id}</span></p>
                        <p className="text-sm text-muted-foreground">
                          {mentor.phone || "No phone number"}
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
                            <p className="text-xl font-bold">{stats.studentCount}</p>
                            <p className="text-sm text-muted-foreground">total</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Active Students</p>
                          <p className="text-base font-medium">{stats.activeStudents}</p>
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
                              className={`h-2 rounded-full transition-all duration-300 ${stats.sessionProgress === 100
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
                              className={`h-2 rounded-full transition-all duration-300 ${stats.hoursProgress === 100
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
                              className={`h-2 rounded-full transition-all duration-300 ${stats.paymentsProgress === 100
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
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          Students
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredMentors.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No mentors found matching your search.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMentors.map((mentor) => {
              const stats = getMentorStats(mentor.id);
              return (
                <ListCard
                  key={mentor.id}
                  id={mentor.id}
                  name={mentor.name}
                  email={mentor.email}
                  phone={mentor.phone}
                  stats={{
                    studentCount: stats.studentCount,
                    activeStudents: stats.activeStudents,
                    sessionProgress: stats.sessionProgress,
                    completedSessions: stats.completedSessions,
                    totalSessions: stats.totalSessions,
                    hoursProgress: stats.hoursProgress,
                    completedHours: stats.completedHours,
                    totalHours: stats.totalHours,
                    paymentsProgress: stats.paymentsProgress,
                    completedPayments: stats.completedPayments,
                    totalPayments: stats.totalPayments
                  }}
                  onViewDetails={() => {/* View details action */}}
                  onViewStudents={() => {/* View students action */}}
                  onEditProfile={() => {/* Edit profile action */}}
                  onDelete={() => {/* Delete action */}}
                />
              );
            })}
            {filteredMentors.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No mentors found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoordinatorMentors;
