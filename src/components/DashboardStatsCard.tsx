import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats, User } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { ArrowDownIcon, ArrowUpIcon, Clock, CreditCard, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsCardProps {
  stats: DashboardStats;
  title: string;
  users: User[];
  loading?: boolean;
  showCoordinators?: boolean;
  showMentors?: boolean;
  showStudents?: boolean;
}

const DashboardStatsCard = ({ stats, title, users, loading, showCoordinators, showMentors, showStudents }: DashboardStatsCardProps) => {
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₹${num.toLocaleString()}`;

  const calculateProgress = (completed: number, total: number) => {
    if (total <= 0) return 0;
    const progress = Math.round((completed / total) * 100);
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
  };

  const sessionsProgress = calculateProgress(stats.completedSessions, stats.totalSessions);
  const hoursProgress = calculateProgress(stats.completedHours, Math.max(stats.totalHours, stats.completedHours)); // Ensure total is at least completed
  const paymentsProgress = calculateProgress(stats.completedPayments, stats.totalPayments);

  const totalCoordinators = users.filter(u => u.role === "coordinator").length;
  const totalMentors = users.filter(u => u.role === "mentor").length;

  const visibleCards = [showCoordinators, showMentors, showStudents].filter(Boolean).length;
  const gridCols =
    visibleCards === 1
      ? "grid-cols-1"
      : visibleCards === 2
      ? "grid-cols-2"
      : "grid-cols-3";

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
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.totalSessions)}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
                    <p className="text-[10px] sm:text-xs font-medium">
                      {loading ? <Skeleton className="h-6 w-16" /> : sessionsProgress}%
                    </p>
                  </div>
                  <Progress value={sessionsProgress} className="h-1 sm:h-2.5" />
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-green-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.activeSessions)}
                </p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">ongoing</p>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-blue-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.completedSessions)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">sessions</p>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-yellow-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.pendingSessions)}
                </p>
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
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.totalHours)}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
                    <p className="text-[10px] sm:text-xs font-medium">
                      {loading ? <Skeleton className="h-6 w-16" /> : hoursProgress}%
                    </p>
                  </div>
                  <Progress value={hoursProgress} className="h-1 sm:h-2.5" />
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-green-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.activeHours)}
                </p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">in progress</p>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-blue-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.completedHours)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">hours</p>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-yellow-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.pendingHours)}
                </p>
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
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatCurrency(stats.totalPayments)}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Progress</p>
                    <p className="text-[10px] sm:text-xs font-medium">
                      {loading ? <Skeleton className="h-6 w-16" /> : paymentsProgress}%
                    </p>
                  </div>
                  <Progress value={paymentsProgress} className="h-1 sm:h-2.5" />
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-green-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatCurrency(stats.completedPayments)}
                </p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <p className="text-[10px] sm:text-xs">received</p>
                </div>
              </div>
            </Card>
            <Card className="p-2 sm:p-3 border-border/40 bg-yellow-500/5">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-base sm:text-lg md:text-xl font-semibold">
                  {loading ? <Skeleton className="h-6 w-16" /> : formatCurrency(stats.pendingPayments)}
                </p>
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
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overall Progress</h3>
          </div>
          <div className={`grid ${gridCols} gap-3`}>
            {showCoordinators && (
              <Card className="p-3 rounded-xl shadow-md border border-border/40 bg-gradient-to-br from-primary/5 to-transparent hover:scale-[1.02] hover:shadow-lg transition">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Coordinators</p>
                  <p className="text-lg md:text-xl font-bold">
                    {loading ? <Skeleton className="h-6 w-16" /> : totalCoordinators}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">managing</p>
                </div>
              </Card>
            )}
            {showMentors && (
              <Card className="p-3 rounded-xl shadow-md border border-border/40 bg-gradient-to-br from-secondary/5 to-transparent hover:scale-[1.02] hover:shadow-lg transition">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Mentors</p>
                  <p className="text-lg md:text-xl font-bold">
                    {loading ? <Skeleton className="h-6 w-16" /> : totalMentors}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">guiding</p>
                </div>
              </Card>
            )}
            {showStudents && (
              <Card className="p-3 rounded-xl shadow-md border border-border/40 bg-gradient-to-br from-accent/5 to-transparent hover:scale-[1.02] hover:shadow-lg transition">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
                  <p className="text-lg md:text-xl font-bold">
                    {loading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats.totalStudents)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">enrolled</p>
                </div>
              </Card>
            )}
          </div>
          <Card className="p-3 rounded-xl border border-border/40 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Progress</p>
                <p className="text-xs sm:text-sm font-medium">
                  {loading ? <Skeleton className="h-6 w-16" /> : stats.overallProgress}%
                </p>
              </div>
              <Progress value={stats.overallProgress} className="h-2" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Overall completion rate</p>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
