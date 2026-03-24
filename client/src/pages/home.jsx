import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { WorkCard } from "@/components/work-card";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  getAllWorks,
  getUserProfile,
  createApplication,
  getApplicationsByApplicant,
} from "@/lib/api";
import { Search, SlidersHorizontal, X, Plus } from "lucide-react";

const categories = [
  "Web Development",
  "App Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Video Editing",
  "Marketing",
  "Data Entry",
  "Other",
];

const applySchema = z.object({
  proposalMessage: z.string().min(10, "Proposal must be at least 10 characters"),
  referenceLink: z.string().optional(),
  counterPrice: z
    .string()
    .optional()
    .refine((v) => !v || Number(v) > 0, "Must be positive"),
});

function parseBudgetRange(value) {
  if (!value.trim()) {
    return { min: null, max: null };
  }

  const cleaned = value.replace(/\s+/g, "");
  const parts = cleaned.split("-");

  if (parts.length === 1) {
    const num = Number(parts[0]);
    if (Number.isNaN(num)) return { min: null, max: null };
    return { min: num, max: num };
  }

  if (parts.length === 2) {
    const min = Number(parts[0]);
    const max = Number(parts[1]);

    return {
      min: Number.isNaN(min) ? null : min,
      max: Number.isNaN(max) ? null : max,
    };
  }

  return { min: null, max: null };
}

export default function Home() {
  const { currentUser } = useStore();
  const { toast } = useToast();

  const [workPosts, setWorkPosts] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [projectLevel, setProjectLevel] = useState("all");
  const [budgetRange, setBudgetRange] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [applyWorkId, setApplyWorkId] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [skillsUsed, setSkillsUsed] = useState([]);
  const [appliedWorkIds, setAppliedWorkIds] = useState(new Set());
  const [submittingApplication, setSubmittingApplication] = useState(false);

  const currentUserId = currentUser?.id || currentUser?._id || "";

  const applyForm = useForm({
    resolver: zodResolver(applySchema),
    defaultValues: {
      proposalMessage: "",
      referenceLink: "",
      counterPrice: "",
    },
  });

  useEffect(() => {
    loadWorks();
  }, []);

  useEffect(() => {
    loadAppliedWorks();
  }, [currentUserId]);

  const loadWorks = async () => {
    try {
      setLoadingWorks(true);

      const worksResponse = await getAllWorks();
      const works = Array.isArray(worksResponse)
        ? worksResponse
        : worksResponse?.data || [];

      const uniqueUserIds = [
        ...new Set(works.map((w) => w.postedBy).filter(Boolean)),
      ];

      const userMap = {};

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const userResponse = await getUserProfile(userId);
            const user = userResponse?.data || userResponse;
            userMap[userId] = user;
          } catch (error) {
            userMap[userId] = null;
          }
        })
      );

      const normalizedWorks = works.map((work) => ({
        ...work,
        id: work.id || work._id,
        postedDate: work.createdAt,
        poster: userMap[work.postedBy] || null,
      }));

      setWorkPosts(normalizedWorks);
    } catch (error) {
      toast({
        title: "Failed to load work posts",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoadingWorks(false);
    }
  };

  const loadAppliedWorks = async () => {
    try {
      if (!currentUserId) {
        setAppliedWorkIds(new Set());
        setLoadingApplications(false);
        return;
      }

      setLoadingApplications(true);

      const applicationsResponse = await getApplicationsByApplicant(currentUserId);
      const applications = Array.isArray(applicationsResponse)
        ? applicationsResponse
        : applicationsResponse?.data || [];

      const ids = new Set(
        applications
          .map((app) => app.workId)
          .filter(Boolean)
      );

      setAppliedWorkIds(ids);
    } catch (error) {
      console.error("Failed to load applied works:", error);
      setAppliedWorkIds(new Set());
    } finally {
      setLoadingApplications(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...workPosts];
    const { min, max } = parseBudgetRange(budgetRange);

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter(
        (w) =>
          w.title?.toLowerCase().includes(q) ||
          w.shortDescription?.toLowerCase().includes(q) ||
          w.fullDescription?.toLowerCase().includes(q) ||
          w.category?.toLowerCase().includes(q) ||
          w.projectLevel?.toLowerCase().includes(q) ||
          w.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (category !== "all") {
      result = result.filter((w) => w.category === category);
    }

    if (projectLevel !== "all") {
      result = result.filter(
        (w) => (w.projectLevel || "").toLowerCase() === projectLevel.toLowerCase()
      );
    }

    if (min !== null || max !== null) {
      result = result.filter((w) => {
        const budget = Number(w.budget || 0);

        if (min !== null && max !== null) return budget >= min && budget <= max;
        if (min !== null) return budget >= min;
        if (max !== null) return budget <= max;

        return true;
      });
    }

    switch (sort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.postedDate || 0).getTime() -
            new Date(a.postedDate || 0).getTime()
        );
        break;

      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.postedDate || 0).getTime() -
            new Date(b.postedDate || 0).getTime()
        );
        break;

      case "high-budget":
        result.sort((a, b) => Number(b.budget || 0) - Number(a.budget || 0));
        break;

      case "low-budget":
        result.sort((a, b) => Number(a.budget || 0) - Number(b.budget || 0));
        break;

      case "deadline":
        result.sort(
          (a, b) =>
            new Date(a.deadline || 0).getTime() -
            new Date(b.deadline || 0).getTime()
        );
        break;

      default:
        break;
    }

    return result;
  }, [workPosts, search, category, projectLevel, budgetRange, sort]);

  const handleApply = (workId) => {
    if (!currentUserId) {
      toast({
        title: "Please login first",
        variant: "destructive",
      });
      return;
    }

    if (appliedWorkIds.has(workId)) {
      toast({
        title: "You have already applied to this work",
        variant: "destructive",
      });
      return;
    }

    applyForm.reset({
      proposalMessage: "",
      referenceLink: "",
      counterPrice: "",
    });
    setSkillsUsed([]);
    setSkillInput("");
    setApplyWorkId(workId);
  };

  const submitApplication = async (values) => {
    if (!applyWorkId || !currentUserId) return;

    try {
      setSubmittingApplication(true);

      await createApplication({
        workId: applyWorkId,
        applicantId: currentUserId,
        proposalMessage: values.proposalMessage,
        referenceLink: values.referenceLink || "",
        skillsUsed,
        counterPrice: values.counterPrice ? Number(values.counterPrice) : null,
      });

      setAppliedWorkIds((prev) => {
        const updated = new Set(prev);
        updated.add(applyWorkId);
        return updated;
      });

      toast({
        title: "Application submitted successfully!",
      });

      setApplyWorkId(null);
      applyForm.reset({
        proposalMessage: "",
        referenceLink: "",
        counterPrice: "",
      });
      setSkillsUsed([]);
      setSkillInput("");
    } catch (error) {
      toast({
        title: "Failed to submit application",
        description:
          error?.message || "Something went wrong while submitting application",
        variant: "destructive",
      });
    } finally {
      setSubmittingApplication(false);
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skillsUsed.includes(skill)) {
      setSkillsUsed((prev) => [...prev, skill]);
      setSkillInput("");
    }
  };

  const applyWork = applyWorkId
    ? workPosts.find((w) => (w.id || w._id) === applyWorkId)
    : null;

  const hasActiveFilters =
    search || category !== "all" || projectLevel !== "all" || budgetRange;

  return (
    <div className="flex-1 overflow-auto pb-24">
      <div className="w-full px-4 py-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by skill, keyword, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background text-foreground placeholder:text-muted-foreground"
              data-testid="input-search"
            />
          </div>

          <Button
            size="icon"
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Project Level</Label>
              <Select value={projectLevel} onValueChange={setProjectLevel}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Budget Range</Label>
              <Input
                type="text"
                placeholder="500-3000"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Sort By</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="high-budget">Highest Budget</SelectItem>
                  <SelectItem value="low-budget">Lowest Budget</SelectItem>
                  <SelectItem value="deadline">Nearest Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {filtered.length} work{filtered.length !== 1 ? "s" : ""} found
          </p>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setProjectLevel("all");
                setBudgetRange("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {loadingWorks || loadingApplications ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading work posts...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">No work posts found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              filtered.map((w) => {
                const workId = w.id || w._id;
                const isApplied = appliedWorkIds.has(workId);

                return (
                  <WorkCard
                    key={workId}
                    work={w}
                    onApply={handleApply}
                    isApplied={isApplied}
                  />
                );
              })
            )}
          </div>
        )}
      </div>

      <Dialog open={!!applyWorkId} onOpenChange={(open) => !open && setApplyWorkId(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply to Work</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] pr-4">
            {applyWork && (
              <div className="mb-4 border-b pb-3">
                <h3 className="text-sm font-semibold">{applyWork.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Budget: ${applyWork.budget}
                </p>
              </div>
            )}

            <Form {...applyForm}>
              <form
                onSubmit={applyForm.handleSubmit(submitApplication)}
                className="space-y-4"
              >
                <FormField
                  control={applyForm.control}
                  name="proposalMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposal Message *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why you are a great fit..."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={applyForm.control}
                  name="referenceLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Project (link)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/your-project"
                          {...field}
                          className="bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-1.5">
                  <FormLabel>Skills Used</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                    />

                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={addSkill}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {skillsUsed.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {skillsUsed.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1">
                          {s}
                          <button
                            type="button"
                            onClick={() =>
                              setSkillsUsed((prev) => prev.filter((sk) => sk !== s))
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={applyForm.control}
                  name="counterPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Price (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="$0"
                          {...field}
                          className="bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submittingApplication}
                >
                  {submittingApplication ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}