import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";

interface DashboardStatsCardProps {
  stats: DashboardStats;
  title: string;
}

const DashboardStatsCard = ({ stats, title }: DashboardStatsCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Sessions Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-3xl font-bold mt-1">{stats.totalSessions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-3xl font-bold mt-1">{stats.activeSessions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
              <p className="text-3xl font-bold mt-1">{stats.completedSessions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Sessions</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingSessions}</p>
            </div>
          </div>
        </div>

        {/* Hours Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-3xl font-bold mt-1">{stats.totalHours}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Hours</p>
              <p className="text-3xl font-bold mt-1">{stats.activeHours}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Hours</p>
              <p className="text-3xl font-bold mt-1">{stats.completedHours}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Hours</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingHours}</p>
            </div>
          </div>
        </div>

        {/* Payments Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Payments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-3xl font-bold mt-1">{stats.totalPayments}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Payments</p>
              <p className="text-3xl font-bold mt-1">{stats.completedPayments}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-sm font-medium">{stats.overallProgress}%</p>
              </div>
              <ProgressBar progress={stats.overallProgress} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
