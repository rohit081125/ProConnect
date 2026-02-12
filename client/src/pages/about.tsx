import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Globe, Lightbulb, Target, Code2, Users, Heart } from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 max-w-4xl mx-auto">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-muted-foreground" data-testid="button-back-landing">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xl font-bold text-primary">Pro</span>
            <span className="text-xl font-bold text-accent">Connect</span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setLocation("/login")} data-testid="button-login">Log In</Button>
            <Button onClick={() => setLocation("/signup")} data-testid="button-signup">Sign Up</Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold">About ProConnect</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A skill economy network built on trust, reputation, and direct collaboration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Card className="overflow-visible">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Our Vision</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To create a world where skills are the primary currency of professional growth.
                Where anyone can contribute, earn, and build their career through demonstrated ability.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-accent/10">
                  <Target className="h-4 w-4 text-accent" />
                </div>
                <h2 className="font-semibold text-lg">Our Mission</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To connect skilled professionals through a trust-based platform where reputation matters,
                collaboration is direct, and opportunities are accessible to everyone.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Our Purpose</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bridge the gap between talent and opportunity. No rigid roles, no gatekeeping.
                Just skills meeting needs through transparent, proof-based interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-accent/10">
                  <Globe className="h-4 w-4 text-accent" />
                </div>
                <h2 className="font-semibold text-lg">Global Platform</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ProConnect serves professionals worldwide. Remote-first by design,
                breaking geographical barriers to connect talent across borders.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Our Team</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Alex Rivera", role: "Founder & Lead Developer", desc: "Full-stack engineer passionate about the future of work." },
              { name: "Priya Sharma", role: "Head of Design", desc: "UI/UX specialist crafting intuitive user experiences." },
              { name: "Marcus Chen", role: "Head of Data", desc: "Data scientist building smart matching algorithms." },
            ].map((member, i) => (
              <Card key={i} className="overflow-visible text-center">
                <CardContent className="p-5">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-xs text-primary mt-0.5">{member.role}</p>
                  <p className="text-sm text-muted-foreground mt-2">{member.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {["React", "TypeScript", "Tailwind CSS", "Zustand", "Wouter", "Shadcn UI", "Lucide Icons", "Vite"].map(tech => (
              <div key={tech} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm">
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-8 border-t">
          <h2 className="text-xl font-bold mb-3">Join ProConnect Today</h2>
          <p className="text-muted-foreground mb-4">Start your journey in the skill economy.</p>
          <Button onClick={() => setLocation("/signup")} data-testid="button-about-signup">
            Create Your Account
          </Button>
        </div>
      </div>
    </div>
  );
}
