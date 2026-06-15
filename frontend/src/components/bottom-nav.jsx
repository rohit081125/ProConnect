import React, { useEffect, useState } from "react";
import { FileText, Home, MessageSquare, PlusCircle, UserCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { getUnreadMessageCount } from "@/lib/api";

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/messages", icon: MessageSquare, label: "Messages" },
  { path: "/add-work", icon: PlusCircle, label: "Post" },
  { path: "/my-applications", icon: FileText, label: "Applications" },
  { path: "/profile", icon: UserCircle, label: "Profile" },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const { currentUser } = useStore();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const currentUserId = currentUser?._id || currentUser?.id || "";

  const fetchUnreadMessages = async () => {
    if (!currentUserId) return;
    try {
      const data = await getUnreadMessageCount(currentUserId);
      setUnreadMessages(data?.unreadCount || 0);
    } catch (err) {
      console.error("BottomNav unread error", err);
    }
  };

  useEffect(() => {
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, [currentUserId, location]);

  useEffect(() => {
    window.addEventListener("messagesMarkedRead", fetchUnreadMessages);
    return () => {
      window.removeEventListener("messagesMarkedRead", fetchUnreadMessages);
    };
  }, [currentUserId]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          const isCenter = item.path === "/add-work";
          const isMessagesAlert = item.path === "/messages" && unreadMessages > 0;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => setLocation(item.path)}
              className={`relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-medium transition ${
                isActive
                  ? "text-primary font-bold"
                  : isMessagesAlert
                    ? "text-foreground font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
              aria-label={item.label}
            >
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                  isCenter
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isActive
                      ? "bg-primary/10"
                      : isMessagesAlert
                        ? "bg-muted text-foreground border border-border/50 shadow-sm"
                        : ""
                }`}
              >
                <Icon className={`h-4 w-4 ${isMessagesAlert ? "stroke-[2.5] text-foreground" : ""}`} />
              </span>
              <span className="w-full truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
