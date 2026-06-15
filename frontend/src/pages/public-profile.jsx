import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ExternalLink,
  Flag,
  Github,
  Globe,
  Linkedin,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import {
  createReport,
  getReviewSummaryByUser,
  getUserProfile,
  getWorksByUser,
} from "@/lib/api";

const reportReasons = [
  "Fake account",
  "Spam or scam",
  "Abuse or harassment",
  "Inappropriate behavior",
  "Misleading portfolio",
  "Payment or off-platform risk",
  "Other",
];

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString();
}

function socialIcon(link) {
  const normalized = link.toLowerCase();
  if (normalized.includes("github")) return Github;
  if (normalized.includes("linkedin")) return Linkedin;
  return Globe;
}

export default function PublicProfile() {
  const [, params] = useRoute("/users/:userId");
  const [, setLocation] = useLocation();
  const { currentUser, isAuthenticated } = useStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [works, setWorks] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const userId = params?.userId;
  const currentUserId = currentUser?.id || currentUser?._id || "";

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const [userResponse, worksResponse, reviewsResponse] = await Promise.all([
          getUserProfile(userId),
          getWorksByUser(userId).catch(() => []),
          getReviewSummaryByUser(userId).catch(() => null),
        ]);

        setProfile(userResponse?.data || userResponse);
        setWorks(Array.isArray(worksResponse) ? worksResponse : worksResponse?.data || []);
        setReviewSummary({
          averageRating: Number(reviewsResponse?.averageRating || 0),
          totalReviews: Number(reviewsResponse?.totalReviews || 0),
          reviews: Array.isArray(reviewsResponse?.reviews) ? reviewsResponse.reviews : [],
        });
      } catch (error) {
        toast({
          title: "Profile not available",
          description: error?.message || "Could not load this public profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, toast]);

  const initials = useMemo(() => getInitials(profile?.name), [profile?.name]);
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const portfolioLinks = Array.isArray(profile?.portfolioLinks)
    ? profile.portfolioLinks
    : [];
  const socialLinks = Array.isArray(profile?.socialLinks) ? profile.socialLinks : [];
  const canReport = isAuthenticated && currentUserId && currentUserId !== userId;

  const submitReport = async () => {
    if (!reportReason) {
      toast({
        title: "Select a reason",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingReport(true);
      await createReport({
        reporterId: currentUserId,
        reportedUserId: userId,
        reporterRole: "member",
        reason: reportReason,
        description: reportDescription,
      });

      toast({
        title: "Report submitted",
        description: "Thanks. The admin team can now review this profile.",
      });
      setReportOpen(false);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      toast({
        title: "Report failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-semibold">Profile not found</h1>
          <Button className="mt-5" onClick={() => setLocation(isAuthenticated ? "/home" : "/")}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.10),transparent_32rem),hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setLocation(isAuthenticated ? "/home" : "/")}
            className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">Pro</span>
            <span className="text-lg font-bold">Connect</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="h-36 bg-gradient-to-r from-slate-950 via-blue-950 to-emerald-900 dark:from-slate-900 dark:via-blue-950 dark:to-emerald-950" />
          <div className="p-5 md:p-7">
            <div className="-mt-20 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.profileImage || ""} alt={profile.name} />
                  <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-semibold tracking-tight">
                      {profile.name || "ProConnect Member"}
                    </h1>
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {profile.accountStatus || "active"}
                    </Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {profile.bio || "This member has not added a bio yet."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {profile.location && (
                      <span className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      {reviewSummary.averageRating.toFixed(1)} from {reviewSummary.totalReviews} reviews
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {formatDate(profile.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {isAuthenticated && currentUserId !== userId && (
                  <Button onClick={() => setLocation(`/messages?userId=${userId}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                )}
                {canReport && (
                  <Button variant="outline" onClick={() => setReportOpen(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold uppercase text-muted-foreground">Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="rounded-full">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div>
                  <h2 className="text-sm font-semibold uppercase text-muted-foreground">Experience</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {profile.experience || "No experience details added yet."}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase text-muted-foreground">Education</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {profile.education || "No education details added yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5 lg:col-span-8">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold">Portfolio</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[...portfolioLinks, ...socialLinks].length > 0 ? (
                    [...portfolioLinks, ...socialLinks].map((link, index) => {
                      const Icon = socialIcon(link);
                      return (
                        <a
                          key={`${link}-${index}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 items-center gap-3 rounded-xl border bg-background p-3 text-sm transition hover:border-primary/50 hover:bg-primary/5"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate">{link}</span>
                          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </a>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No public portfolio links yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold">Public Projects</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {works.length > 0 ? (
                    works.slice(0, 6).map((work) => (
                      <div key={work.id || work._id} className="rounded-xl border bg-background p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          {work.category || "General"}
                        </div>
                        <h3 className="mt-2 line-clamp-2 font-semibold">{work.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {work.shortDescription || work.fullDescription || "No description"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No public projects posted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold">Reviews</h2>
                <div className="mt-4 space-y-3">
                  {reviewSummary.reviews.length > 0 ? (
                    reviewSummary.reviews.slice(0, 5).map((review) => (
                      <div key={review.id || review._id} className="rounded-xl border bg-background p-4">
                        <div className="mb-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Number(review.rating || 0)
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {review.comment || "No written comment."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Details</Label>
              <Textarea
                rows={4}
                value={reportDescription}
                onChange={(event) => setReportDescription(event.target.value)}
                placeholder="Share enough context for an admin to review."
              />
            </div>

            <Button className="w-full" onClick={submitReport} disabled={submittingReport}>
              {submittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
