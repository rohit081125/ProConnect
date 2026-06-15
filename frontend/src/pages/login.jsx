import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { loginUser, getUserProfile } from "../lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const store = useStore();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleStoreLogin = (userData) => {
    try {
      if (store && typeof store.login === "function") {
        store.login({
          user: userData,
          userId: userData?._id || userData?.id || userData?.userId || null,
        });
        return;
      }

      if (store && typeof store.setIsAuthenticated === "function") {
        store.setIsAuthenticated(true);
      }

      if (store && typeof store.setUser === "function") {
        store.setUser(userData);
      }
    } catch (error) {
      console.error("Store update error:", error);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);

    try {
      const data = await loginUser(values);
      await processLoginSuccess(data);
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const processLoginSuccess = async (data) => {
    const token =
      data.token ||
      data.jwt ||
      data.accessToken ||
      data.access_token ||
      null;

    const currentUserId = data.userId || data.id || data._id || null;

    if (token) {
      localStorage.setItem("token", token);
    }

    if (!currentUserId) {
      throw new Error("User ID not found in login response");
    }

    let fullUser;

    try {
      const profileData = await getUserProfile(currentUserId);

      fullUser = {
        userId: currentUserId,
        id: profileData.id || currentUserId,
        _id: profileData.id || currentUserId,
        name: profileData.name || data.name || "",
        email: profileData.email || data.email || "",
        role: profileData.role || data.role || "",
        accountStatus: profileData.accountStatus || data.accountStatus || "active",
        suspendedUntil: profileData.suspendedUntil || data.suspendedUntil || null,
        warningCount: profileData.warningCount || 0,
        adminNote: profileData.adminNote || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        portfolioLinks: Array.isArray(profileData.portfolioLinks)
          ? profileData.portfolioLinks
          : [],
        socialLinks: Array.isArray(profileData.socialLinks)
          ? profileData.socialLinks
          : [],
        education: profileData.education || "",
        experience: profileData.experience || "",
        profileImage: profileData.profileImage || "",
        createdAt: profileData.createdAt || "",
        username:
          profileData.username ||
          (profileData.email
            ? profileData.email.split("@")[0]
            : (profileData.name || "").toLowerCase().replace(/\s+/g, "")),
      };
    } catch (profileError) {
      fullUser = {
        userId: currentUserId,
        id: currentUserId,
        _id: currentUserId,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
        accountStatus: data.accountStatus || "active",
        suspendedUntil: data.suspendedUntil || null,
        warningCount: data.warningCount || 0,
        adminNote: data.adminNote || "",
        bio: "",
        location: "",
        skills: [],
        portfolioLinks: [],
        socialLinks: [],
        education: "",
        experience: "",
        profileImage: data.profileImage || "",
        createdAt: "",
        username: data.email
          ? data.email.split("@")[0]
          : (data.name || "").toLowerCase().replace(/\s+/g, ""),
      };
    }

    localStorage.setItem("user", JSON.stringify(fullUser));
    localStorage.setItem("userId", currentUserId);
    localStorage.setItem("isAuthenticated", "true");

    handleStoreLogin(fullUser);

    if (["banned", "suspended"].includes((fullUser.accountStatus || "").toLowerCase())) {
      setLocation("/restricted");
      return;
    }

    toast({
      title: "✨ Welcome back!",
      description: `Logged in as ${fullUser.name || fullUser.email}`,
    });

    const isProfileIncomplete =
      !fullUser.name ||
      !fullUser.email ||
      !fullUser.bio?.trim() ||
      !Array.isArray(fullUser.skills) ||
      fullUser.skills.length === 0;

    if (isProfileIncomplete) {
      setLocation("/setup-profile");
    } else {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin");
        setLocation(redirectPath);
      } else {
        setLocation("/home");
      }
    }
  };

  const handleLoginError = (error) => {
    const statusCode = error.status || 0;
    let description = error.message || "Invalid email or password";

    if (statusCode === 401) {
      description = "Invalid email or password. Please try again.";
    } else if (statusCode === 403) {
      description = "Your account has been restricted. Please contact support.";
    } else if (statusCode === 0 && description.includes("connect")) {
      description = "Cannot connect to server. Please try again later.";
    }

    toast({
      title: "Login failed",
      description,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Glassmorphism card */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden relative">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            <CardContent className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                      <Lock className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-accent-foreground" />
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Sign in to your <span className="font-semibold text-primary">Pro</span><span className="font-semibold text-accent">Connect</span> account
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              autoComplete="email"
                              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                              {...field}
                              data-testid="input-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              className="pl-10 pr-12 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                              {...field}
                              data-testid="input-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading}
                    data-testid="button-login"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">New to ProConnect?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/signup")}
                className="w-full h-12 text-sm font-semibold border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                data-testid="link-signup"
              >
                Create an Account
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
