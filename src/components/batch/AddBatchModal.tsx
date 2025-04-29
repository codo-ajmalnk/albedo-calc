
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatch: (batch: any) => void;
}

const AddBatchModal = ({ isOpen, onClose, onAddBatch }: AddBatchModalProps) => {
  const navigate = useNavigate();
  const [batchName, setBatchName] = useState("");
  const [addedDate, setAddedDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 1)) // Tomorrow
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 121)) // 120 days from tomorrow
  );
  const [studentCount, setStudentCount] = useState<number>(0);

  const handleSubmit = () => {
    if (!batchName) {
      toast.error("Please enter a batch name");
      return;
    }

    if (!addedDate || !startDate || !endDate) {
      toast.error("Please select all dates");
      return;
    }

    if (studentCount <= 0) {
      toast.error("Please enter a valid student count");
      return;
    }

    // Calculate end date (120 days from start date)
    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setDate(calculatedEndDate.getDate() + 120);

    const newBatch = {
      id: `batch${Date.now()}`,
      name: batchName,
      addedOn: format(addedDate, "MMMM d, yyyy"),
      sessionStart: format(startDate, "MMMM d, yyyy"),
      sessionEnd: format(calculatedEndDate, "MMMM d, yyyy"),
      studentCount: studentCount
    };

    onAddBatch(newBatch);
    toast.success("Batch added successfully!");
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setBatchName("");
    setAddedDate(new Date());
    setStartDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    setEndDate(new Date(new Date().setDate(new Date().getDate() + 121)));
    setStudentCount(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Batch</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="batchName" className="text-right">
              Batch Name
            </Label>
            <Input
              id="batchName"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="col-span-3"
              placeholder="Enter batch name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateAdded" className="text-right">
              Date Added
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateAdded"
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !addedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {addedDate ? format(addedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={addedDate}
                  onSelect={setAddedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (date) {
                      const newEndDate = new Date(date);
                      newEndDate.setDate(date.getDate() + 120);
                      setEndDate(newEndDate);
                    }
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date (Auto)
            </Label>
            <Input
              id="endDate"
              value={endDate ? format(endDate, "PPP") : ""}
              className="col-span-3"
              disabled
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="studentCount" className="text-right">
              Student Count
            </Label>
            <Input
              id="studentCount"
              type="number"
              min="0"
              value={studentCount}
              onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
              className="col-span-3"
              placeholder="Enter number of students"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary">
            Add Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBatchModal;
