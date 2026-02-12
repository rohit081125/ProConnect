import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, CheckCircle, FileText, AlertTriangle, DollarSign } from "lucide-react";

const reportReasons = [
  "Not completed", "Fake skills", "Poor quality", "Abuse", "Fraud", "Spam", "Miscommunication", "Other",
];

const completeSchema = z.object({
  reviewComment: z.string().min(1, "Please write a review"),
  reportReason: z.string().optional(),
  reportDescription: z.string().optional(),
});

type CompleteValues = z.infer<typeof completeSchema>;

export default function MyApplications() {
  const [, setLocation] = useLocation();
  const { currentUser, applications, workPosts, getUserById, acceptApplication, rejectApplication, completeWork, submitReport } = useStore();
  const { toast } = useToast();

  const [completeDialogApp, setCompleteDialogApp] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [showReport, setShowReport] = useState(false);

  const completeForm = useForm<CompleteValues>({
    resolver: zodResolver(completeSchema),
    defaultValues: { reviewComment: "", reportReason: "", reportDescription: "" },
  });

  const sentApplications = applications.filter(a => a.applicantId === currentUser?.id);
  const receivedApplications = applications.filter(a => {
    const work = workPosts.find(w => w.id === a.workId);
    return work?.postedBy === currentUser?.id;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
    completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  const openCompleteDialog = (appId: string) => {
    completeForm.reset();
    setRating(5);
    setShowReport(false);
    setCompleteDialogApp(appId);
  };

  const handleComplete = (values: CompleteValues) => {
    if (!completeDialogApp) return;
    completeWork(completeDialogApp, rating, values.reviewComment);

    if (showReport && values.reportReason) {
      const app = applications.find(a => a.id === completeDialogApp);
      const work = workPosts.find(w => w.id === app?.workId);
      const isPostOwner = work?.postedBy === currentUser?.id;
      submitReport({
        reporterId: currentUser!.id,
        reportedUserId: isPostOwner ? app!.applicantId : work!.postedBy,
        workId: app!.workId,
        reason: values.reportReason,
        description: values.reportDescription || "",
      });
    }

    toast({ title: "Work marked as completed and review submitted!" });
    setCompleteDialogApp(null);
  };

  return (
    <div className="flex-1 overflow-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-lg font-semibold mb-4" data-testid="text-my-applications-title">My Applications</h1>

        <Tabs defaultValue="sent">
          <TabsList className="w-full">
            <TabsTrigger value="sent" className="flex-1" data-testid="tab-sent">Sent ({sentApplications.length})</TabsTrigger>
            <TabsTrigger value="received" className="flex-1" data-testid="tab-received">Received ({receivedApplications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-4">
            {sentApplications.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-state-sent">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold">No applications sent</h3>
                <p className="text-sm text-muted-foreground mt-1">Browse the feed and apply to projects</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentApplications.map(app => {
                  const work = workPosts.find(w => w.id === app.workId);
                  const client = work ? getUserById(work.postedBy) : undefined;
                  return (
                    <Card key={app.id} className="overflow-visible" data-testid={`card-sent-${app.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm" data-testid={`text-sent-title-${app.id}`}>{work?.title || "Unknown Work"}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {client?.name.split(" ").map(n => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground" data-testid={`text-client-name-${app.id}`}>{client?.name || "Unknown"}</span>
                              {client && (
                                <div className="flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  <span className="text-xs text-muted-foreground">{client.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${statusColors[app.status]}`} data-testid={`status-sent-${app.id}`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span data-testid={`text-counter-price-${app.id}`}>${app.counterPrice.toLocaleString()}</span>
                          </div>
                          <span>Applied: {app.appliedDate}</span>
                        </div>
                        {app.status === "accepted" && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => setLocation("/messages")} data-testid={`button-message-${app.id}`}>
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />Message
                            </Button>
                            <Button size="sm" onClick={() => openCompleteDialog(app.id)} data-testid={`button-done-${app.id}`}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Mark as Done
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            {receivedApplications.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-state-received">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold">No applications received</h3>
                <p className="text-sm text-muted-foreground mt-1">Post work to start receiving applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedApplications.map(app => {
                  const work = workPosts.find(w => w.id === app.workId);
                  const applicant = getUserById(app.applicantId);
                  return (
                    <Card key={app.id} className="overflow-visible" data-testid={`card-received-${app.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm" data-testid={`text-received-title-${app.id}`}>{work?.title || "Unknown Work"}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-accent/10 text-accent">
                                  {applicant?.name.split(" ").map(n => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground" data-testid={`text-applicant-name-${app.id}`}>{applicant?.name || "Unknown"}</span>
                              {applicant && (
                                <div className="flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  <span className="text-xs text-muted-foreground">{applicant.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${statusColors[app.status]}`} data-testid={`status-received-${app.id}`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="mt-3 p-3 bg-muted/50 rounded-md">
                          <p className="text-sm" data-testid={`text-proposal-${app.id}`}>{app.proposalMessage}</p>
                          {app.referenceLink && (
                            <p className="text-xs text-primary mt-2 truncate" data-testid={`link-reference-${app.id}`}>{app.referenceLink}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Counter: ${app.counterPrice.toLocaleString()}</span>
                            <span>Time: {app.estimatedTime}</span>
                          </div>
                          {app.skillsUsed.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {app.skillsUsed.map(s => (
                                <Badge key={s} variant="outline" className="text-[10px]" data-testid={`badge-app-skill-${app.id}-${s}`}>{s}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {app.status === "pending" && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
                            <Button size="sm" onClick={() => { acceptApplication(app.id); toast({ title: "Application accepted!" }); }} data-testid={`button-accept-${app.id}`}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { rejectApplication(app.id); toast({ title: "Application rejected" }); }} data-testid={`button-reject-${app.id}`}>
                              Reject
                            </Button>
                          </div>
                        )}
                        {app.status === "accepted" && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => setLocation("/messages")} data-testid={`button-message-r-${app.id}`}>
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />Message
                            </Button>
                            <Button size="sm" onClick={() => openCompleteDialog(app.id)} data-testid={`button-done-r-${app.id}`}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Mark as Done
                            </Button>
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
      </div>

      <Dialog open={!!completeDialogApp} onOpenChange={open => !open && setCompleteDialogApp(null)}>
        <DialogContent className="max-w-md max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Complete Work</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            <Form {...completeForm}>
              <form onSubmit={completeForm.handleSubmit(handleComplete)} className="space-y-4">
                <div className="space-y-1.5">
                  <FormLabel>Rating</FormLabel>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="p-0.5" data-testid={`button-star-${star}`}>
                        <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                    <span className="text-sm text-muted-foreground ml-2" data-testid="text-rating-value">{rating}/5</span>
                  </div>
                </div>

                <FormField control={completeForm.control} name="reviewComment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl><Textarea placeholder="Share your experience working together..." {...field} rows={3} data-testid="input-review" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="border-t pt-4">
                  <button type="button" className="flex items-center gap-2 text-sm text-muted-foreground" onClick={() => setShowReport(!showReport)} data-testid="button-toggle-report">
                    <AlertTriangle className="h-4 w-4" />
                    {showReport ? "Hide report form" : "Report an issue (optional)"}
                  </button>

                  {showReport && (
                    <div className="mt-3 space-y-3">
                      <FormField control={completeForm.control} name="reportReason" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-report-reason"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reportReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={completeForm.control} name="reportDescription" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl><Textarea placeholder="Describe the issue..." {...field} rows={2} data-testid="input-report-desc" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button type="submit" className="flex-1" data-testid="button-submit-complete">Submit</Button>
                  <Button type="button" variant="outline" onClick={() => setCompleteDialogApp(null)} className="flex-1" data-testid="button-cancel-complete">Cancel</Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
