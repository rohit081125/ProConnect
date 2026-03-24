import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Star,
  MapPin,
  Briefcase,
  Calendar,
  ExternalLink,
  Edit,
  X,
  Plus,
  LogOut,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  updateUserProfile,
  uploadProfileImage,
  getReviewSummaryByUser,
  getUserProfile,
} from "@/lib/api";

const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
});

function StatItem({ icon: Icon, children, testId, star = false }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border bg-background/70 px-3 py-2 text-sm text-muted-foreground"
      data-testid={testId}
    >
      <Icon
        className={`h-4 w-4 ${star ? "fill-yellow-500 text-yellow-500" : ""}`}
      />
      <span>{children}</span>
    </div>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <Card className={`rounded-3xl border shadow-sm ${className}`}>
      <CardContent className="p-5 md:p-6">
        <h3 className="mb-4 text-base font-semibold tracking-tight">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

function getSafeUserId(user) {
  return user?._id || user?.id || user?.userId || "";
}

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

function formatReviewDate(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString();
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { currentUser, workPosts = [], applications = [], logout } = useStore();
  const store = useStore();
  const { toast } = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [editSkillInput, setEditSkillInput] = useState("");
  const [editSkills, setEditSkills] = useState([]);
  const [editPortfolioInput, setEditPortfolioInput] = useState("");
  const [editPortfolio, setEditPortfolio] = useState([]);
  const [editSocialInput, setEditSocialInput] = useState("");
  const [editSocial, setEditSocial] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [reviewData, setReviewData] = useState({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewerMap, setReviewerMap] = useState({});

  const editForm = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      location: "",
      education: "",
      experience: "",
    },
  });

  if (!currentUser) {
    return (
      <div className="flex-1 px-4 py-10 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-3xl border shadow-sm">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold">No profile found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Please log in again to view your profile.
              </p>
              <Button
                className="mt-5 rounded-xl"
                onClick={() => setLocation("/login")}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userId = getSafeUserId(currentUser);
  const safeName = currentUser.name || "User";
  const safeEmail = currentUser.email || "";
  const safeUsername =
    currentUser.username ||
    (safeEmail
      ? safeEmail.split("@")[0]
      : safeName.toLowerCase().replace(/\s+/g, ""));
  const safeBio = currentUser.bio || "";
  const safeLocation = currentUser.location || "";
  const safeEducation = currentUser.education || "";
  const safeExperience = currentUser.experience || "";
  const safeSkills = Array.isArray(currentUser.skills) ? currentUser.skills : [];
  const safePortfolioLinks = Array.isArray(currentUser.portfolioLinks)
    ? currentUser.portfolioLinks
    : [];
  const safeSocialLinks = Array.isArray(currentUser.socialLinks)
    ? currentUser.socialLinks
    : [];
  const safeProfileImage = currentUser.profileImage || "";
  const safeCompletedWorks = Number(currentUser.completedWorks || 0);
  const safeJoinedDate =
    currentUser.joinedDate ||
    currentUser.createdAt?.split?.("T")?.[0] ||
    "Recently";

  const initials = useMemo(() => getInitials(safeName), [safeName]);

  const userWorks = workPosts.filter((w) => w.postedBy === userId);

  const completedApps = applications.filter(
    (a) => a.applicantId === userId && a.status === "completed"
  );

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);

        const data = await getReviewSummaryByUser(userId);
        const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

        setReviewData({
          reviews,
          averageRating: Number(data?.averageRating || 0),
          totalReviews: Number(data?.totalReviews || 0),
        });

        const uniqueReviewerIds = [
          ...new Set(reviews.map((review) => review.reviewerId).filter(Boolean)),
        ];

        const reviewerEntries = await Promise.all(
          uniqueReviewerIds.map(async (reviewerId) => {
            try {
              const userResponse = await getUserProfile(reviewerId);
              const reviewer = userResponse?.data || userResponse || null;
              return [reviewerId, reviewer];
            } catch (error) {
              return [reviewerId, null];
            }
          })
        );

        setReviewerMap(Object.fromEntries(reviewerEntries));
      } catch (error) {
        console.error("Failed to load review summary:", error);
        setReviewData({
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
        });
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const openEdit = () => {
    editForm.reset({
      name: safeName,
      bio: safeBio,
      location: safeLocation,
      education: safeEducation,
      experience: safeExperience,
    });

    setEditSkills([...safeSkills]);
    setEditPortfolio([...safePortfolioLinks]);
    setEditSocial([...safeSocialLinks]);
    setSelectedImage(null);
    setImagePreview(safeProfileImage);
    setShowEdit(true);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file only.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveEdit = async (values) => {
    if (!userId) {
      toast({
        title: "User not found",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: values.name,
        bio: values.bio || "",
        location: values.location || "",
        education: values.education || "",
        experience: values.experience || "",
        skills: editSkills,
        portfolioLinks: editPortfolio,
        socialLinks: editSocial,
      };

      const profileResponse = await updateUserProfile(userId, payload);

      let updatedUser =
        profileResponse.user ||
        profileResponse.data ||
        profileResponse.profile ||
        profileResponse || {
          ...currentUser,
          ...payload,
        };

      if (selectedImage) {
        const imageResponse = await uploadProfileImage(userId, selectedImage);

        updatedUser =
          imageResponse.user ||
          imageResponse.data ||
          imageResponse.profile ||
          imageResponse || {
            ...updatedUser,
            profileImage: updatedUser.profileImage,
          };
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (typeof store.setUser === "function") {
        store.setUser(updatedUser);
      }

      setShowEdit(false);

      toast({
        title: "Profile updated",
        description: "Your profile details were saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const addEditSkill = () => {
    const value = editSkillInput.trim();
    if (!value) return;
    if (editSkills.includes(value)) return;

    setEditSkills((prev) => [...prev, value]);
    setEditSkillInput("");
  };

  const addEditPortfolio = () => {
    const value = editPortfolioInput.trim();
    if (!value) return;

    setEditPortfolio((prev) => [...prev, value]);
    setEditPortfolioInput("");
  };

  const addEditSocial = () => {
    const value = editSocialInput.trim();
    if (!value) return;

    setEditSocial((prev) => [...prev, value]);
    setEditSocialInput("");
  };

  return (
    <div className="flex-1 overflow-auto bg-background pb-24">
      <div className="w-full px-4 py-5 md:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <Card className="overflow-hidden rounded-3xl border shadow-sm">
                <div className="h-28 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
                <CardContent className="relative p-5 md:p-6">
                  <div className="-mt-16 flex flex-col items-start">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-md md:h-32 md:w-32">
                      <AvatarImage src={safeProfileImage} alt={safeName} />
                      <AvatarFallback className="bg-primary/10 text-3xl font-semibold text-primary">
                        {initials || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="mt-4 w-full">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h1
                            className="truncate text-2xl font-semibold tracking-tight"
                            data-testid="text-profile-name"
                          >
                            {safeName}
                          </h1>
                          <p
                            className="mt-1 text-sm text-muted-foreground"
                            data-testid="text-profile-username"
                          >
                            @{safeUsername}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={openEdit}
                            data-testid="button-edit-profile"
                            className="rounded-xl"
                          >
                            <Edit className="mr-1.5 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleLogout}
                            data-testid="button-logout"
                            className="rounded-xl"
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p
                        className="mt-4 text-sm leading-relaxed text-muted-foreground"
                        data-testid="text-profile-bio"
                      >
                        {safeBio || "No bio yet"}
                      </p>

                      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {safeLocation && (
                          <StatItem icon={MapPin} testId="text-profile-location">
                            {safeLocation}
                          </StatItem>
                        )}

                        <StatItem icon={Star} star testId="text-profile-rating">
                          {reviewData.averageRating.toFixed(1)} (
                          {reviewData.totalReviews} reviews)
                        </StatItem>

                        <StatItem
                          icon={Briefcase}
                          testId="text-profile-completed"
                        >
                          {safeCompletedWorks} completed
                        </StatItem>

                        <StatItem icon={Calendar} testId="text-profile-joined">
                          Joined {safeJoinedDate}
                        </StatItem>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-8">
              <Tabs defaultValue="about">
                <TabsList className="grid w-full grid-cols-4 rounded-2xl">
                  <TabsTrigger value="about" className="rounded-xl">
                    About
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="rounded-xl">
                    Portfolio
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-xl">
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-xl">
                    Reviews
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-5 space-y-4">
                  <SectionCard title="Skills">
                    <div className="flex flex-wrap gap-2">
                      {safeSkills.length > 0 ? (
                        safeSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="rounded-full px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  </SectionCard>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <SectionCard
                      title="Education"
                      className={!safeEducation ? "opacity-80" : ""}
                    >
                      <p
                        className="text-sm leading-relaxed text-muted-foreground"
                        data-testid="text-education"
                      >
                        {safeEducation || "No education details added yet"}
                      </p>
                    </SectionCard>

                    <SectionCard
                      title="Experience"
                      className={!safeExperience ? "opacity-80" : ""}
                    >
                      <p
                        className="text-sm leading-relaxed text-muted-foreground"
                        data-testid="text-experience"
                      >
                        {safeExperience || "No experience details added yet"}
                      </p>
                    </SectionCard>
                  </div>
                </TabsContent>

                <TabsContent value="portfolio" className="mt-5 space-y-4">
                  <SectionCard title="Portfolio Links">
                    {safePortfolioLinks.length > 0 ? (
                      <div className="space-y-3">
                        {safePortfolioLinks.map((link, index) => (
                          <div
                            key={`${link}-${index}`}
                            className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3"
                          >
                            <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-sm text-primary hover:underline"
                            >
                              {link}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No portfolio links added yet
                      </p>
                    )}
                  </SectionCard>

                  <SectionCard title="Social Links">
                    {safeSocialLinks.length > 0 ? (
                      <div className="space-y-3">
                        {safeSocialLinks.map((link, index) => (
                          <div
                            key={`${link}-${index}`}
                            className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3"
                          >
                            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-sm text-muted-foreground hover:underline"
                            >
                              {link}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No social links added yet
                      </p>
                    )}
                  </SectionCard>
                </TabsContent>

                <TabsContent value="activity" className="mt-5 space-y-4">
                  <SectionCard title={`Posted Work (${userWorks.length})`}>
                    {userWorks.length > 0 ? (
                      <div className="space-y-3">
                        {userWorks.map((work) => (
                          <div
                            key={work.id || work._id}
                            className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/40 p-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {work.title || "Untitled Work"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {work.category || "General"} -{" "}
                                {work.postedDate || "Recently"}
                              </p>
                            </div>

                            <Badge variant="outline" className="shrink-0 text-xs">
                              ${work.budget || 0}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No work posted yet
                      </p>
                    )}
                  </SectionCard>

                  <SectionCard title={`Completed Work (${completedApps.length})`}>
                    {completedApps.length > 0 ? (
                      <div className="space-y-3">
                        {completedApps.map((app) => {
                          const work = workPosts.find(
                            (w) => (w.id || w._id) === app.workId
                          );

                          return (
                            <div
                              key={app.id || app._id}
                              className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/40 p-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {work?.title || "Unknown"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ₹{Number(app.counterPrice || 0).toLocaleString()}
                                </p>
                              </div>

                              <Badge variant="secondary" className="shrink-0 text-xs">
                                Completed
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No completed work yet
                      </p>
                    )}
                  </SectionCard>
                </TabsContent>

                <TabsContent value="reviews" className="mt-5">
                  {loadingReviews ? (
                    <Card className="rounded-3xl border shadow-sm">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Loading reviews...
                        </p>
                      </CardContent>
                    </Card>
                  ) : reviewData.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviewData.reviews.map((review) => {
                        const reviewer = reviewerMap[review.reviewerId];
                        const reviewerName = reviewer?.name || "Unknown";
                        const reviewerImage = reviewer?.profileImage || "";
                        const reviewerInitials = getInitials(reviewerName);

                        return (
                          <Card
                            key={review.id || review._id}
                            className="rounded-3xl border shadow-sm"
                          >
                            <CardContent className="p-5">
                              <div className="mb-3 flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={reviewerImage}
                                    alt={reviewerName}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                    {reviewerInitials}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                  <p className="text-sm font-medium">
                                    {reviewerName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatReviewDate(review.createdAt)}
                                  </p>
                                </div>

                                <div className="ml-auto flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3.5 w-3.5 ${
                                        star <= Number(review.rating || 0)
                                          ? "fill-yellow-500 text-yellow-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {review.comment || "No comment"}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="rounded-3xl border shadow-sm">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          No reviews yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-h-[88vh] max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[72vh] pr-4">
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(saveEdit)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <FormLabel>Profile Image</FormLabel>

                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 ring-2 ring-border">
                      <AvatarImage
                        src={imagePreview || safeProfileImage}
                        alt={safeName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                    />
                  </div>
                </div>

                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          data-testid="input-edit-bio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-1.5">
                  <FormLabel>Skills</FormLabel>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={editSkillInput}
                      onChange={(e) => setEditSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEditSkill();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={addEditSkill}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {editSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() =>
                            setEditSkills((prev) =>
                              prev.filter((item) => item !== skill)
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <FormLabel>Portfolio Links</FormLabel>

                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={editPortfolioInput}
                      onChange={(e) => setEditPortfolioInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEditPortfolio();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={addEditPortfolio}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {editPortfolio.map((link, index) => (
                    <div
                      key={`${link}-${index}`}
                      className="mt-1 flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {link}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditPortfolio((prev) =>
                            prev.filter((_, idx) => idx !== index)
                          )
                        }
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <FormLabel>Social Links</FormLabel>

                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={editSocialInput}
                      onChange={(e) => setEditSocialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEditSocial();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={addEditSocial}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {editSocial.map((link, index) => (
                    <div
                      key={`${link}-${index}`}
                      className="mt-1 flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {link}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditSocial((prev) =>
                            prev.filter((_, idx) => idx !== index)
                          )
                        }
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={editForm.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-education" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          data-testid="input-edit-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={saving}
                  data-testid="button-save-edit"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}