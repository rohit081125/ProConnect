import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Shield, Zap, Target, TrendingUp, ArrowRight } from "lucide-react";

const features = [
  { icon: Briefcase, title: "Post & Find Work", desc: "Share your projects or find opportunities that match your skills. One platform, unlimited potential." },
  { icon: Users, title: "Skill-Based Connections", desc: "Connect with skilled professionals based on real capabilities, not just resumes." },
  { icon: Shield, title: "Trust System", desc: "Build your reputation through ratings, reviews, and verified project completions." },
  { icon: Zap, title: "Direct Negotiation", desc: "Set your terms, negotiate budgets, and agree on timelines directly with your counterpart." },
  { icon: Target, title: "Proof-Based Hiring", desc: "Evaluate candidates through portfolios, references, and demonstrated expertise." },
  { icon: TrendingUp, title: "Grow Your Network", desc: "Both hire and get hired. Build lasting professional relationships in the skill economy." },
];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 max-w-6xl mx-auto">
          <div className="flex items-center" data-testid="logo-landing">
            <span className="text-xl font-bold text-primary">Pro</span>
            <span className="text-xl font-bold text-accent">Connect</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/about")} data-testid="button-about">About</Button>
            <Button variant="outline" onClick={() => setLocation("/login")} data-testid="button-login-nav">Log In</Button>
            <Button onClick={() => setLocation("/signup")} data-testid="button-signup-nav">Sign Up</Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            The Skill Economy Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
            Where <span className="text-primary">Skills</span> Meet{" "}
            <span className="text-accent">Opportunity</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Post work, apply for projects, hire talent, and build your reputation.
            One unified platform for the modern skill economy.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <Button size="lg" onClick={() => setLocation("/signup")} data-testid="button-get-started">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/about")} data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>2,400+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>8,500+ Works Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>4.8 Avg Rating</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">How ProConnect Works</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            A unified platform where everyone can post work, apply, hire, and build trust - no rigid roles.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Card key={i} className="overflow-visible hover-elevate" data-testid={`card-feature-${i}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Why ProConnect?</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              We are not a job board, not a freelance marketplace. We are a skill economy network.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">1</div>
              <h3 className="font-semibold mt-2">Single Role System</h3>
              <p className="text-sm text-muted-foreground mt-1">Everyone can post work and apply. No client/freelancer divide.</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">2</div>
              <h3 className="font-semibold mt-2">Trust-Based Hiring</h3>
              <p className="text-sm text-muted-foreground mt-1">Ratings, reviews, and portfolio proof drive hiring decisions.</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">3</div>
              <h3 className="font-semibold mt-2">Direct Communication</h3>
              <p className="text-sm text-muted-foreground mt-1">Message only after acceptance. Focused, meaningful conversations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to Join the Skill Economy?</h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Start building your reputation today. Post your first project or apply for opportunities.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <Button size="lg" onClick={() => setLocation("/signup")} data-testid="button-cta-signup">
            Create Your Account
          </Button>
          <Button size="lg" variant="outline" onClick={() => setLocation("/login")} data-testid="button-cta-login">
            Log In
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center mb-3">
            <span className="text-lg font-bold text-primary">Pro</span>
            <span className="text-lg font-bold text-accent">Connect</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The skill economy platform. Built with trust.
          </p>
        </div>
      </footer>
    </div>
  );
}
