import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Globe,
  Lightbulb,
  Target,
  Code2,
  Users,
  Heart,
  Sparkles,
} from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  const teamMembers = [
    {
      name: "Rukaiya Khan",
      role: "Team Leader",
      desc: "Contributing to research, collaboration, and overall project coordination for ProConnect.",
    },
    {
      name: "Shruti Budhbaware",
      role: "Team Member",
      desc: "Focused on creative ideas, teamwork, and improving the overall user experience.",
    },
    {
      name: "Samruddhi Palatkar",
      role: "Team Member",
      desc: "Supporting platform planning, feature discussions, and smooth project execution.",
    },
    {
      name: "Simarjit Kaur",
      role: "Team Member",
      desc: "Helping shape project flow, coordination, and quality contributions across the platform.",
    },
    {
      name: "Sayali Walke",
      role: "Team Member",
      desc: "Actively involved in teamwork, idea development, and strengthening the project vision.",
    },
  ];

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 max-w-5xl mx-auto">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground"
            data-testid="button-back-landing"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xl font-bold text-primary">Pro</span>
            <span className="text-xl font-bold text-accent">Connect</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
              data-testid="button-login"
            >
              Log In
            </Button>
            <Button
              onClick={() => setLocation("/signup")}
              data-testid="button-signup"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold">About ProConnect</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A skill economy network built on trust, reputation, and direct
            collaboration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Card className="overflow-visible shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Our Vision</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To create a world where skills are the primary currency of
                professional growth, where anyone can contribute, earn, and
                build their career through demonstrated ability.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <h2 className="font-semibold text-lg">Our Mission</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To connect skilled professionals through a trust-based platform
                where reputation matters, collaboration is direct, and
                opportunities are accessible to everyone.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Our Purpose</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To bridge the gap between talent and opportunity with
                transparent, proof-based interactions and a platform that values
                skills over traditional barriers.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-visible shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
                  <Globe className="h-5 w-5 text-accent" />
                </div>
                <h2 className="font-semibold text-lg">Global Platform</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ProConnect is built for a connected world, enabling collaboration
                across locations and helping skilled people discover meaningful
                opportunities without boundaries.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Our Team</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
              Meet the dedicated team members behind ProConnect, working
              together to build a smarter and more collaborative skill-sharing
              platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member, i) => (
              <Card
                key={i}
                className="group overflow-hidden border bg-gradient-to-br from-background to-muted/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="h-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-b" />

                  <div className="px-5 pb-5 -mt-10 relative">
                    <div className="w-20 h-20 rounded-2xl bg-background border-4 border-background shadow-md flex items-center justify-center mx-auto mb-4">
                      <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {getInitials(member.name)}
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-base">{member.name}</h3>

                      <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Users className="h-3.5 w-3.5" />
                        {member.role}
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {member.desc}
                      </p>

                      <div className="flex items-center justify-center gap-1 mt-4 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        ProConnect Team
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "React",
              "TypeScript",
              "Tailwind CSS",
              "Zustand",
              "Wouter",
              "Shadcn UI",
              "Lucide Icons",
              "Vite",
            ].map((tech) => (
              <div
                key={tech}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm"
              >
                <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-8 border-t">
          <h2 className="text-xl font-bold mb-3">Join ProConnect Today</h2>
          <p className="text-muted-foreground mb-4">
            Start your journey in the skill economy.
          </p>
          <Button
            onClick={() => setLocation("/signup")}
            data-testid="button-about-signup"
          >
            Create Your Account
          </Button>
        </div>
      </div>
    </div>
  );
}