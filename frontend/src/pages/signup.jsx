import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles, UserPlus, Mail, Lock, User, Phone, Key } from "lucide-react";

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
import { signupUser, sendSignupOtp, verifySignupOtp, getUserProfile } from "../lib/api";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be under 15 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const [, setLocation] = useLocation();
  const store = useStore();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
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

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const emailVal = form.getValues("email");
    if (!emailVal || !/^\S+@\S+\.\S+$/.test(emailVal)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address first.",
        variant: "destructive",
      });
      return;
    }

    setOtpSending(true);
    try {
      await sendSignupOtp(emailVal);
      setOtpSent(true);
      startResendTimer();
      toast({
        title: "🔑 Verification Code Sent",
        description: `We've sent a verification code to ${emailVal}. Please check your inbox.`,
      });
    } catch (error) {
      toast({
        title: "Failed to send code",
        description: error.message || "An error occurred while sending verification code.",
        variant: "destructive",
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const emailVal = form.getValues("email");
    if (!emailVal || otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setOtpLoading(true);
    try {
      await verifySignupOtp(emailVal, otpCode);
      setOtpVerified(true);
      toast({
        title: "✅ Email Verified",
        description: "Your email address has been verified successfully.",
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (values) => {
    if (!otpVerified) {
      toast({
        title: "Email not verified",
        description: "Please send and verify the email OTP first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
      };

      const data = await signupUser(payload);
      await processLoginSuccess(data);
    } catch (error) {
      const statusCode = error.status || 0;
      let description = error.message || "Could not create account";

      if (statusCode === 409) {
        description = "This email is already registered. Please sign in instead.";
      } else if (statusCode === 0 && description.includes("connect")) {
        description = "Cannot connect to server. Please try again later.";
      }

      toast({
        title: "Signup failed",
        description,
        variant: "destructive",
      });
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
      throw new Error("User ID not found in signup response");
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
        email: data.email || email || "",
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
        username: (data.email || email || "")
          ? (data.email || email || "").split("@")[0]
          : (data.name || "").toLowerCase().replace(/\s+/g, ""),
      };
    }

    localStorage.setItem("user", JSON.stringify(fullUser));
    localStorage.setItem("userId", currentUserId);
    localStorage.setItem("isAuthenticated", "true");

    handleStoreLogin(fullUser);

    toast({
      title: "🎉 Verification successful!",
      description: `Logged in as ${fullUser.name || fullUser.email}`,
    });

    setLocation("/setup-profile");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[15%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />
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
          <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-accent/5 overflow-hidden relative">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />

            <CardContent className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/25">
                      <UserPlus className="h-7 w-7 text-accent-foreground" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight">
                  Create your account
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Join <span className="font-semibold text-primary">Pro</span><span className="font-semibold text-accent">Connect</span> and start building
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="John Doe"
                              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
                              {...field}
                              data-testid="input-name"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="Phone Number (e.g. 9876543210)"
                              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
                              {...field}
                              data-testid="input-phone"
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
                              placeholder="Minimum 6 characters"
                              autoComplete="new-password"
                              className="pl-10 pr-12 h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
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

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Re-enter your password"
                              autoComplete="new-password"
                              className="pl-10 h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
                              {...field}
                              data-testid="input-confirm-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      disabled={loading || !otpVerified}
                      data-testid="button-create-account"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">Already a member?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/login")}
                className="w-full h-12 text-sm font-semibold border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
                data-testid="link-login"
              >
                Sign In Instead
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}