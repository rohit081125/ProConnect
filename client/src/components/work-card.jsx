import { Calendar, DollarSign, MapPin, Clock, Star } from "lucide-react";
import {
  Card,
  CardImage,
  CardContent,
  CardTitle,
  ApplyButton,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";

export function WorkCard({
  work,
  onApply,
  showApply = true,
  isApplied = false,
}) {
  const { currentUser } = useStore();

  const poster = work?.poster || null;
  const currentUserId = currentUser?._id || currentUser?.id || "";
  const isOwnPost = currentUserId === work.postedBy;

  const levelClassMap = {
    easy: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20",
    medium:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20",
    hard: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
  };

  const posterInitials =
    poster?.name
      ?.split(" ")
      ?.filter(Boolean)
      ?.map((n) => n[0])
      ?.join("")
      ?.slice(0, 2)
      ?.toUpperCase() || "?";

  const workImage =
    work?.imageUrl ||
    work?.image ||
    "https://res.cloudinary.com/demo/image/upload/sample.jpg";

  const formattedDeadline = work?.deadline
    ? new Date(work.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "No deadline";

  const formattedPostedDate =
    work?.postedDate || work?.createdAt
      ? new Date(work.postedDate || work.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Recently";

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <CardImage
        src={workImage}
        alt={work.title || "Work Image"}
        className="h-44 w-full object-cover"
      />

      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className="px-2 py-0.5 text-xs">
              {work.category || "General"}
            </Badge>

            {work.projectLevel && (
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                  levelClassMap[work.projectLevel] ||
                  "border border-border bg-muted text-muted-foreground"
                }`}
              >
                {work.projectLevel} level
              </span>
            )}
          </div>

          <CardTitle className="text-base font-semibold leading-snug text-foreground line-clamp-2">
            {work.title}
          </CardTitle>

          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap break-words">
            {work.shortDescription || work.fullDescription || "No description available"}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {work.skills?.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {work.skills?.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{work.skills.length - 4}
              </Badge>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>₹{work.budget?.toLocaleString?.() || 0}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formattedDeadline}</span>
            </div>

            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="capitalize">{work.workType || "Remote"}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formattedPostedDate}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={poster?.profileImage} />
              <AvatarFallback className="bg-primary/10 text-xs">
                {posterInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium text-foreground">
                {poster?.name || "User"}
              </span>

              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-xs text-muted-foreground">
                  {poster?.rating || 0}
                </span>
              </div>
            </div>
          </div>

          {showApply && !isOwnPost && (
            isApplied ? (
              <button
                type="button"
                disabled
                className="shrink-0 rounded-md bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-500/20 cursor-not-allowed"
              >
                Applied
              </button>
            ) : (
              <ApplyButton
                onClick={() => onApply(work.id)}
                className="shrink-0 px-3 py-1.5 text-xs"
              >
                Apply
              </ApplyButton>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}