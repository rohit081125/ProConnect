import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/lib/dummy-data";
import { X, Plus, Briefcase } from "lucide-react";

const addWorkSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  detailedDescription: z.string().min(20, "Detailed description must be at least 20 characters"),
  budgetMin: z.string().min(1, "Budget min is required").refine(v => Number(v) > 0, "Must be positive"),
  budgetMax: z.string().min(1, "Budget max is required").refine(v => Number(v) > 0, "Must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
  urgency: z.enum(["low", "medium", "high"]),
  workType: z.enum(["remote", "onsite", "hybrid"]),
  location: z.string().optional(),
});

type AddWorkValues = z.infer<typeof addWorkSchema>;

export default function AddWork() {
  const [, setLocation] = useLocation();
  const { addWorkPost, currentUser } = useStore();
  const { toast } = useToast();
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<AddWorkValues>({
    resolver: zodResolver(addWorkSchema),
    defaultValues: {
      title: "", category: "", shortDescription: "", detailedDescription: "",
      budgetMin: "", budgetMax: "", deadline: "", urgency: "medium", workType: "remote", location: "",
    },
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const onSubmit = (values: AddWorkValues) => {
    if (skills.length === 0) {
      toast({ title: "Please add at least one required skill", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addWorkPost({
        title: values.title,
        category: values.category,
        shortDescription: values.shortDescription,
        detailedDescription: values.detailedDescription,
        skills,
        budgetMin: Number(values.budgetMin),
        budgetMax: Number(values.budgetMax),
        deadline: values.deadline,
        urgency: values.urgency,
        workType: values.workType,
        location: values.location || "Remote",
        postedBy: currentUser!.id,
      });
      toast({ title: "Work posted successfully!" });
      setLocation("/home");
    }, 500);
  };

  return (
    <div className="flex-1 overflow-auto pb-20">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-add-work-title">Post New Work</h1>
            <p className="text-xs text-muted-foreground">Find skilled professionals for your project</p>
          </div>
        </div>

        <Card className="overflow-visible">
          <CardContent className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl><Input placeholder="e.g. Build a React Dashboard" {...field} data-testid="input-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="shortDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl><Input placeholder="One-liner about the work" {...field} data-testid="input-short-desc" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="detailedDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description *</FormLabel>
                    <FormControl><Textarea placeholder="Describe the work in detail, requirements, deliverables..." {...field} rows={4} data-testid="input-detailed-desc" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-1.5">
                  <FormLabel>Required Skills *</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      data-testid="input-skill"
                    />
                    <Button type="button" size="icon" variant="secondary" onClick={addSkill} data-testid="button-add-skill">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills.map(s => (
                        <Badge key={s} variant="secondary" className="gap-1">
                          {s}
                          <button type="button" onClick={() => setSkills(skills.filter(sk => sk !== s))} data-testid={`button-remove-skill-${s}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="budgetMin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Min ($) *</FormLabel>
                      <FormControl><Input type="number" placeholder="500" {...field} data-testid="input-budget-min" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="budgetMax" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Max ($) *</FormLabel>
                      <FormControl><Input type="number" placeholder="5000" {...field} data-testid="input-budget-max" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="deadline" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline *</FormLabel>
                    <FormControl><Input type="date" {...field} data-testid="input-deadline" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="urgency" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-urgency"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="workType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-work-type"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="Remote or city/country" {...field} data-testid="input-location" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={loading} data-testid="button-post-work">
                  {loading ? "Posting..." : "Post Work"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
