import { Batch } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatch: (batch: Batch) => void;
}

const AddBatchModal = ({ isOpen, onClose, onAddBatch }: AddBatchModalProps) => {
  const [newBatch, setNewBatch] = useState({
    id: `batch${Date.now()}`,
    name: "",
    addedOn: format(new Date(), "MMMM dd, yyyy"),
    sessionStart: "",
    sessionEnd: "",
    studentCount: 0
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = () => {
    onAddBatch({
      ...newBatch,
      sessionStart: startDate ? format(startDate, "MMMM dd, yyyy") : "",
      sessionEnd: endDate ? format(endDate, "MMMM dd, yyyy") : "",
    });
    onClose();
    // Reset form
    setNewBatch({
      id: `batch${Date.now()}`,
      name: "",
      addedOn: format(new Date(), "MMMM dd, yyyy"),
      sessionStart: "",
      sessionEnd: "",
      studentCount: 0
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold">Add New Batch</DialogTitle>
          <DialogDescription>
            Fill in the batch details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-id">Batch ID</Label>
              <Input
                id="batch-id"
                value={newBatch.id}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Batch Name *</Label>
              <Input
                id="name"
                value={newBatch.name}
                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                placeholder="Enter batch name"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Session End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-count">Initial Student Count *</Label>
            <Input
              id="student-count"
              type="number"
              min="0"
              value={newBatch.studentCount}
              onChange={(e) => setNewBatch({ ...newBatch, studentCount: parseInt(e.target.value) || 0 })}
              placeholder="Enter number of students"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBatchModal;
