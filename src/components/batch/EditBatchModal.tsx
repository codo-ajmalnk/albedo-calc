
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Batch } from "@/lib/types";
import { toast } from "sonner";

interface EditBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onUpdateBatch: (updatedBatch: Batch) => void;
}

const EditBatchModal = ({ isOpen, onClose, batch, onUpdateBatch }: EditBatchModalProps) => {
  const [batchName, setBatchName] = useState("");
  const [addedDate, setAddedDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    if (batch) {
      setBatchName(batch.name);
      setAddedDate(parse(batch.addedOn, "MMMM d, yyyy", new Date()));
      setStartDate(parse(batch.sessionStart, "MMMM d, yyyy", new Date()));
      setEndDate(parse(batch.sessionEnd, "MMMM d, yyyy", new Date()));
      setStudentCount(batch.studentCount);
    }
  }, [batch]);

  const handleSubmit = () => {
    if (!batch) return;
    
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

    const updatedBatch: Batch = {
      ...batch,
      name: batchName,
      addedOn: format(addedDate, "MMMM d, yyyy"),
      sessionStart: format(startDate, "MMMM d, yyyy"),
      sessionEnd: format(endDate, "MMMM d, yyyy"),
      studentCount: studentCount
    };

    onUpdateBatch(updatedBatch);
    toast.success("Batch updated successfully!");
    onClose();
  };

  if (!batch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Batch</DialogTitle>
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
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date <= startDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary">
            Update Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBatchModal;
