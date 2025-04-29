
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-progress-complete";
    if (progress >= 71) return "bg-progress-high";
    if (progress >= 31) return "bg-progress-medium";
    return "bg-progress-low";
  };

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2.5", className)}>
      <div
        className={cn("h-2.5 rounded-full", getProgressColor(progress))}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
