import { Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api";

export function Navbar() {
  const { currentUser } = useStore();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // 🔥 Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUserId) return;
    try {
      const data = await getNotifications(currentUserId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };

  const fetchUnread = async () => {
    if (!currentUserId) return;
    try {
      const data = await getUnreadNotificationCount(currentUserId);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      console.error("Unread count error", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnread();

    // 🔥 Auto refresh every 5 sec (real-time feel)
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnread();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleNotificationClick = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead(currentUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const userNotifs = notifications.slice(0, 10);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-400/30 bg-gradient-to-r from-blue-500/20 via-blue-500/15 to-blue-500/20 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">

        {/* LOGO */}
        <div className="flex items-center gap-1 cursor-pointer">
          <span className="text-2xl font-bold text-blue-400">Pro</span>
          <span className="text-2xl font-bold">Connect</span>
        </div>

        <div className="flex items-center gap-3">

          {/* THEME */}
          <Button size="icon" variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </Button>

          {/* 🔔 NOTIFICATION */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={`relative rounded-full ${
                  unreadCount > 0
                    ? "bg-blue-500/20 text-blue-500 font-bold"
                    : ""
                }`}
              >
                <Bell className={`h-5 w-5 ${unreadCount > 0 ? "stroke-[2.6]" : ""}`} />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold bg-blue-500 text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 flex justify-between border-b">
                <h4 className="text-sm font-semibold">Notifications</h4>

                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-xs text-blue-500"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <ScrollArea className="max-h-72">
                {userNotifs.length === 0 ? (
                  <p className="p-4 text-sm text-center">
                    No notifications yet
                  </p>
                ) : (
                  userNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`p-4 cursor-pointer border-b ${
                        !notif.read
                          ? "bg-blue-500/10 font-bold"
                          : ""
                      }`}
                    >
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* PROFILE */}
          {currentUser && (
            <div className="flex items-center gap-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  className="h-9 w-9 rounded-full"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  {initials}
                </div>
              )}
              <span className="text-sm font-semibold hidden sm:block">
                {displayName}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}