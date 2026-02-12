import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginValues) => {
    setLoading(true);
    setTimeout(() => {
      const success = login(values.email, values.password);
      if (!success) {
        toast({ title: "Invalid email or password", variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Welcome back!" });
      setLocation("/home");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center px-4 max-w-md mx-auto">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-muted-foreground" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md overflow-visible">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">Pro</span>
                <span className="text-2xl font-bold text-accent">Connect</span>
              </div>
              <h1 className="text-xl font-semibold">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">Log in to your account</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} data-testid="input-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-testid="button-toggle-password">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground font-medium mb-1">Demo accounts:</p>
              <p className="text-xs text-muted-foreground">alex@example.com / password123</p>
              <p className="text-xs text-muted-foreground">priya@example.com / password123</p>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <button onClick={() => setLocation("/signup")} className="text-primary font-medium" data-testid="link-signup">
                Sign up
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
