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
import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onUpdateBatch: (batch: Batch) => void;
}

const EditBatchModal = ({ isOpen, onClose, batch, onUpdateBatch }: EditBatchModalProps) => {
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    if (batch) {
      setEditingBatch(batch);
      setStartDate(parse(batch.sessionStart, "MMMM dd, yyyy", new Date()));
      setEndDate(parse(batch.sessionEnd, "MMMM dd, yyyy", new Date()));
    }
  }, [batch]);

  const handleSubmit = () => {
    if (!editingBatch || !startDate || !endDate) return;

    onUpdateBatch({
      ...editingBatch,
      sessionStart: format(startDate, "MMMM dd, yyyy"),
      sessionEnd: format(endDate, "MMMM dd, yyyy"),
    });
    onClose();
  };

  if (!editingBatch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold">Edit Batch</DialogTitle>
          <DialogDescription>
            Update the batch information below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-batch-id">Batch ID</Label>
              <Input
                id="edit-batch-id"
                value={editingBatch.id}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Batch Name *</Label>
              <Input
                id="edit-name"
                value={editingBatch.name}
                onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
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
            <Label htmlFor="edit-student-count">Student Count *</Label>
            <Input
              id="edit-student-count"
              type="number"
              min="0"
              value={editingBatch.studentCount}
              onChange={(e) => setEditingBatch({
                ...editingBatch,
                studentCount: parseInt(e.target.value) || 0
              })}
              placeholder="Enter number of students"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Added On</Label>
            <Input
              value={editingBatch.addedOn}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBatchModal;
