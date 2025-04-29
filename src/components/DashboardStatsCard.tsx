import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";
import { ArrowDownIcon, ArrowUpIcon, Clock, CreditCard, Users } from "lucide-react";

interface DashboardStatsCardProps {
  stats: DashboardStats;
  title: string;
}

const DashboardStatsCard = ({ stats, title }: DashboardStatsCardProps) => {
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₹${num.toLocaleString()}`;
  
  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const sessionsProgress = calculateProgress(stats.completedSessions, stats.totalSessions);
  const hoursProgress = calculateProgress(stats.completedHours, stats.totalHours);
  const paymentsProgress = calculateProgress(stats.completedPayments, stats.totalPayments);

  return (
    <Card className="w-full">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Sessions Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <h3 className="text-xs sm:text-sm font-medium">Sessions Overview</h3>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <Card className="p-2 sm:p-3 border-border/40">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.totalSessions)}</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
                    <p className="text-[10px] sm:text-xs font-medium">{sessionsProgress}%</p>
                  </div>
                  <ProgressBar progress={sessionsProgress} className="h-1 sm:h-2.5" />
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-green-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.activeSessions)}</p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">ongoing</p>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-blue-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.completedSessions)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">sessions</p>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-yellow-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.pendingSessions)}</p>
                <div className="flex items-center gap-1 text-yellow-600">
                  <ArrowDownIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">remaining</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Hours Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <h3 className="text-xs sm:text-sm font-medium">Hours Breakdown</h3>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <Card className="p-2 sm:p-3 border-border/40">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.totalHours)}</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
                    <p className="text-[10px] sm:text-xs font-medium">{hoursProgress}%</p>
                  </div>
                  <ProgressBar progress={hoursProgress} className="h-1 sm:h-2.5" />
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-green-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.activeHours)}</p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">in progress</p>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-blue-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.completedHours)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">hours</p>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-yellow-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.pendingHours)}</p>
                <div className="flex items-center gap-1 text-yellow-600">
                  <ArrowDownIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">remaining</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Payments Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <h3 className="text-xs sm:text-sm font-medium">Payment Status</h3>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <Card className="p-2 sm:p-3 border-border/40">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatCurrency(stats.totalPayments)}</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
                    <p className="text-[10px] sm:text-xs font-medium">{paymentsProgress}%</p>
                  </div>
                  <ProgressBar progress={paymentsProgress} className="h-1 sm:h-2.5" />
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-green-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatCurrency(stats.completedPayments)}</p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">received</p>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-yellow-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatCurrency(stats.pendingPayments)}</p>
                <div className="flex items-center gap-1 text-yellow-600">
                  <ArrowDownIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">due</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Overview Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <h3 className="text-xs sm:text-sm font-medium">Overall Progress</h3>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <Card className="p-2 sm:p-3 border-border/40">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">{formatNumber(stats.totalStudents)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">enrolled</p>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40">
              <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">Progress</p>
                  <p className="text-xs sm:text-sm font-medium">{stats.overallProgress}%</p>
                </div>
                <ProgressBar progress={stats.overallProgress} className="h-1.5 sm:h-2.5" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Overall completion rate</p>
              </div>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
