import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { WorkCard } from "@/components/work-card";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/lib/dummy-data";
import { Search, SlidersHorizontal, X, Plus } from "lucide-react";

const applySchema = z.object({
  proposalMessage: z.string().min(10, "Proposal must be at least 10 characters"),
  referenceLink: z.string().optional(),
  estimatedTime: z.string().min(1, "Estimated time is required"),
  counterPrice: z.string().min(1, "Counter price is required").refine(v => Number(v) > 0, "Must be positive"),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function Home() {
  const { workPosts, currentUser, applyToWork, applications } = useStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [applyWorkId, setApplyWorkId] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [skillsUsed, setSkillsUsed] = useState<string[]>([]);

  const applyForm = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { proposalMessage: "", referenceLink: "", estimatedTime: "", counterPrice: "" },
  });

  const filtered = useMemo(() => {
    let result = [...workPosts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.title.toLowerCase().includes(q) ||
        w.skills.some(s => s.toLowerCase().includes(q)) ||
        w.shortDescription.toLowerCase().includes(q)
      );
    }
    if (category && category !== "all") result = result.filter(w => w.category === category);
    if (budgetMin) result = result.filter(w => w.budgetMax >= Number(budgetMin));
    if (budgetMax) result = result.filter(w => w.budgetMin <= Number(budgetMax));
    switch (sort) {
      case "newest": result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime()); break;
      case "high-budget": result.sort((a, b) => b.budgetMax - a.budgetMax); break;
      case "low-budget": result.sort((a, b) => a.budgetMin - b.budgetMin); break;
      case "deadline": result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()); break;
    }
    return result;
  }, [workPosts, search, category, budgetMin, budgetMax, sort]);

  const handleApply = (workId: string) => {
    if (!currentUser) return;
    const existing = applications.find(a => a.workId === workId && a.applicantId === currentUser.id);
    if (existing) {
      toast({ title: "You have already applied to this work", variant: "destructive" });
      return;
    }
    applyForm.reset();
    setSkillsUsed([]);
    setApplyWorkId(workId);
  };

  const submitApplication = (values: ApplyValues) => {
    if (!applyWorkId) return;
    applyToWork({
      workId: applyWorkId,
      applicantId: currentUser!.id,
      proposalMessage: values.proposalMessage,
      referenceLink: values.referenceLink || "",
      skillsUsed,
      estimatedTime: values.estimatedTime,
      counterPrice: Number(values.counterPrice),
    });
    toast({ title: "Application submitted successfully!" });
    setApplyWorkId(null);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skillsUsed.includes(s)) {
      setSkillsUsed([...skillsUsed, s]);
      setSkillInput("");
    }
  };

  const applyWork = applyWorkId ? workPosts.find(w => w.id === applyWorkId) : null;

  return (
    <div className="flex-1 overflow-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by skill, keyword, or project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
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
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-md bg-muted/50">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-xs">Sort By</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger data-testid="select-sort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="high-budget">Highest Budget</SelectItem>
                  <SelectItem value="low-budget">Lowest Budget</SelectItem>
                  <SelectItem value="deadline">Nearest Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Budget Min</Label>
              <Input type="number" placeholder="$0" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} data-testid="input-budget-min" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Budget Max</Label>
              <Input type="number" placeholder="$10,000" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} data-testid="input-budget-max" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">{filtered.length} work{filtered.length !== 1 ? "s" : ""} found</p>
          {(search || category !== "all" || budgetMin || budgetMax) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategory("all"); setBudgetMin(""); setBudgetMax(""); }} data-testid="button-clear-filters">
              Clear filters
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state-works">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold">No work posts found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map(w => <WorkCard key={w.id} work={w} onApply={handleApply} />)
          )}
        </div>
      </div>

      <Dialog open={!!applyWorkId} onOpenChange={open => !open && setApplyWorkId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Apply to Work</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            {applyWork && (
              <div className="mb-4 pb-3 border-b">
                <h3 className="font-semibold text-sm" data-testid="text-apply-work-title">{applyWork.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Budget: ${applyWork.budgetMin} - ${applyWork.budgetMax}</p>
              </div>
            )}
            <Form {...applyForm}>
              <form onSubmit={applyForm.handleSubmit(submitApplication)} className="space-y-4">
                <FormField control={applyForm.control} name="proposalMessage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Message *</FormLabel>
                    <FormControl><Textarea placeholder="Explain why you are a great fit..." {...field} rows={4} data-testid="input-proposal" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={applyForm.control} name="referenceLink" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Project (link)</FormLabel>
                    <FormControl><Input placeholder="https://github.com/your-project" {...field} data-testid="input-reference" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="space-y-1.5">
                  <FormLabel>Skills Used</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      data-testid="input-apply-skill"
                    />
                    <Button type="button" size="icon" variant="secondary" onClick={addSkill} data-testid="button-add-apply-skill">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skillsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skillsUsed.map(s => (
                        <Badge key={s} variant="secondary" className="gap-1">
                          {s}
                          <button type="button" onClick={() => setSkillsUsed(skillsUsed.filter(sk => sk !== s))} data-testid={`button-remove-apply-skill-${s}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <FormField control={applyForm.control} name="estimatedTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Time *</FormLabel>
                    <FormControl><Input placeholder="e.g. 2 weeks" {...field} data-testid="input-estimated-time" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={applyForm.control} name="counterPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Price (Counter Offer) *</FormLabel>
                    <FormControl><Input type="number" placeholder="$0" {...field} data-testid="input-counter-price" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" data-testid="button-submit-application">
                  Submit Application
                </Button>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
