import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { useStore } from "@/lib/store";
import Landing from "@/pages/landing";
import About from "@/pages/about";
import Signup from "@/pages/signup";
import SetupProfile from "@/pages/setup-profile";
import Login from "@/pages/login";
import Home from "@/pages/home";
import Messages from "@/pages/messages";
import AddWork from "@/pages/add-work";
import MyApplications from "@/pages/my-applications";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {children}
      <BottomNav />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: () => JSX.Element | null }) {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function PublicRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated } = useStore();
  if (isAuthenticated) return <Redirect to="/home" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <PublicRoute component={Landing} />}</Route>
      <Route path="/about">{() => <PublicRoute component={About} />}</Route>
      <Route path="/signup">{() => <PublicRoute component={Signup} />}</Route>
      <Route path="/setup-profile" component={SetupProfile} />
      <Route path="/login">{() => <PublicRoute component={Login} />}</Route>
      <Route path="/home">{() => <ProtectedRoute component={Home} />}</Route>
      <Route path="/messages">{() => <ProtectedRoute component={Messages} />}</Route>
      <Route path="/add-work">{() => <ProtectedRoute component={AddWork} />}</Route>
      <Route path="/my-applications">{() => <ProtectedRoute component={MyApplications} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={Profile} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
