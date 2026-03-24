import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

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

      const token =
        data.token ||
        data.jwt ||
        data.accessToken ||
        data.access_token ||
        "";

      const userId = data.userId || data.id || data._id || null;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (!userId) {
        throw new Error("User ID not found in login response");
      }

      let fullUser;

      try {
        const profileData = await getUserProfile(userId);

        fullUser = {
          userId,
          id: profileData.id || userId,
          _id: profileData.id || userId,
          name: profileData.name || data.name || "",
          email: profileData.email || data.email || "",
          role: profileData.role || data.role || "",
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
      } catch (error) {
        fullUser = {
          userId,
          id: userId,
          _id: userId,
          name: data.name || "",
          email: data.email || "",
          role: data.role || "",
          bio: "",
          location: "",
          skills: [],
          portfolioLinks: [],
          socialLinks: [],
          education: "",
          experience: "",
          profileImage: "",
          createdAt: "",
          username: data.email
            ? data.email.split("@")[0]
            : (data.name || "").toLowerCase().replace(/\s+/g, ""),
        };
      }

      localStorage.setItem("user", JSON.stringify(fullUser));
      localStorage.setItem("userId", userId);
      localStorage.setItem("isAuthenticated", "true");

      handleStoreLogin(fullUser);

      toast({
        title: "Login successful",
        description: "Welcome back to ProConnect",
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
        setLocation("/home");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center px-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-primary">Pro</span>
                <span className="text-3xl font-bold text-accent">Connect</span>
              </div>

              <h1 className="text-2xl font-semibold">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Log in to your account to continue
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          {...field}
                          data-testid="input-email"
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="pr-10"
                            {...field}
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="w-full h-11 text-sm font-medium"
                  disabled={loading}
                  data-testid="button-login"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-5 rounded-lg border bg-muted/40 p-4">
              <p className="text-xs font-semibold text-foreground mb-2">
                Demo / Test info
              </p>
              <p className="text-xs text-muted-foreground break-all">
                Test userId: 69b7921165ff8a2f4725c8ce
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setLocation("/signup")}
                className="text-primary font-medium hover:underline"
                data-testid="link-signup"
              >
                Sign up
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}