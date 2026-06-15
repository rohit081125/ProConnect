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
  Linkedin,
} from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated premium background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[130px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
            data-testid="button-back-landing"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back</span>
          </button>

          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5"
          >
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pro</span>
            <span className="text-xl font-bold text-foreground">Connect</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="text-sm font-medium hover:bg-muted/50 rounded-full px-5 transition-all duration-300"
              data-testid="button-login"
            >
              Log In
            </Button>
            <Button
              onClick={() => setLocation("/signup")}
              className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/95 hover:from-primary/95 hover:to-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/30 rounded-full px-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              data-testid="button-signup"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            THE SKILL ECONOMY PLATFORM
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            About <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">ProConnect</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A secure, direct skill economy platform designed to connect talent and opportunity through trust, verified capability, and seamless collaboration.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <Card className="border border-border/50 bg-card/75 backdrop-blur-md hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl text-foreground">Our Vision</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                To create a decentralized professional environment where skills are the ultimate currency, empowering individuals to offer services, trade skills, and build global careers entirely on documented achievements.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/75 backdrop-blur-md hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 text-accent shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl text-foreground">Our Mission</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                To enable verified connections between talent and clients. By removing unnecessary intermediaries, we provide a clean, direct environment where quality work is recognized and rewarded.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/75 backdrop-blur-md hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/70" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Heart className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl text-foreground">Our Core Purpose</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                To eliminate barriers to entry in the freelance and hiring space. We believe in providing equal, direct access to projects where a builder's portfolio and ratings speak for themselves.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/75 backdrop-blur-md hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent/70" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 text-accent shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Globe className="h-6 w-6" />
                </div>
                <h2 className="font-bold text-xl text-foreground">Global Platform</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                ProConnect bridges geographic boundaries. It provides tools for transparent review exchange, file sharing, and direct messaging to make distance irrelevant when delivering quality output.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Me Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">About Me</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl mx-auto">
              The developer and administrator behind ProConnect.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto group border border-border/50 bg-gradient-to-br from-card to-muted/30 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden relative">
            <CardContent className="p-0">
              <div className="h-32 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-b border-border/30 relative" />

              <div className="px-6 sm:px-12 pb-10 -mt-16 relative text-center">
                <div className="w-32 h-32 rounded-2xl bg-background border-4 border-background shadow-md flex items-center justify-center mx-auto mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/rohit-logo.png"
                    alt="Admin Rohit Dongare"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <h3 className="font-bold text-2xl text-foreground">Admin Rohit Dongare</h3>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <Users className="h-3.5 w-3.5" />
                    Admin
                  </div>
                  <a
                    href="https://www.linkedin.com/in/rohit0811/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all duration-300 shadow-sm"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-[#0A66C2] fill-[#0A66C2]" />
                    <span>LinkedIn</span>
                  </a>
                </div>

                <div className="text-sm sm:text-base text-muted-foreground mt-6 space-y-4 text-left leading-relaxed">
                  <p>
                    Hi, I'm Rohit Dongare, a B.Tech Computer Science and Engineering student at Parul University with a strong passion for software development and problem-solving.
                  </p>
                  <p>
                    I enjoy building full-stack web applications and continuously improving my skills in Java, Data Structures & Algorithms, Database Management Systems, and Web Development. I have experience developing projects using Java, Spring Boot, MongoDB, React, Tailwind CSS, and REST APIs.
                  </p>
                  <p>
                    Currently, I am focused on strengthening my problem-solving abilities, mastering backend development, and building scalable applications that solve real-world problems. I am actively seeking opportunities to collaborate on meaningful projects, gain industry experience, and contribute to innovative teams.
                  </p>
                  <p>
                    I believe in continuous learning, writing clean code, and turning ideas into practical solutions through technology.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-8 text-[11px] text-muted-foreground font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                  ProConnect Creator & Admin
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="mb-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">Modern Architecture</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {[
              "React 18",
              "Vite",
              "Tailwind CSS",
              "Lucide Icons",
              "Spring Boot",
              "Spring Security",
              "MongoDB",
              "Drizzle Kit",
            ].map((tech) => (
              <div
                key={tech}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground/90 font-medium hover:border-primary/30 hover:bg-muted/30 transition-all duration-300"
              >
                <Code2 className="h-4 w-4 text-primary" />
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 px-6 border border-border/50 bg-card/65 backdrop-blur-md rounded-3xl relative overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary/5 blur-[50px]" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-accent/5 blur-[50px]" />
          
          <h2 className="text-2xl sm:text-3xl font-black mb-3 text-foreground">Join ProConnect Today</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            Create your account to start showcasing your skills, bidding on opportunities, and networking with top professionals.
          </p>
          <Button
            onClick={() => setLocation("/signup")}
            className="text-sm font-semibold bg-gradient-to-r from-accent to-accent/95 hover:from-accent/95 hover:to-accent text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-accent/30 rounded-full px-8 py-5 h-auto transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            data-testid="button-about-signup"
          >
            Create Your Account
          </Button>
        </div>
      </div>
    </div>
  );
}