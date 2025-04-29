
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Batch } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

// Mock batch data (would come from API in real app)
const batchesMockData: Batch[] = [
  {
    id: "batch1",
    name: "Batch 1",
    addedOn: "January 28, 2025",
    sessionStart: "January 29, 2025",
    sessionEnd: "May 29, 2025",
    studentCount: 12
  },
  {
    id: "batch2",
    name: "Batch 2",
    addedOn: "January 29, 2025",
    sessionStart: "January 30, 2025",
    sessionEnd: "May 30, 2025",
    studentCount: 24
  }
];

const AdminBatches = () => {
  const [search, setSearch] = useState("");
  const [batches, setBatches] = useState<Batch[]>(batchesMockData);
  
  const filteredBatches = batches.filter((batch) =>
    batch.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Calculate days remaining for a batch
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Calculate progress percentage for a batch
  const getBatchProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Batches Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Search Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search by batch name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {filteredBatches.map((batch) => {
            const progress = getBatchProgress(batch.sessionStart, batch.sessionEnd);
            const daysRemaining = getDaysRemaining(batch.sessionEnd);
            
            return (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{batch.name}</CardTitle>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {batch.studentCount} Students
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Added On:</span>
                        <span>{batch.addedOn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Session Start:</span>
                        <span>{batch.sessionStart}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Session End:</span>
                        <span>{batch.sessionEnd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days Remaining:</span>
                        <span>{daysRemaining} days</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">Overall Progress:</label>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-primary"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-end text-sm mt-1">{progress}%</div>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Hours:</span>
                        <span>{batch.studentCount * 100}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Sessions:</span>
                        <span>{batch.studentCount * 75}</span>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm">View Students</Button>
                        <Button size="sm">Edit Batch</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredBatches.length === 0 && (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                No batches found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBatches;
