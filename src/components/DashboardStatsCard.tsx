
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
            <p className="text-2xl font-bold">{stats.activeSessions}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Completed Sessions</p>
            <p className="text-2xl font-bold">{stats.completedSessions}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{stats.totalHours}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
            <p className="text-sm font-medium">{stats.overallProgress}%</p>
          </div>
          <ProgressBar progress={stats.overallProgress} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
