import { Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Navbar() {
  const { currentUser, notifications, markNotificationRead } = useStore();
  const { theme, toggleTheme } = useTheme();
  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;
  const userNotifs = notifications.filter(n => n.userId === currentUser?.id).slice(0, 10);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-0" data-testid="logo-proconnect">
          <span className="text-xl font-bold text-primary">Pro</span>
          <span className="text-xl font-bold text-accent">Connect</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="relative" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-3 border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
              </div>
              <ScrollArea className="max-h-64">
                {userNotifs.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No notifications yet</p>
                ) : (
                  userNotifs.map(n => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-3 border-b last:border-0 cursor-pointer hover-elevate ${!n.read ? "bg-primary/5" : ""}`}
                      onClick={() => markNotificationRead(n.id)}
                      data-testid={`notification-item-${n.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? "font-medium" : "text-muted-foreground"}`}>{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                      </div>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </div>
                  ))
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {currentUser && (
            <span className="text-sm font-medium text-muted-foreground hidden sm:block" data-testid="text-username">
              {currentUser.username}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
