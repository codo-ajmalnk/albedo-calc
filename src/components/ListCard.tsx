
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  stats?: {
    [key: string]: any;
  };
  hasStudents?: boolean;
  onViewDetails: () => void;
  onViewMentors?: () => void;
  onViewStudents?: () => void;
  onEditProfile: () => void;
  onDelete: () => void;
}

export const ListCard = ({
  id,
  name,
  email,
  phone,
  status,
  stats,
  hasStudents,
  onViewDetails,
  onViewMentors,
  onViewStudents,
  onEditProfile,
  onDelete
}: ListCardProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-base">{name}</h3>
              {status && (
                <Badge variant={status === "active" ? "outline" : "secondary"} 
                  className={status === "active" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                  {status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{email}</p>
            {phone && <p className="text-xs text-muted-foreground">Phone: {phone}</p>}
            <p className="text-xs text-muted-foreground">ID: {id}</p>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 gap-4 sm:w-2/5">
              {Object.entries(stats).map(([key, value]) => {
                // Skip progress values which will be displayed separately
                if (key.includes('Progress')) return null;
                
                return (
                  <div key={key} className="space-y-1">
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Eye className="h-4 w-4 mr-1" /> Details
            </Button>
            {onViewMentors && (
              <Button variant="outline" size="sm" onClick={onViewMentors}>
                <Users className="h-4 w-4 mr-1" /> Mentors
              </Button>
            )}
            {onViewStudents && (
              <Button variant="outline" size="sm" onClick={onViewStudents}>
                <Users className="h-4 w-4 mr-1" /> Students
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEditProfile}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onDelete} 
              disabled={hasStudents}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
        
        {stats && (
          <div className="mt-4 space-y-2">
            {Object.entries(stats).map(([key, value]) => {
              if (!key.includes('Progress') || typeof value !== 'number') return null;
              
              const relatedValues = key === 'sessionProgress' 
                ? { completed: stats.completedSessions, total: stats.totalSessions }
                : key === 'hoursProgress'
                  ? { completed: stats.completedHours, total: stats.totalHours }
                  : key === 'paymentsProgress'
                    ? { completed: stats.completedPayments, total: stats.totalPayments }
                    : null;
                    
              if (!relatedValues) return null;
              
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{key.replace('Progress', '').replace(/([A-Z])/g, ' $1').trim()} Progress</span>
                    <span>{value}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className={cn(
                      "h-2",
                      value === 100
                        ? 'bg-progress-complete'
                        : value >= 75
                          ? 'bg-progress-high'
                          : value >= 40
                            ? 'bg-progress-medium'
                            : 'bg-progress-low'
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {key === 'paymentsProgress' ? (
                      <>
                        <span>₹{relatedValues.completed.toLocaleString()} completed</span>
                        <span>₹{relatedValues.total.toLocaleString()} total</span>
                      </>
                    ) : (
                      <>
                        <span>{relatedValues.completed} completed</span>
                        <span>{relatedValues.total} total</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
