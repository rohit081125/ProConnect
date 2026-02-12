import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Star, MapPin, Briefcase, Calendar, ExternalLink, Edit, X, Plus, LogOut } from "lucide-react";
import { useLocation } from "wouter";

const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(1, "Bio is required"),
  location: z.string().min(1, "Location is required"),
  education: z.string().optional(),
  experience: z.string().optional(),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { currentUser, reviews, workPosts, applications, getUserById, updateProfile, logout } = useStore();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [editSkillInput, setEditSkillInput] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editPortfolioInput, setEditPortfolioInput] = useState("");
  const [editPortfolio, setEditPortfolio] = useState<string[]>([]);
  const [editSocialInput, setEditSocialInput] = useState("");
  const [editSocial, setEditSocial] = useState<string[]>([]);

  const editForm = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: "", bio: "", location: "", education: "", experience: "" },
  });

  if (!currentUser) return null;

  const userReviews = reviews.filter(r => r.toUserId === currentUser.id);
  const userWorks = workPosts.filter(w => w.postedBy === currentUser.id);
  const completedApps = applications.filter(a => a.applicantId === currentUser.id && a.status === "completed");

  const openEdit = () => {
    editForm.reset({
      name: currentUser.name,
      bio: currentUser.bio,
      location: currentUser.location,
      education: currentUser.education,
      experience: currentUser.experience,
    });
    setEditSkills([...currentUser.skills]);
    setEditPortfolio([...currentUser.portfolioLinks]);
    setEditSocial([...currentUser.socialLinks]);
    setShowEdit(true);
  };

  const saveEdit = (values: EditProfileValues) => {
    updateProfile({
      name: values.name,
      bio: values.bio,
      location: values.location,
      skills: editSkills,
      portfolioLinks: editPortfolio,
      socialLinks: editSocial,
      education: values.education || "",
      experience: values.experience || "",
    });
    setShowEdit(false);
    toast({ title: "Profile updated!" });
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const addEditSkill = () => {
    const s = editSkillInput.trim();
    if (s && !editSkills.includes(s)) { setEditSkills([...editSkills, s]); setEditSkillInput(""); }
  };
  const addEditPortfolio = () => {
    const l = editPortfolioInput.trim();
    if (l) { setEditPortfolio([...editPortfolio, l]); setEditPortfolioInput(""); }
  };
  const addEditSocial = () => {
    const l = editSocialInput.trim();
    if (l) { setEditSocial([...editSocial, l]); setEditSocialInput(""); }
  };

  return (
    <div className="flex-1 overflow-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Card className="overflow-visible mb-4">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {currentUser.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="text-lg font-bold" data-testid="text-profile-name">{currentUser.name}</h1>
                    <p className="text-sm text-muted-foreground" data-testid="text-profile-username">@{currentUser.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={openEdit} data-testid="button-edit-profile">
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2" data-testid="text-profile-bio">{currentUser.bio || "No bio yet"}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  {currentUser.location && (
                    <div className="flex items-center gap-1" data-testid="text-profile-location">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{currentUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1" data-testid="text-profile-rating">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    <span>{currentUser.rating} ({currentUser.totalRatings} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1" data-testid="text-profile-completed">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{currentUser.completedWorks} completed</span>
                  </div>
                  <div className="flex items-center gap-1" data-testid="text-profile-joined">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {currentUser.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about">
          <TabsList className="w-full">
            <TabsTrigger value="about" className="flex-1" data-testid="tab-about">About</TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1" data-testid="tab-portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1" data-testid="tab-activity">Activity</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1" data-testid="tab-reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 space-y-4">
            <Card className="overflow-visible">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.skills.length > 0 ? currentUser.skills.map(s => (
                    <Badge key={s} variant="secondary" data-testid={`badge-skill-${s}`}>{s}</Badge>
                  )) : <p className="text-sm text-muted-foreground">No skills added yet</p>}
                </div>
              </CardContent>
            </Card>
            {currentUser.education && (
              <Card className="overflow-visible">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1">Education</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-education">{currentUser.education}</p>
                </CardContent>
              </Card>
            )}
            {currentUser.experience && (
              <Card className="overflow-visible">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1">Experience</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-experience">{currentUser.experience}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4">
            <Card className="overflow-visible">
              <CardContent className="p-4">
                {currentUser.portfolioLinks.length > 0 ? (
                  <div className="space-y-2">
                    {currentUser.portfolioLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md" data-testid={`link-portfolio-${i}`}>
                        <ExternalLink className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm text-primary truncate">{link}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No portfolio links added yet</p>
                )}
                {currentUser.socialLinks.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm mb-2">Social Links</h3>
                    <div className="space-y-2">
                      {currentUser.socialLinks.map((link, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md" data-testid={`link-social-${i}`}>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">{link}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card className="overflow-visible">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">Posted Work ({userWorks.length})</h3>
                {userWorks.length > 0 ? (
                  <div className="space-y-2">
                    {userWorks.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md gap-2" data-testid={`activity-work-${w.id}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{w.title}</p>
                          <p className="text-xs text-muted-foreground">{w.category} - {w.postedDate}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">${w.budgetMin}-${w.budgetMax}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No work posted yet</p>}

                <h3 className="font-semibold text-sm mt-4 mb-3">Completed Work ({completedApps.length})</h3>
                {completedApps.length > 0 ? (
                  <div className="space-y-2">
                    {completedApps.map(app => {
                      const work = workPosts.find(w => w.id === app.workId);
                      return (
                        <div key={app.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md gap-2" data-testid={`activity-completed-${app.id}`}>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{work?.title || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">${app.counterPrice.toLocaleString()}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs shrink-0">Completed</Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No completed work yet</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            {userReviews.length > 0 ? (
              <div className="space-y-3">
                {userReviews.map(r => {
                  const reviewer = getUserById(r.fromUserId);
                  return (
                    <Card key={r.id} className="overflow-visible" data-testid={`card-review-${r.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {reviewer?.name.split(" ").map(n => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium" data-testid={`text-reviewer-${r.id}`}>{reviewer?.name || "Unknown"}</span>
                          <div className="flex items-center gap-0.5 ml-auto">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`text-review-comment-${r.id}`}>{r.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">{r.date}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="overflow-visible">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground py-4">No reviews yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(saveEdit)} className="space-y-4">
                <FormField control={editForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl><Textarea {...field} rows={3} data-testid="input-edit-bio" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-location" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-1.5">
                  <FormLabel>Skills</FormLabel>
                  <div className="flex gap-2">
                    <Input placeholder="Add a skill..." value={editSkillInput} onChange={e => setEditSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addEditSkill(); } }} data-testid="input-edit-skill" />
                    <Button type="button" size="icon" variant="secondary" onClick={addEditSkill} data-testid="button-add-edit-skill">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {editSkills.map(s => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <button type="button" onClick={() => setEditSkills(editSkills.filter(sk => sk !== s))} data-testid={`button-remove-edit-skill-${s}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <FormLabel>Portfolio Links</FormLabel>
                  <div className="flex gap-2">
                    <Input placeholder="https://..." value={editPortfolioInput} onChange={e => setEditPortfolioInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addEditPortfolio(); } }} data-testid="input-edit-portfolio" />
                    <Button type="button" size="icon" variant="secondary" onClick={addEditPortfolio} data-testid="button-add-edit-portfolio">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {editPortfolio.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-muted px-3 py-1.5 rounded-md mt-1" data-testid={`edit-portfolio-link-${i}`}>
                      <span className="truncate text-muted-foreground">{l}</span>
                      <button type="button" onClick={() => setEditPortfolio(editPortfolio.filter((_, idx) => idx !== i))} data-testid={`button-remove-edit-portfolio-${i}`}>
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <FormLabel>Social Links</FormLabel>
                  <div className="flex gap-2">
                    <Input placeholder="https://..." value={editSocialInput} onChange={e => setEditSocialInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addEditSocial(); } }} data-testid="input-edit-social" />
                    <Button type="button" size="icon" variant="secondary" onClick={addEditSocial} data-testid="button-add-edit-social">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {editSocial.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-muted px-3 py-1.5 rounded-md mt-1" data-testid={`edit-social-link-${i}`}>
                      <span className="truncate text-muted-foreground">{l}</span>
                      <button type="button" onClick={() => setEditSocial(editSocial.filter((_, idx) => idx !== i))} data-testid={`button-remove-edit-social-${i}`}>
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                <FormField control={editForm.control} name="education" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-education" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="experience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl><Textarea {...field} rows={2} data-testid="input-edit-experience" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" data-testid="button-save-edit">
                  Save Changes
                </Button>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
