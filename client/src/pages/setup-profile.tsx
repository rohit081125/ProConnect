import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, UserCircle } from "lucide-react";

const setupSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
});

type SetupValues = z.infer<typeof setupSchema>;

export default function SetupProfile() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const userId = params.get("userId") || "";
  const { setupProfile } = useStore();
  const { toast } = useToast();

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioInput, setPortfolioInput] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { bio: "", location: "" },
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const addPortfolioLink = () => {
    const l = portfolioInput.trim();
    if (l) {
      setPortfolioLinks([...portfolioLinks, l]);
      setPortfolioInput("");
    }
  };

  const onSubmit = (values: SetupValues) => {
    if (skills.length === 0) {
      toast({ title: "Please add at least one skill", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setupProfile(userId, { bio: values.bio, location: values.location, skills, portfolioLinks });
      toast({ title: "Profile set up! Welcome to ProConnect." });
      setLocation("/home");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-center px-4">
          <span className="text-xl font-bold text-primary">Pro</span>
          <span className="text-xl font-bold text-accent">Connect</span>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <Card className="w-full max-w-lg overflow-visible">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-semibold" data-testid="text-setup-title">Set Up Your Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">Tell us about yourself so others can find you</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about your expertise and experience..." {...field} rows={3} data-testid="input-bio" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-1.5">
                  <FormLabel>Skills</FormLabel>
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

                <div className="space-y-1.5">
                  <FormLabel>Portfolio Links (optional)</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://yourportfolio.com"
                      value={portfolioInput}
                      onChange={e => setPortfolioInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPortfolioLink(); } }}
                      data-testid="input-portfolio"
                    />
                    <Button type="button" size="icon" variant="secondary" onClick={addPortfolioLink} data-testid="button-add-portfolio">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {portfolioLinks.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {portfolioLinks.map((l, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-muted px-3 py-1.5 rounded-md" data-testid={`portfolio-link-${i}`}>
                          <span className="truncate text-muted-foreground">{l}</span>
                          <button type="button" onClick={() => setPortfolioLinks(portfolioLinks.filter((_, idx) => idx !== i))} data-testid={`button-remove-portfolio-${i}`}>
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading} data-testid="button-save-profile">
                  {loading ? "Saving..." : "Save and Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
