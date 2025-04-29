
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { users } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/types";
import { UserSearch } from "lucide-react";

const AdminCoordinators = () => {
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
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Coordinators Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Search Coordinators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline">
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
                    <span>{coordinator.email}</span>
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
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Edit Profile</Button>
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
