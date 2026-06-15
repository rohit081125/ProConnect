import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";

import { Navbar } from "./components/navbar";
import { BottomNav } from "./components/bottom-nav.jsx";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./components/ui/dialog";
import { AlertTriangle } from "lucide-react";

import { useStore } from "./lib/store";
import { getUserProfile } from "./lib/api";

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
import PublicProfile from "./pages/public-profile";
import AdminPortal from "./pages/admin";
import NotFound from "./pages/not-found";
import RestrictedPage from "./pages/restricted";

function AuthenticatedLayout({ children }) {
  const { currentUser, setUser } = useStore();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (!currentUser) return;
    const userId = currentUser.id || currentUser._id;
    if (!userId) return;

    const fetchLatestProfile = async () => {
      try {
        const profileData = await getUserProfile(userId);
        if (profileData) {
          const updatedUser = {
            ...currentUser,
            ...profileData,
            id: profileData.id || userId,
            _id: profileData.id || userId,
          };
          setUser(updatedUser);
        }
      } catch (err) {
        console.error("Failed to fetch latest user profile", err);
      }
    };

    // Initial fetch
    fetchLatestProfile();

    // Poll every 5 seconds for trust/safety status updates
    const interval = setInterval(fetchLatestProfile, 5000);
    return () => clearInterval(interval);
  }, [setUser]);

  useEffect(() => {
    if (currentUser && currentUser.warningCount > 0) {
      const userId = currentUser.id || currentUser._id || "guest";
      const seenKey = `warningCountSeen_${userId}_${currentUser.warningCount}`;
      const hasSeen = localStorage.getItem(seenKey) === "true";
      if (!hasSeen) {
        setShowWarningModal(true);
      }
    }
  }, [currentUser]);

  const handleDismissWarning = () => {
    if (currentUser) {
      const userId = currentUser.id || currentUser._id || "guest";
      const seenKey = `warningCountSeen_${userId}_${currentUser.warningCount}`;
      localStorage.setItem(seenKey, "true");
    }
    setShowWarningModal(false);
  };

  const isMessagesPage = location === "/messages";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className={`flex-1 ${isMessagesPage ? "overflow-hidden pb-0 md:pb-0" : "overflow-y-auto pb-20 md:pb-20"}`}>
        {children}
      </main>
      <BottomNav />

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-[9999] bg-black/80 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl border border-red-500/20 bg-card shadow-2xl p-6 flex flex-col items-center text-center space-y-4 align-middle transition-all">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                Account Warning Received
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account has received a warning from the ProConnect administration team. Please review the details below to ensure compliance with our platform guidelines.
              </p>

              {/* Warning Content */}
              <div className="w-full my-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-2 text-center flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider text-center">Note from Admin:</p>
                <p className="text-sm font-medium text-foreground leading-relaxed text-center break-words max-w-full">
                  {currentUser?.adminNote || "No details provided by the administrator."}
                </p>
                <p className="text-xs text-muted-foreground pt-1.5 border-t border-red-500/10 w-full text-center">
                  Total Warning Count: <span className="font-bold text-foreground">{currentUser?.warningCount || 0}</span>
                </p>
              </div>

              <div className="w-full flex justify-center">
                <Button
                  onClick={handleDismissWarning}
                  className="w-full h-11 px-8 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/35 transition-all duration-300"
                >
                  I Understand
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ component: Component }) {
  const { isAuthenticated, currentUser } = useStore();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const status = (currentUser?.accountStatus || "").toLowerCase();
  if (["banned", "suspended"].includes(status)) {
    if (location !== "/restricted") {
      return <Redirect to="/restricted" />;
    }
    return <RestrictedPage />;
  }

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function AdminRoute({ component: Component }) {
  const { currentUser } = useStore();
  const isAdmin = (currentUser?.role || "").toLowerCase() === "admin";

  if (!isAdmin) {
    return <Redirect to="/home" />;
  }

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function PublicRoute({ component: Component }) {
  const { isAuthenticated, currentUser } = useStore();

  if (isAuthenticated) {
    const status = (currentUser?.accountStatus || "").toLowerCase();
    if (["banned", "suspended"].includes(status)) {
      return <Redirect to="/restricted" />;
    }
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

      <Route path="/restricted">
        <ProtectedRoute component={RestrictedPage} />
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

      <Route path="/users/:userId">
        <PublicProfile />
      </Route>

      <Route path="/admin">
        <AdminRoute component={AdminPortal} />
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
