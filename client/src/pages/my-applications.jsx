import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";

import {
  getApplicationsByApplicant,
  getWorksByUser,
  getApplicationsByWork,
  getWorkById,
  getUserProfile,
  acceptApplication,
  rejectApplication,
  requestCompletion,
  acceptCompletion,
  rejectCompletion,
  createReport,
  createReview,
} from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  FileText,
  Star,
  Calendar,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Briefcase,
  UserRound,
} from "lucide-react";

function getSafeUserId(user) {
  return user?.id || user?._id || "";
}

function getSafeId(item) {
  return item?.id || item?._id || "";
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString();
}

const reportReasons = [
  "Payment not received",
  "Work not delivered",
  "Poor quality work",
  "Abuse or harassment",
  "Spam or fake request",
  "Client not responding",
  "Freelancer not responding",
  "Misleading project details",
  "Asking to pay outside platform",
  "Other",
];

export default function MyApplications() {
  const { currentUser } = useStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [sentApplications, setSentApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [loadingSent, setLoadingSent] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [processingId, setProcessingId] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const currentUserId = getSafeUserId(currentUser);

  const statusColors = {
    pending:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    accepted:
      "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
    rejected:
      "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
    completion_requested:
      "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    completed:
      "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  useEffect(() => {
    if (!currentUserId) {
      setSentApplications([]);
      setReceivedApplications([]);
      setLoadingSent(false);
      setLoadingReceived(false);
      return;
    }

    loadSentApplications();
    loadReceivedApplications();
  }, [currentUserId]);

  const loadSentApplications = async () => {
    try {
      setLoadingSent(true);

      const appsResponse = await getApplicationsByApplicant(currentUserId);
      const apps = Array.isArray(appsResponse)
        ? appsResponse
        : appsResponse?.data || [];

      const normalized = await Promise.all(
        apps.map(async (app) => {
          const applicationId = getSafeId(app);

          let work = null;
          let client = null;

          try {
            const workResponse = await getWorkById(app.workId);
            work = workResponse?.data || workResponse || null;
          } catch (error) {
            work = null;
          }

          if (work?.postedBy) {
            try {
              const clientResponse = await getUserProfile(work.postedBy);
              client = clientResponse?.data || clientResponse || null;
            } catch (error) {
              client = null;
            }
          }

          return {
            ...app,
            id: applicationId,
            work,
            client,
          };
        })
      );

      setSentApplications(normalized);
    } catch (error) {
      console.error("Failed to load sent applications:", error);
      toast({
        title: "Failed to load sent applications",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
      setSentApplications([]);
    } finally {
      setLoadingSent(false);
    }
  };

  const loadReceivedApplications = async () => {
    try {
      setLoadingReceived(true);

      const worksResponse = await getWorksByUser(currentUserId);
      const works = Array.isArray(worksResponse)
        ? worksResponse
        : worksResponse?.data || [];

      const allApplicationsNested = await Promise.all(
        works.map(async (work) => {
          const workId = getSafeId(work);

          try {
            const appsResponse = await getApplicationsByWork(workId);
            const apps = Array.isArray(appsResponse)
              ? appsResponse
              : appsResponse?.data || [];

            const withDetails = await Promise.all(
              apps.map(async (app) => {
                const applicationId = getSafeId(app);

                let applicant = null;
                if (app.applicantId) {
                  try {
                    const applicantResponse = await getUserProfile(app.applicantId);
                    applicant = applicantResponse?.data || applicantResponse || null;
                  } catch (error) {
                    applicant = null;
                  }
                }

                return {
                  ...app,
                  id: applicationId,
                  work,
                  applicant,
                };
              })
            );

            return withDetails;
          } catch (error) {
            return [];
          }
        })
      );

      setReceivedApplications(allApplicationsNested.flat());
    } catch (error) {
      console.error("Failed to load received applications:", error);
      toast({
        title: "Failed to load received applications",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
      setReceivedApplications([]);
    } finally {
      setLoadingReceived(false);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      await acceptApplication(applicationId);

      toast({
        title: "Application accepted",
      });

      await loadReceivedApplications();
      await loadSentApplications();
    } catch (error) {
      toast({
        title: "Failed to accept application",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      await rejectApplication(applicationId);

      toast({
        title: "Application rejected",
      });

      await loadReceivedApplications();
      await loadSentApplications();
    } catch (error) {
      toast({
        title: "Failed to reject application",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessingId("");
    }
  };

  const handleRequestCompletion = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      await requestCompletion(applicationId, currentUserId);

      toast({
        title: "Completion request sent",
      });

      await loadReceivedApplications();
      await loadSentApplications();
    } catch (error) {
      toast({
        title: "Failed to request completion",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessingId("");
    }
  };

  const handleAcceptCompletion = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      await acceptCompletion(applicationId, currentUserId);

      toast({
        title: "Work marked as completed",
      });

      await loadReceivedApplications();
      await loadSentApplications();
    } catch (error) {
      toast({
        title: "Failed to accept completion",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessingId("");
    }
  };

  const handleRejectCompletion = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      await rejectCompletion(applicationId, currentUserId);

      toast({
        title: "Completion request rejected",
      });

      await loadReceivedApplications();
      await loadSentApplications();
    } catch (error) {
      toast({
        title: "Failed to reject completion",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessingId("");
    }
  };

  const openReportDialog = (application, reportedUserId, reporterRole) => {
    setSelectedApplication({
      ...application,
      reportedUserId,
      reporterRole,
    });
    setReportReason("");
    setReportDescription("");
    setReportOpen(true);
  };

  const openReviewDialog = (application, reviewedUserId, reviewerRole) => {
    setSelectedApplication({
      ...application,
      reviewedUserId,
      reviewerRole,
    });
    setReviewRating(0);
    setReviewComment("");
    setReviewOpen(true);
  };

  const handleSubmitReport = async () => {
    try {
      if (!reportReason) {
        toast({
          title: "Select a reason",
          description: "Please choose a report reason",
          variant: "destructive",
        });
        return;
      }

      await createReport({
        applicationId: selectedApplication.id,
        workId: selectedApplication.workId,
        reporterId: currentUserId,
        reportedUserId: selectedApplication.reportedUserId,
        reporterRole: selectedApplication.reporterRole,
        reason: reportReason,
        description: reportDescription,
      });

      toast({
        title: "Report submitted",
        description: "Your report has been submitted successfully",
      });

      setReportOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (reviewRating < 1 || reviewRating > 5) {
        toast({
          title: "Select rating",
          description: "Please select rating from 1 to 5",
          variant: "destructive",
        });
        return;
      }

      await createReview({
        applicationId: selectedApplication.id,
        workId: selectedApplication.workId,
        reviewerId: currentUserId,
        reviewedUserId: selectedApplication.reviewedUserId,
        reviewerRole: selectedApplication.reviewerRole,
        rating: reviewRating,
        comment: reviewComment,
      });

      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully",
      });

      setReviewOpen(false);
      setSelectedApplication(null);

      await loadReceivedApplications();
      await loadSentApplications();
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const sentCount = useMemo(() => sentApplications.length, [sentApplications]);
  const receivedCount = useMemo(
    () => receivedApplications.length,
    [receivedApplications]
  );

  const renderInfoPill = (icon, text) => (
    <div className="flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
      {icon}
      <span className="truncate">{text}</span>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border bg-card/80 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1
                className="text-2xl font-bold tracking-tight"
                data-testid="text-my-applications-title"
              >
                My Applications
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track the work you applied to and manage the applicants on your
                own posts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-xl border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Sent</p>
                <p className="mt-1 text-lg font-semibold">{sentCount}</p>
              </div>
              <div className="rounded-xl border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="mt-1 text-lg font-semibold">{receivedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="mb-5 grid w-full grid-cols-2 rounded-xl p-1">
            <TabsTrigger value="sent" className="rounded-lg" data-testid="tab-sent">
              Sent ({sentCount})
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="rounded-lg"
              data-testid="tab-received"
            >
              Received ({receivedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-0">
            {loadingSent ? (
              <div className="rounded-2xl border bg-card py-14 text-center text-sm text-muted-foreground">
                Loading sent applications...
              </div>
            ) : sentApplications.length === 0 ? (
              <div
                className="rounded-2xl border bg-card py-14 text-center"
                data-testid="empty-state-sent"
              >
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">No applications sent</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse work posts and apply to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
                {sentApplications.map((app) => {
                  const work = app.work;
                  const client = app.client;
                  const clientId = getSafeUserId(client);

                  return (
                    <Card
                      key={app.id}
                      className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md"
                      data-testid={`card-sent-${app.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Sent Application
                              </p>
                            </div>

                            <h3
                              className="line-clamp-2 text-base font-semibold sm:text-lg"
                              data-testid={`text-sent-title-${app.id}`}
                            >
                              {work?.title || "Unknown Work"}
                            </h3>

                            <div className="mt-3 flex items-center gap-2">
                              <Avatar className="h-9 w-9 border">
                                <AvatarImage src={client?.profileImage || ""} />
                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                  {getInitials(client?.name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <p
                                  className="truncate text-sm font-medium"
                                  data-testid={`text-client-name-${app.id}`}
                                >
                                  {client?.name || "Unknown Client"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Posted by client
                                </p>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                              statusColors[app.status] ||
                              "border-muted bg-muted text-muted-foreground"
                            }`}
                            data-testid={`status-sent-${app.id}`}
                          >
                            {app.status || "pending"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {renderInfoPill(
                            <DollarSign className="h-3.5 w-3.5" />,
                            `Budget: $${Number(work?.budget || 0).toLocaleString()}`
                          )}
                          {renderInfoPill(
                            <Calendar className="h-3.5 w-3.5" />,
                            `Applied: ${formatDate(app.createdAt)}`
                          )}
                          {renderInfoPill(
                            <Star className="h-3.5 w-3.5" />,
                            `Level: ${work?.projectLevel || "Not specified"}`
                          )}
                        </div>

                        <div className="mt-4 rounded-xl border bg-muted/20 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <p className="text-sm font-semibold">Your Proposal</p>
                          </div>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {app.proposalMessage || "No proposal message"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {app.referenceLink && (
                              <span className="max-w-full break-all rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                                {app.referenceLink}
                              </span>
                            )}

                            {(app.counterPrice || app.counterPrice === 0) && (
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-400">
                                Your Price: $
                                {Number(app.counterPrice).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {Array.isArray(app.skillsUsed) && app.skillsUsed.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {app.skillsUsed.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="rounded-full text-[10px]"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {app.status === "accepted" && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setLocation(`/messages?userId=${clientId}`)
                              }
                            >
                              <MessageSquare className="mr-1.5 h-4 w-4" />
                              Message
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openReportDialog(app, clientId, "freelancer")
                              }
                            >
                              Report Issue
                            </Button>
                          </div>
                        )}

                        {app.status === "completion_requested" && (
                          <div className="mt-4 rounded-xl border bg-orange-500/10 p-3">
                            <p className="text-sm font-medium">
                              Completion Requested
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              The client has requested to mark this work as
                              completed. Please confirm only after receiving
                              payment and verifying final delivery.
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptCompletion(app.id)}
                                disabled={processingId === app.id}
                              >
                                {processingId === app.id
                                  ? "Processing..."
                                  : "Accept"}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectCompletion(app.id)}
                                disabled={processingId === app.id}
                              >
                                {processingId === app.id
                                  ? "Processing..."
                                  : "Reject"}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setLocation(`/messages?userId=${clientId}`)
                                }
                              >
                                <MessageSquare className="mr-1.5 h-4 w-4" />
                                Message
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openReportDialog(app, clientId, "freelancer")
                                }
                              >
                                Report Issue
                              </Button>
                            </div>
                          </div>
                        )}

                        {app.status === "completed" && (
                          <div className="mt-4 rounded-xl border bg-blue-500/10 p-3">
                            <p className="text-sm font-medium">Work Completed</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              This work has been marked as completed
                              successfully.
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openReportDialog(app, clientId, "freelancer")
                                }
                              >
                                Report Issue
                              </Button>

                              {!app.freelancerRated && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    openReviewDialog(app, clientId, "freelancer")
                                  }
                                >
                                  Leave Review
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-0">
            {loadingReceived ? (
              <div className="rounded-2xl border bg-card py-14 text-center text-sm text-muted-foreground">
                Loading received applications...
              </div>
            ) : receivedApplications.length === 0 ? (
              <div
                className="rounded-2xl border bg-card py-14 text-center"
                data-testid="empty-state-received"
              >
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">No applications received</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Applications on your posted work will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
                {receivedApplications.map((app) => {
                  const work = app.work;
                  const applicant = app.applicant;
                  const applicantId = getSafeUserId(applicant);

                  return (
                    <Card
                      key={app.id}
                      className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md"
                      data-testid={`card-received-${app.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-primary" />
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Received Application
                              </p>
                            </div>

                            <h3
                              className="line-clamp-2 text-base font-semibold sm:text-lg"
                              data-testid={`text-received-title-${app.id}`}
                            >
                              {work?.title || "Unknown Work"}
                            </h3>

                            <div className="mt-3 flex items-center gap-2">
                              <Avatar className="h-9 w-9 border">
                                <AvatarImage src={applicant?.profileImage || ""} />
                                <AvatarFallback className="bg-accent/10 text-xs text-accent">
                                  {getInitials(applicant?.name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <p
                                  className="truncate text-sm font-medium"
                                  data-testid={`text-applicant-name-${app.id}`}
                                >
                                  {applicant?.name || "Unknown Applicant"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Applied for this work
                                </p>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                              statusColors[app.status] ||
                              "border-muted bg-muted text-muted-foreground"
                            }`}
                            data-testid={`status-received-${app.id}`}
                          >
                            {app.status || "pending"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {renderInfoPill(
                            <DollarSign className="h-3.5 w-3.5" />,
                            `Budget: $${Number(work?.budget || 0).toLocaleString()}`
                          )}
                          {renderInfoPill(
                            <Calendar className="h-3.5 w-3.5" />,
                            `Applied: ${formatDate(app.createdAt)}`
                          )}
                          {renderInfoPill(
                            <Star className="h-3.5 w-3.5" />,
                            `Level: ${work?.projectLevel || "Not specified"}`
                          )}
                        </div>

                        <div className="mt-4 rounded-xl border bg-muted/20 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <p className="text-sm font-semibold">
                              Proposal Message
                            </p>
                          </div>

                          <p
                            className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground"
                            data-testid={`text-proposal-${app.id}`}
                          >
                            {app.proposalMessage || "No proposal message"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {app.referenceLink && (
                              <span
                                className="max-w-full break-all rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                                data-testid={`link-reference-${app.id}`}
                              >
                                {app.referenceLink}
                              </span>
                            )}

                            {(app.counterPrice || app.counterPrice === 0) && (
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-400">
                                Counter Price: $
                                {Number(app.counterPrice).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {Array.isArray(app.skillsUsed) && app.skillsUsed.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {app.skillsUsed.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="rounded-full text-[10px]"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {app.status === "pending" && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(app.id)}
                              disabled={processingId === app.id}
                              data-testid={`button-accept-${app.id}`}
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" />
                              {processingId === app.id ? "Processing..." : "Accept"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(app.id)}
                              disabled={processingId === app.id}
                              data-testid={`button-reject-${app.id}`}
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              {processingId === app.id ? "Processing..." : "Reject"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openReportDialog(app, applicantId, "client")
                              }
                            >
                              Report Issue
                            </Button>
                          </div>
                        )}

                        {app.status === "accepted" && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setLocation(`/messages?userId=${applicantId}`)
                              }
                            >
                              <MessageSquare className="mr-1.5 h-4 w-4" />
                              Message
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleRequestCompletion(app.id)}
                              disabled={processingId === app.id}
                            >
                              {processingId === app.id
                                ? "Processing..."
                                : "Request Completion"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openReportDialog(app, applicantId, "client")
                              }
                            >
                              Report Issue
                            </Button>
                          </div>
                        )}

                        {app.status === "completion_requested" && (
                          <div className="mt-4 rounded-xl border bg-orange-500/10 p-3">
                            <p className="text-sm font-medium">
                              Completion Request Sent
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              You have requested the freelancer to confirm that
                              this work has been completed.
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setLocation(`/messages?userId=${applicantId}`)
                                }
                              >
                                <MessageSquare className="mr-1.5 h-4 w-4" />
                                Message
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openReportDialog(app, applicantId, "client")
                                }
                              >
                                Report Issue
                              </Button>
                            </div>
                          </div>
                        )}

                        {app.status === "completed" && (
                          <div className="mt-4 rounded-xl border bg-blue-500/10 p-3">
                            <p className="text-sm font-medium">Work Completed</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              This work has been marked as completed
                              successfully.
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openReportDialog(app, applicantId, "client")
                                }
                              >
                                Report Issue
                              </Button>

                              {!app.clientRated && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    openReviewDialog(app, applicantId, "client")
                                  }
                                >
                                  Leave Review
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report Issue</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Reason</Label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report reason" />
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
                <Label className="mb-2 block">Description</Label>
                <Textarea
                  placeholder="Briefly explain the issue"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button className="w-full" onClick={handleSubmitReport}>
                Submit Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Leave Review</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Comment</Label>
                <Textarea
                  placeholder="Write a short review"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>

              <Button className="w-full" onClick={handleSubmitReview}>
                Submit Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}