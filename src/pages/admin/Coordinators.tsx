
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users } from "@/lib/mock-data";
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

  // Count mentors under each coordinator
  const getMentorCount = (coordinatorId: string) => {
    return users.filter(
      (user) => user.role === "mentor" && user.supervisorId === coordinatorId
    ).length;
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Coordinators Management</h1>
          
          <Button className="w-full sm:w-auto">
            Add New Coordinator
          </Button>
        </div>
        
        <Card>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoordinators.map((coordinator) => (
            <Card key={coordinator.id}>
              <CardHeader>
                <CardTitle>{coordinator.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="truncate max-w-[200px]">{coordinator.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mentors Supervised:</span>
                    <span>{getMentorCount(coordinator.id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Workload:</span>
                    <span>1800 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Sessions:</span>
                    <span>1350 sessions</span>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
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
          ))}
          
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
