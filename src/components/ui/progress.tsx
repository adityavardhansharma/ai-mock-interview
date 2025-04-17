import { cn } from "@/lib/utils";

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({
  value = 0, 
  max = 100, 
  className, 
  indicatorClassName
}: ProgressProps) {
  // Ensure value is between 0 and max
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div 
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-blue-100",
        className
      )}
    >
      <div 
        className={cn(
          "h-full bg-blue-600 transition-all duration-200",
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
} 