import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  Users,
  Shield,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Mail,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Post & Find Work",
    desc: "Share your projects or find opportunities that match your skills. One platform, unlimited potential.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Skill-Based Connections",
    desc: "Connect with skilled professionals based on real capabilities, not just resumes.",
    gradient: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
  },
  {
    icon: Shield,
    title: "Trust System",
    desc: "Build your reputation through ratings, reviews, and verified project completions.",
    gradient: "from-primary/20 to-accent/5",
    iconColor: "text-primary",
  },
  {
    icon: Zap,
    title: "Direct Negotiation",
    desc: "Set your terms, negotiate budgets, and agree on timelines directly with your counterpart.",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  {
    icon: Target,
    title: "Proof-Based Hiring",
    desc: "Evaluate candidates through portfolios, references, and demonstrated expertise.",
    gradient: "from-accent/20 to-primary/5",
    iconColor: "text-accent",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Network",
    desc: "Both hire and get hired. Build lasting professional relationships in the skill economy.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
];

const stats = [
  { value: "2,400+", label: "Active Users", icon: Users },
  { value: "8,500+", label: "Works Completed", icon: CheckCircle2 },
  { value: "4.8", label: "Average Rating", icon: Star },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSupportClick = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/messages?support=true");
      toast({
        title: "Authentication required",
        description: "Please sign in to message support directly.",
      });
      setLocation("/login");
    } else {
      setLocation("/messages?support=true");
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex items-center" data-testid="logo-landing">
            <span className="text-xl font-bold font-heading text-primary">Pro</span>
            <span className="text-xl font-bold font-heading text-foreground">Connect</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              className="hidden min-[360px]:inline-flex text-sm font-medium"
              onClick={() => setLocation("/about")}
              data-testid="button-about"
            >
              About
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
              className="text-sm font-medium border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              data-testid="button-login-nav"
            >
              Log In
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
              className="text-sm font-medium border-accent/20 hover:border-accent/40 hover:bg-accent/5 text-accent transition-all duration-300"
              data-testid="button-admin-login-nav"
            >
              Admin Login
            </Button>
            <Button
              onClick={() => setLocation("/signup")}
              className="text-sm font-medium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
              data-testid="button-signup-nav"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
          <div className="absolute top-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-20%] left-[30%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-fade-in-down">
            <Sparkles className="h-4 w-4" />
            The Skill Economy Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto font-heading animate-fade-in-up">
            Where{" "}
            <span className="gradient-text">Skills</span>
            {" "}Meet{" "}
            <span className="gradient-text-reverse">Opportunity</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
            Post work, apply for projects, hire talent, and build your reputation.
            One unified platform for the modern skill economy.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 mt-10 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
            <Button
              size="lg"
              onClick={() => setLocation("/signup")}
              className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
              data-testid="button-get-started"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/about")}
              className="h-13 px-8 text-base font-semibold border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="h-13 px-8 text-base font-semibold text-accent hover:text-accent/90 hover:bg-accent/5 transition-all duration-300 flex items-center justify-center gap-2"
              data-testid="button-admin-login-hero"
            >
              <Shield className="h-4.5 w-4.5 text-accent" />
              Admin Login
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 mt-16 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.45s', opacity: 0 }}>
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold font-heading">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
            <Zap className="h-3 w-3" />
            FEATURES
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading">
            How <span className="gradient-text">ProConnect</span> Works
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
            A unified platform where everyone can post work, apply, hire, and build trust — no rigid roles.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
              data-testid={`card-feature-${i}`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="relative p-6">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-base font-heading mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why ProConnect */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading">
              Why <span className="gradient-text">ProConnect</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base">
              Not a job board. Not a freelance marketplace. A skill economy network.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Single Role System",
                desc: "Everyone can post work and apply. No client/freelancer divide.",
                color: "primary",
              },
              {
                num: "02",
                title: "Trust-Based Hiring",
                desc: "Ratings, reviews, and portfolio proof drive hiring decisions.",
                color: "accent",
              },
              {
                num: "03",
                title: "Direct Communication",
                desc: "Message only after acceptance. Focused, meaningful conversations.",
                color: "primary",
              },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${item.color}/10 border border-${item.color}/20 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`text-2xl font-extrabold font-heading text-${item.color}`}>{item.num}</span>
                </div>
                <h3 className="font-bold text-lg font-heading mt-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-accent/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <Star className="h-3 w-3" />
            JOIN TODAY
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading leading-tight">
            Ready to Join the{" "}
            <span className="gradient-text">Skill Economy</span>?
          </h2>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto text-lg">
            Start building your reputation today. Post your first project or apply for opportunities.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <Button
              size="lg"
              onClick={() => setLocation("/signup")}
              className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
              data-testid="button-cta-signup"
            >
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/login")}
              className="h-13 px-8 text-base font-semibold border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              data-testid="button-cta-login"
            >
              Log In
            </Button>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="relative border-t border-border/50">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
              <Shield className="h-3.5 w-3.5" />
              SUPPORT & HELP
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Need Help? We've Got You Covered
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm">
              Reach out to our team directly via email or message the support administrator in real-time.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {/* Card 1: Email Support */}
            <Card className="border border-border/50 bg-card/60 backdrop-blur-md hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-md rounded-2xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">Email Support</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Have any questions, technical issues, or general feedback? Send us an email directly, and we will get back to you within 24 hours.
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="mailto:rohitdongre1108@gmail.com?subject=ProConnect%20Support%20Request"
                    className="inline-flex items-center justify-center w-full h-11 px-4 text-sm font-semibold rounded-xl border border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                  >
                    rohitdongre1108@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Live Support Message */}
            <Card className="border border-border/50 bg-card/60 backdrop-blur-md hover:border-accent/30 transition-all duration-300 group shadow-sm hover:shadow-md rounded-2xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">Live Support Chat</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Need immediate help with your account or have platform concerns? Message our administration support team directly through our live chat system.
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={handleSupportClick}
                    className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent shadow-md shadow-accent/10 hover:shadow-accent/20 transition-all duration-300 rounded-xl"
                  >
                    Start Support Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold font-heading text-primary">Pro</span>
              <span className="text-lg font-bold font-heading text-foreground">Connect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The skill economy platform. Built with trust.
            </p>
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ProConnect
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
