import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";

export const TaskDate = ({ value }: { value?: string | null }) => {
  if (!value) return null;
  const today = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, today);
  let textColor = "text-muted-foreground";
  if (diffInDays <= 3) {
    textColor = "text-red-500";
  } else if (diffInDays <= 7) {
    textColor = "text-orange-500";
  } else if (diffInDays <= 14) {
    textColor = "text-yellow-500";
  }
  return (
    <Badge variant="secondary" className={cn(textColor, "truncate")}>
      {format(value, "PPP")}
    </Badge>
  );
};
