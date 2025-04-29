
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/lib/types";
import { User as UserIcon, Eye, Edit, Plus } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";

const AdminMentors = () => {
  const [search, setSearch] = useState("");
  const [coordinatorFilter, setCoordinatorFilter] = useState("all");
  
  const mentors = users.filter((user) => user.role === "mentor");
  const coordinators = users.filter((user) => user.role === "coordinator");
  
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name.toLowerCase().includes(search.toLowerCase());
    const matchesCoordinator = coordinatorFilter === "all" || mentor.supervisorId === coordinatorFilter;
    return matchesSearch && matchesCoordinator;
  });

  // Get coordinator name by ID
  const getCoordinatorName = (coordinatorId: string) => {
    const coordinator = users.find((user) => user.id === coordinatorId);
    return coordinator ? coordinator.name : "Unassigned";
  };
  
  // Mock progress data (would come from actual session data in real app)
  const getMentorProgress = (mentorId: string) => {
    // This would be calculated from actual student data in a real application
    return Math.floor(Math.random() * 100);
  };

  const handleViewStudents = (mentorId: string) => {
    // In a real app, this would navigate to a mentor's students page
    console.log("Viewing students for mentor:", mentorId);
  };

  const handleEditProfile = (mentorId: string) => {
    // In a real app, this would navigate to a mentor edit page
    console.log("Editing mentor profile:", mentorId);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Mentors Management</h1>
          
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add New Mentor
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Filter Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search by Name</label>
                <Input
                  placeholder="Search mentors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Filter by Coordinator</label>
                <Select
                  value={coordinatorFilter}
                  onValueChange={setCoordinatorFilter}
                >
                  <SelectTrigger>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => {
            const progress = getMentorProgress(mentor.id);
            
            return (
              <Card key={mentor.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    {mentor.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="truncate max-w-[200px]">{mentor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coordinator:</span>
                      <span>{getCoordinatorName(mentor.supervisorId || "")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span>6</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hours:</span>
                      <span>600</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessions:</span>
                      <span>450</span>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Progress:</label>
                      <ProgressBar progress={progress} />
                      <div className="flex justify-end text-sm mt-1">{progress}%</div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleViewStudents(mentor.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Students
                      </Button>
                      <Button 
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleEditProfile(mentor.id)}
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
          
          {filteredMentors.length === 0 && (
            <div className="col-span-full text-center p-8">
              <p className="text-muted-foreground">
                No mentors found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMentors;
