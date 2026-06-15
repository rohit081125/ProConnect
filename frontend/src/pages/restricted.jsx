import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ShieldAlert, AlertTriangle, Send, LogOut, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { getAdminUser, sendMessage, getUserProfile } from "@/lib/api";

// Date parser helper to handle both Jackson LocalDate arrays and ISO date strings
const parseDate = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = val;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function RestrictedPage() {
  const [, setLocation] = useLocation();
  const { currentUser, logout, setUser } = useStore();
  const { toast } = useToast();
  
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const admin = await getAdminUser();
        setAdminUser(admin);
      } catch (err) {
        console.error("Failed to load admin profile for support", err);
      }
    };
    fetchAdmin();
  }, []);

  // Poll user status every 5 seconds to automatically reactivate if admin lifts restriction
  useEffect(() => {
    if (!currentUser) return;
    const userId = currentUser.id || currentUser._id;
    if (!userId) return;

    const checkStatus = async () => {
      try {
        const response = await getUserProfile(userId);
        const profileData = response?.data || response;
        if (profileData) {
          const status = (profileData.accountStatus || "active").toLowerCase();
          if (status === "active") {
            const updatedUser = {
              ...currentUser,
              ...profileData,
              id: profileData.id || userId,
              _id: profileData.id || userId,
            };
            setUser(updatedUser);
            toast({
              title: "Welcome Back! ✨",
              description: "Your account is active now.",
            });
            setLocation("/home");
          }
        }
      } catch (err) {
        console.error("Error checking restricted status", err);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [currentUser, setLocation, setUser, toast]);

  // Real-time suspension countdown timer
  useEffect(() => {
    if (!currentUser || (currentUser.accountStatus || "").toLowerCase() !== "suspended" || !currentUser.suspendedUntil) {
      return;
    }

    const calculateTimeLeft = () => {
      const parsedDate = parseDate(currentUser.suspendedUntil);
      if (!parsedDate) {
        setTimeLeft(0);
        return 0;
      }
      const difference = parsedDate.getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft(0);
        return 0;
      }
      setTimeLeft(difference);
      return difference;
    };

    calculateTimeLeft();
    const interval = setInterval(async () => {
      const diff = calculateTimeLeft();
      if (diff <= 0) {
        clearInterval(interval);
        
        // Timer reached zero! Auto-unsuspend user by fetching their updated profile
        try {
          const userId = currentUser.id || currentUser._id;
          const response = await getUserProfile(userId);
          const profileData = response?.data || response;
          if (profileData && (profileData.accountStatus || "active").toLowerCase() === "active") {
            const updatedUser = {
              ...currentUser,
              ...profileData,
              id: profileData.id || userId,
              _id: profileData.id || userId,
            };
            setUser(updatedUser);
            
            toast({
              title: "Account Reactivated! ✨",
              description: "Your suspension has expired. Welcome back to ProConnect!",
            });
            
            setLocation("/home");
          }
        } catch (err) {
          console.error("Failed to auto-unsuspend user", err);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser, setLocation, setUser, toast]);
  
  const handleLogout = () => {
    logout();
    setLocation("/login");
  };
  
  const handleSendAppeal = async () => {
    const userId = currentUser?.id || currentUser?._id;
    if (!userId || !message.trim()) return;
    
    // Fallback if adminUser endpoint fails or is loading
    const adminId = adminUser?.id || adminUser?._id || "admin"; 
    
    try {
      setSending(true);
      await sendMessage({
        senderId: userId,
        receiverId: adminId,
        message: message.trim(),
        type: "text",
      });
      
      toast({
        title: "Message sent to support",
        description: "Our administration team will review your message shortly.",
      });
      setMessage("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error?.message || "Please check your network and try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  const isBanned = (currentUser?.accountStatus || "").toLowerCase() === "banned";
  const isSuspended = (currentUser?.accountStatus || "").toLowerCase() === "suspended";
  
  const formatSuspensionDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = parseDate(dateString);
      if (!date) return String(dateString);
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(dateString);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient backgrounds to match premium styling */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-destructive/10 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-lg rounded-3xl border border-destructive/20 shadow-2xl relative bg-card/70 backdrop-blur-md">
        <CardContent className="p-6 md:p-8 flex flex-col items-center text-center space-y-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isBanned ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"} animate-pulse`}>
            {isBanned ? <ShieldAlert className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isBanned ? "Account Permanently Banned" : "Account Temporarily Suspended"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isBanned 
                ? "Your ProConnect account has been deactivated for violating platform policies."
                : "Your ProConnect account access has been temporarily restricted."}
            </p>
          </div>

          {/* Details Box */}
          <div className="w-full p-4 rounded-2xl border bg-muted/40 space-y-3 text-left">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason for restriction:</p>
              <p className="text-sm font-medium mt-1 leading-relaxed text-foreground">
                {currentUser?.adminNote || "No specific reason provided by administration."}
              </p>
            </div>
            
            {isSuspended && currentUser?.suspendedUntil && (
              <div className="pt-3 border-t border-border/60 flex flex-col items-center space-y-3 text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-start text-left">Suspension Ends In:</p>
                {timeLeft > 0 ? (
                  <div className="flex gap-2 justify-center w-full">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 min-w-[72px] flex flex-col items-center">
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        {Math.floor(timeLeft / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Days</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 min-w-[72px] flex flex-col items-center">
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        {Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Hours</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 min-w-[72px] flex flex-col items-center">
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        {Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Mins</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 min-w-[72px] flex flex-col items-center">
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        {Math.floor((timeLeft % (1000 * 60)) / 1000)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Secs</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reactivating your account...
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground self-start text-left w-full">
                  Scheduled release: <span className="font-medium text-foreground">{formatSuspensionDate(currentUser.suspendedUntil)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="w-full space-y-3 pt-2 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Contact Support / Submit Appeal</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your appeal or message to support team here..."
              className="min-h-[120px] rounded-2xl text-sm leading-relaxed"
            />
            <Button
              onClick={handleSendAppeal}
              disabled={sending || !message.trim()}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/15 transition-all"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>

          {/* Logout Button */}
          <div className="w-full pt-4 border-t flex justify-center">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-xl py-2 px-4"
            >
              <LogOut className="h-4 w-4" />
              Log Out of Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
