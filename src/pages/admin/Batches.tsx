import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Batch } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, CalendarPlus, Eye, Edit, Plus, Search } from "lucide-react";
import AddBatchModal from "@/components/batch/AddBatchModal";
import EditBatchModal from "@/components/batch/EditBatchModal";
import ViewStudentsModal from "@/components/batch/ViewStudentsModal";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewStudentsModalOpen, setIsViewStudentsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  
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

  const handleAddBatch = (newBatch: Batch) => {
    setBatches([...batches, newBatch]);
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    setBatches(
      batches.map((batch) => 
        batch.id === updatedBatch.id ? updatedBatch : batch
      )
    );
  };

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsEditModalOpen(true);
  };

  const handleViewStudents = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsViewStudentsModalOpen(true);
  };
  
  // Function to determine progress bar color class
  const getProgressColorClass = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    if (progress < 100) return "bg-green-500";
    return "bg-blue-500";
  };

  // Function to get batch status
  const getBatchStatus = (startDate: string, endDate: string) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) return { label: "Upcoming", class: "bg-blue-500/10 text-blue-500" };
    if (now > end) return { label: "Completed", class: "bg-green-500/10 text-green-500" };
    return { label: "Active", class: "bg-yellow-500/10 text-yellow-500" };
  };
  
  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Batches Management</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor all training batches</p>
          </div>
          
          <Button 
            className="w-full sm:w-auto" 
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Batch
          </Button>
        </div>
        
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Search Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by batch name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Filter by Date
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4">
          {filteredBatches.map((batch) => {
            const progress = getBatchProgress(batch.sessionStart, batch.sessionEnd);
            const daysRemaining = getDaysRemaining(batch.sessionEnd);
            const progressColorClass = getProgressColorClass(progress);
            const status = getBatchStatus(batch.sessionStart, batch.sessionEnd);
            
            return (
              <Card key={batch.id} className="border-border/40 hover:border-border/80 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">{batch.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">ID: {batch.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={status.class}>
                        {status.label}
                      </Badge>
                      <Badge variant="outline" className="font-medium">
                        {batch.studentCount} Students
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-3">
                          <div className="text-muted-foreground">Added On</div>
                          <div className="text-muted-foreground">Session Start</div>
                          <div className="text-muted-foreground">Session End</div>
                          <div className="text-muted-foreground">Days Remaining</div>
                        </div>
                        <div className="space-y-3 font-medium">
                          <div>{batch.addedOn}</div>
                          <div>{batch.sessionStart}</div>
                          <div>{batch.sessionEnd}</div>
                          <div>{daysRemaining} days</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm text-muted-foreground">Overall Progress</label>
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                          indicatorClassName={progressColorClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-3">
                          <div className="text-muted-foreground">Total Hours</div>
                          <div className="text-muted-foreground">Total Sessions</div>
                        </div>
                        <div className="space-y-3 font-medium">
                          <div>{batch.studentCount * 100}</div>
                          <div>{batch.studentCount * 75}</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleViewStudents(batch)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Students
                        </Button>
                        <Button 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => handleEditBatch(batch)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Batch
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredBatches.length === 0 && (
            <Card className="py-8 border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground">
                  No batches found matching your search criteria.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add Batch Modal */}
      <AddBatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBatch={handleAddBatch}
      />
      
      {/* Edit Batch Modal */}
      <EditBatchModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        batch={selectedBatch}
        onUpdateBatch={handleUpdateBatch}
      />
      
      {/* View Students Modal */}
      <ViewStudentsModal
        isOpen={isViewStudentsModalOpen}
        onClose={() => setIsViewStudentsModalOpen(false)}
        batch={selectedBatch}
      />
    </DashboardLayout>
  );
};

export default AdminBatches;
