import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";

import { Navbar } from "./components/navbar";
import { BottomNav } from "./components/bottom-nav";

import { useStore } from "./lib/store";

import Landing from "./pages/landing";
import About from "./pages/about";
import Signup from "./pages/signup";
import SetupProfile from "./pages/setup-profile";
import Login from "./pages/login";
import Home from "./pages/home";
import Messages from "./pages/messages";
import AddWork from "./pages/add-work";
import MyApplications from "./pages/my-applications";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";

function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function ProtectedRoute({ component: Component }) {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function PublicRoute({ component: Component }) {
  const { isAuthenticated } = useStore();

  if (isAuthenticated) {
    return <Redirect to="/home" />;
  }

  return <Component />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute component={Landing} />
      </Route>

      <Route path="/about">
        <PublicRoute component={About} />
      </Route>

      <Route path="/signup">
        <PublicRoute component={Signup} />
      </Route>

      <Route path="/setup-profile">
        <SetupProfile />
      </Route>

      <Route path="/login">
        <PublicRoute component={Login} />
      </Route>

      <Route path="/home">
        <ProtectedRoute component={Home} />
      </Route>

      <Route path="/messages">
        <ProtectedRoute component={Messages} />
      </Route>

      <Route path="/add-work">
        <ProtectedRoute component={AddWork} />
      </Route>

      <Route path="/my-applications">
        <ProtectedRoute component={MyApplications} />
      </Route>

      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;