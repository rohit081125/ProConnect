import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Bell,
  BriefcaseBusiness,
  FileText,
  Home,
  LogOut,
  Moon,
  Shield,
  Sun,
  UserCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/theme-provider";
import { useStore } from "@/lib/store";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getUnreadMessageCount,
} from "@/lib/api";

export function Navbar() {
  const { currentUser, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const currentUserId =
    currentUser?._id || currentUser?.id || currentUser?.userId || "";
  const displayName =
    currentUser?.name ||
    currentUser?.username ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profileImage = currentUser?.profileImage || currentUser?.photo || "";
  const isAdmin = (currentUser?.role || "").toLowerCase() === "admin";

  const navItems = [
    { path: "/home", icon: Home, label: "Discover" },
    { path: "/messages", icon: MessageSquare, label: "Messages" },
    { path: "/add-work", icon: BriefcaseBusiness, label: "Post Work" },
    { path: "/my-applications", icon: FileText, label: "Applications" },
    { path: "/profile", icon: UserCircle, label: "Profile" },
    ...(isAdmin ? [{ path: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  const fetchNotifications = async () => {
    if (!currentUserId) return;

    try {
      const data = await getNotifications(currentUserId);
      setNotifications(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };

  const fetchUnread = async () => {
    if (!currentUserId) return;

    try {
      const data = await getUnreadNotificationCount(currentUserId);
      setUnreadCount(data?.unreadCount || data?.count || 0);
    } catch (err) {
      console.error("Unread count error", err);
    }
  };

  const fetchUnreadMessages = async () => {
    if (!currentUserId) return;

    try {
      const data = await getUnreadMessageCount(currentUserId);
      setUnreadMessages(data?.unreadCount || 0);
    } catch (err) {
      console.error("Unread message count error", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnread();
    fetchUnreadMessages();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnread();
      fetchUnreadMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUserId, location]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchUnreadMessages();
    };

    window.addEventListener("messagesMarkedRead", handleUpdate);
    return () => {
      window.removeEventListener("messagesMarkedRead", handleUpdate);
    };
  }, [currentUserId]);

  const handleNotificationClick = async (id, notif) => {
    if (!id) return;

    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          (item.id || item._id) === id ? { ...item, read: true, isRead: true } : item
        )
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      if (isAdmin && notif) {
        if (notif.type === "USER_REPORTED") {
          setLocation("/admin?tab=reports");
        } else if (notif.type === "APPEAL_SUBMITTED" || notif.type === "SUPPORT_MESSAGE_RECEIVED") {
          setLocation("/admin?tab=support-messages");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead(currentUserId);
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, read: true, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const userNotifs = notifications.slice(0, 10);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-md shadow-primary/5 transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setLocation("/home")}
            className="flex shrink-0 items-center gap-1.5 group transition-all duration-300 hover:opacity-90"
          >
            <div className="relative">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                Pro
              </span>
              <span className="text-2xl font-bold text-foreground">
                Connect
              </span>
              <div className="absolute -top-1 -right-4">
                <Sparkles className="h-3 w-3 text-accent animate-pulse" />
              </div>
            </div>
          </button>

          <div className="hidden md:block flex-1" />

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted/65 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-foreground/80 hover:text-primary transition-colors" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400 hover:text-amber-300 transition-colors animate-pulse" />
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Notifications"
                  className={`relative rounded-full hover:bg-muted/65 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    unreadCount > 0 ? "bg-primary/10 text-primary hover:bg-primary/15" : ""
                  }`}
                >
                  <Bell className={`h-5 w-5 ${unreadCount > 0 ? "stroke-[2.4] animate-bounce text-red-500" : ""}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white shadow-[0_0_10px_rgba(239,68,68,0.8)] border border-background animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80 p-0 border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl rounded-xl overflow-hidden mt-2">
                <div className="flex justify-between items-center border-b border-border/50 p-4 bg-muted/30">
                  <h4 className="text-sm font-semibold tracking-tight">Notifications</h4>
                  {notifications.length > 0 && (
                    <button 
                      type="button" 
                      onClick={handleMarkAll} 
                      className="text-xs text-primary hover:text-primary/80 font-medium hover:underline transition-all"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <ScrollArea className="max-h-72">
                  {userNotifs.length === 0 ? (
                    <p className="p-6 text-center text-xs text-muted-foreground">
                      All caught up! No notifications yet.
                    </p>
                  ) : (
                    userNotifs.map((notif) => {
                      const id = notif.id || notif._id;
                      const read = notif.read || notif.isRead;

                      return (
                        <div
                          key={id}
                          onClick={() => handleNotificationClick(id, notif)}
                          className={`cursor-pointer border-b border-border/30 p-4 transition-all duration-200 hover:bg-muted/50 flex gap-3 ${
                            !read ? "bg-red-500/5 dark:bg-red-500/10 font-bold border-l-4 border-l-red-500" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-tight">{notif.message}</p>
                            <p className="mt-1.5 text-[10px] text-muted-foreground">
                              {notif.createdAt
                                ? new Date(notif.createdAt).toLocaleString()
                                : "Just now"}
                            </p>
                          </div>
                          {!read && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {currentUser && (
              <button
                type="button"
                onClick={() => setLocation("/profile")}
                className="hidden items-center gap-2.5 rounded-full border border-border/50 bg-card/40 py-1 pl-1 pr-3.5 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:scale-[1.03] active:scale-[0.97] sm:flex shadow-sm"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-sm">
                    {initials}
                  </div>
                )}
                <span className="hidden max-w-28 truncate text-xs font-semibold text-foreground/90 sm:block">
                  {displayName}
                </span>
              </button>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={handleLogout}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Dock on Desktop */}
      <nav className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 items-center gap-1.5 rounded-full border border-border bg-background/80 backdrop-blur-lg p-1.5 shadow-xl shadow-primary/5 transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.path;
          const isMessagesAlert = item.path === "/messages" && unreadMessages > 0;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => setLocation(item.path)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold"
                  : isMessagesAlert
                    ? "text-foreground bg-muted/90 border border-border/80 font-black shadow-md shadow-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
              }`}
            >
              <Icon className={`h-4 w-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"} ${isMessagesAlert ? "stroke-[2.5] text-foreground" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
