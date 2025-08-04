import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import { Users } from "lucide-react";

interface Package {
  id: string;
  name: string;
  sessions: number;
  completedSessions?: number;
  hours: number;
  completedHours?: number;
  payment: number;
  paidAmount?: number;
  progress: number; // 0-100
  durationDays: number;
  teacherName: string;
  teacherPhone: string;
}

interface PackageAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: Package[];
  userRole: string;
}

const PackageAssignmentDialog: React.FC<PackageAssignmentDialogProps> = ({
  open,
  onOpenChange,
  packages,
  userRole,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Assigned Packages</DialogTitle>
        <DialogDescription>
          Manage packages and view their progress.
        </DialogDescription>
      </DialogHeader>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Duration (days)</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length > 0 ? (
              packages.map((pkg) => {
                const completedSessions = Math.min(
                  pkg.completedSessions ?? 8,
                  pkg.sessions
                );
                const completedHours = Math.min(
                  pkg.completedHours ?? 16,
                  pkg.hours
                );
                const paidAmount = Math.min(
                  pkg.paidAmount ?? 8000,
                  pkg.payment
                );
                const progress =
                  pkg.sessions > 0
                    ? Math.min(
                        100,
                        Math.round((completedSessions / pkg.sessions) * 100)
                      )
                    : 0;
                const paymentProgress =
                  pkg.payment > 0
                    ? Math.min(
                        100,
                        Math.round((paidAmount / pkg.payment) * 100)
                      )
                    : 0;
                return (
                  <TableRow key={pkg.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{pkg.id}</TableCell>
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          {completedSessions}/{pkg.sessions}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {pkg.sessions - completedSessions} left
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          {completedHours}/{pkg.hours}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {pkg.hours - completedHours} left
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm whitespace-nowrap">
                          ₹{paidAmount.toLocaleString()}/₹
                          {pkg.payment.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {paymentProgress}% paid
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{pkg.teacherName}</span>
                        <span className="text-xs text-muted-foreground">
                          {pkg.teacherPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{pkg.durationDays}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progress === 100
                                ? "bg-progress-complete"
                                : progress >= 75
                                ? "bg-progress-high"
                                : progress >= 40
                                ? "bg-progress-medium"
                                : "bg-progress-low"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums w-[3ch]">
                          {progress}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Users className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">
                      No packages found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
);

export default PackageAssignmentDialog;
