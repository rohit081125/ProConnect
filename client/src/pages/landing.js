import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Shield, Zap, Target, TrendingUp, ArrowRight } from "lucide-react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const features = [{
  icon: Briefcase,
  title: "Post & Find Work",
  desc: "Share your projects or find opportunities that match your skills. One platform, unlimited potential."
}, {
  icon: Users,
  title: "Skill-Based Connections",
  desc: "Connect with skilled professionals based on real capabilities, not just resumes."
}, {
  icon: Shield,
  title: "Trust System",
  desc: "Build your reputation through ratings, reviews, and verified project completions."
}, {
  icon: Zap,
  title: "Direct Negotiation",
  desc: "Set your terms, negotiate budgets, and agree on timelines directly with your counterpart."
}, {
  icon: Target,
  title: "Proof-Based Hiring",
  desc: "Evaluate candidates through portfolios, references, and demonstrated expertise."
}, {
  icon: TrendingUp,
  title: "Grow Your Network",
  desc: "Both hire and get hired. Build lasting professional relationships in the skill economy."
}];
export default function Landing() {
  const [, setLocation] = useLocation();
  return /*#__PURE__*/_jsxs("div", {
    className: "min-h-screen bg-background",
    children: [/*#__PURE__*/_jsx("header", {
      className: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur",
      children: /*#__PURE__*/_jsxs("div", {
        className: "flex h-14 items-center justify-between px-4 max-w-6xl mx-auto",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "flex items-center",
          "data-testid": "logo-landing",
          children: [/*#__PURE__*/_jsx("span", {
            className: "text-xl font-bold text-primary",
            children: "Pro"
          }), /*#__PURE__*/_jsx("span", {
            className: "text-xl font-bold text-accent",
            children: "Connect"
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-2",
          children: [/*#__PURE__*/_jsx(Button, {
            variant: "ghost",
            onClick: () => setLocation("/about"),
            "data-testid": "button-about",
            children: "About"
          }), /*#__PURE__*/_jsx(Button, {
            variant: "outline",
            onClick: () => setLocation("/login"),
            "data-testid": "button-login-nav",
            children: "Log In"
          }), /*#__PURE__*/_jsx(Button, {
            onClick: () => setLocation("/signup"),
            "data-testid": "button-signup-nav",
            children: "Sign Up"
          })]
        })]
      })
    }), /*#__PURE__*/_jsxs("section", {
      className: "relative overflow-hidden",
      children: [/*#__PURE__*/_jsx("div", {
        className: "absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8"
      }), /*#__PURE__*/_jsxs("div", {
        className: "relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6",
          children: [/*#__PURE__*/_jsx(Zap, {
            className: "h-3.5 w-3.5"
          }), "The Skill Economy Platform"]
        }), /*#__PURE__*/_jsxs("h1", {
          className: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto",
          children: ["Where ", /*#__PURE__*/_jsx("span", {
            className: "text-primary",
            children: "Skills"
          }), " Meet", " ", /*#__PURE__*/_jsx("span", {
            className: "text-accent",
            children: "Opportunity"
          })]
        }), /*#__PURE__*/_jsx("p", {
          className: "mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed",
          children: "Post work, apply for projects, hire talent, and build your reputation. One unified platform for the modern skill economy."
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex items-center justify-center gap-3 mt-8 flex-wrap",
          children: [/*#__PURE__*/_jsxs(Button, {
            size: "lg",
            onClick: () => setLocation("/signup"),
            "data-testid": "button-get-started",
            children: ["Get Started", /*#__PURE__*/_jsx(ArrowRight, {
              className: "ml-2 h-4 w-4"
            })]
          }), /*#__PURE__*/_jsx(Button, {
            size: "lg",
            variant: "outline",
            onClick: () => setLocation("/about"),
            "data-testid": "button-learn-more",
            children: "Learn More"
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground flex-wrap",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "flex items-center gap-2",
            children: [/*#__PURE__*/_jsx("div", {
              className: "h-2 w-2 rounded-full bg-green-500"
            }), /*#__PURE__*/_jsx("span", {
              children: "2,400+ Active Users"
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex items-center gap-2",
            children: [/*#__PURE__*/_jsx("div", {
              className: "h-2 w-2 rounded-full bg-primary"
            }), /*#__PURE__*/_jsx("span", {
              children: "8,500+ Works Completed"
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex items-center gap-2",
            children: [/*#__PURE__*/_jsx("div", {
              className: "h-2 w-2 rounded-full bg-accent"
            }), /*#__PURE__*/_jsx("span", {
              children: "4.8 Avg Rating"
            })]
          })]
        })]
      })]
    }), /*#__PURE__*/_jsxs("section", {
      className: "max-w-6xl mx-auto px-4 py-16 sm:py-20",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "text-center mb-12",
        children: [/*#__PURE__*/_jsx("h2", {
          className: "text-2xl sm:text-3xl font-bold",
          children: "How ProConnect Works"
        }), /*#__PURE__*/_jsx("p", {
          className: "mt-3 text-muted-foreground max-w-xl mx-auto",
          children: "A unified platform where everyone can post work, apply, hire, and build trust - no rigid roles."
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4",
        children: features.map((f, i) => /*#__PURE__*/_jsx(Card, {
          className: "overflow-visible hover-elevate",
          "data-testid": `card-feature-${i}`,
          children: /*#__PURE__*/_jsxs(CardContent, {
            className: "p-5",
            children: [/*#__PURE__*/_jsx("div", {
              className: "flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 mb-3",
              children: /*#__PURE__*/_jsx(f.icon, {
                className: "h-5 w-5 text-primary"
              })
            }), /*#__PURE__*/_jsx("h3", {
              className: "font-semibold text-base",
              children: f.title
            }), /*#__PURE__*/_jsx("p", {
              className: "mt-1.5 text-sm text-muted-foreground leading-relaxed",
              children: f.desc
            })]
          })
        }, i))
      })]
    }), /*#__PURE__*/_jsx("section", {
      className: "bg-muted/50",
      children: /*#__PURE__*/_jsxs("div", {
        className: "max-w-6xl mx-auto px-4 py-16 sm:py-20",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "text-center mb-10",
          children: [/*#__PURE__*/_jsx("h2", {
            className: "text-2xl sm:text-3xl font-bold",
            children: "Why ProConnect?"
          }), /*#__PURE__*/_jsx("p", {
            className: "mt-3 text-muted-foreground max-w-xl mx-auto",
            children: "We are not a job board, not a freelance marketplace. We are a skill economy network."
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "grid sm:grid-cols-3 gap-6 text-center",
          children: [/*#__PURE__*/_jsxs("div", {
            children: [/*#__PURE__*/_jsx("div", {
              className: "text-3xl font-bold text-primary",
              children: "1"
            }), /*#__PURE__*/_jsx("h3", {
              className: "font-semibold mt-2",
              children: "Single Role System"
            }), /*#__PURE__*/_jsx("p", {
              className: "text-sm text-muted-foreground mt-1",
              children: "Everyone can post work and apply. No client/freelancer divide."
            })]
          }), /*#__PURE__*/_jsxs("div", {
            children: [/*#__PURE__*/_jsx("div", {
              className: "text-3xl font-bold text-accent",
              children: "2"
            }), /*#__PURE__*/_jsx("h3", {
              className: "font-semibold mt-2",
              children: "Trust-Based Hiring"
            }), /*#__PURE__*/_jsx("p", {
              className: "text-sm text-muted-foreground mt-1",
              children: "Ratings, reviews, and portfolio proof drive hiring decisions."
            })]
          }), /*#__PURE__*/_jsxs("div", {
            children: [/*#__PURE__*/_jsx("div", {
              className: "text-3xl font-bold text-primary",
              children: "3"
            }), /*#__PURE__*/_jsx("h3", {
              className: "font-semibold mt-2",
              children: "Direct Communication"
            }), /*#__PURE__*/_jsx("p", {
              className: "text-sm text-muted-foreground mt-1",
              children: "Message only after acceptance. Focused, meaningful conversations."
            })]
          })]
        })]
      })
    }), /*#__PURE__*/_jsxs("section", {
      className: "max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center",
      children: [/*#__PURE__*/_jsx("h2", {
        className: "text-2xl sm:text-3xl font-bold",
        children: "Ready to Join the Skill Economy?"
      }), /*#__PURE__*/_jsx("p", {
        className: "mt-3 text-muted-foreground max-w-xl mx-auto",
        children: "Start building your reputation today. Post your first project or apply for opportunities."
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex items-center justify-center gap-3 mt-6 flex-wrap",
        children: [/*#__PURE__*/_jsx(Button, {
          size: "lg",
          onClick: () => setLocation("/signup"),
          "data-testid": "button-cta-signup",
          children: "Create Your Account"
        }), /*#__PURE__*/_jsx(Button, {
          size: "lg",
          variant: "outline",
          onClick: () => setLocation("/login"),
          "data-testid": "button-cta-login",
          children: "Log In"
        })]
      })]
    }), /*#__PURE__*/_jsx("footer", {
      className: "border-t",
      children: /*#__PURE__*/_jsxs("div", {
        className: "max-w-6xl mx-auto px-4 py-8 text-center",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "flex items-center justify-center mb-3",
          children: [/*#__PURE__*/_jsx("span", {
            className: "text-lg font-bold text-primary",
            children: "Pro"
          }), /*#__PURE__*/_jsx("span", {
            className: "text-lg font-bold text-accent",
            children: "Connect"
          })]
        }), /*#__PURE__*/_jsx("p", {
          className: "text-sm text-muted-foreground",
          children: "The skill economy platform. Built with trust."
        })]
      })
    })]
  });
}