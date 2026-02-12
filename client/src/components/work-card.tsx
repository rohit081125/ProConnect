import { Calendar, DollarSign, MapPin, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import type { WorkPost } from "@/lib/types";

interface WorkCardProps {
  work: WorkPost;
  onApply: (workId: string) => void;
  showApply?: boolean;
}

export function WorkCard({ work, onApply, showApply = true }: WorkCardProps) {
  const { getUserById, currentUser } = useStore();
  const poster = getUserById(work.postedBy);
  const isOwnPost = currentUser?.id === work.postedBy;

  const urgencyColor = {
    low: "bg-green-500/10 text-green-700 dark:text-green-400",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    high: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <Card className="overflow-visible" data-testid={`card-work-${work.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary" className="text-xs">{work.category}</Badge>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${urgencyColor[work.urgency]}`}>
                {work.urgency}
              </span>
            </div>
            <h3 className="font-semibold text-base leading-tight mt-2">{work.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{work.shortDescription}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {work.skills.slice(0, 4).map(skill => (
            <Badge key={skill} variant="outline" className="text-xs font-normal">{skill}</Badge>
          ))}
          {work.skills.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal">+{work.skills.length - 4}</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span>${work.budgetMin.toLocaleString()} - ${work.budgetMax.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{new Date(work.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{work.workType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{work.postedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {poster?.name.split(" ").map(n => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">{poster?.name || "Unknown"}</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-xs text-muted-foreground">{poster?.rating || 0}</span>
              </div>
            </div>
          </div>
          {showApply && !isOwnPost && (
            <Button size="sm" onClick={() => onApply(work.id)} data-testid={`button-apply-${work.id}`}>
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
