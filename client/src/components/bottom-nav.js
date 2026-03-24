import { Home, MessageSquare, PlusCircle, FileText, UserCircle } from "lucide-react";
import { useLocation } from "wouter";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const navItems = [{
  path: "/home",
  icon: Home,
  label: "Home"
}, {
  path: "/messages",
  icon: MessageSquare,
  label: "Messages"
}, {
  path: "/add-work",
  icon: PlusCircle,
  label: "Post"
}, {
  path: "/my-applications",
  icon: FileText,
  label: "Applications"
}, {
  path: "/profile",
  icon: UserCircle,
  label: "Profile"
}];
export function BottomNav() {
  const [location, setLocation] = useLocation();
  return /*#__PURE__*/_jsx("nav", {
    className: "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    children: /*#__PURE__*/_jsx("div", {
      className: "flex h-16 items-center justify-around px-2",
      children: navItems.map(item => {
        const isActive = location === item.path || item.path === "/home" && location === "/home";
        const isCenter = item.path === "/add-work";
        return /*#__PURE__*/_jsxs("button", {
          onClick: () => setLocation(item.path),
          className: `flex flex-col items-center gap-1 py-1 px-3 rounded-md transition-colors ${isCenter ? "relative" : isActive ? "text-primary" : "text-muted-foreground"}`,
          "data-testid": `nav-${item.label.toLowerCase()}`,
          children: [isCenter ? /*#__PURE__*/_jsx("div", {
            className: "flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-primary text-primary-foreground shadow-lg",
            children: /*#__PURE__*/_jsx(item.icon, {
              className: "h-5 w-5"
            })
          }) : /*#__PURE__*/_jsx(item.icon, {
            className: `h-5 w-5 ${isActive ? "text-primary" : ""}`
          }), /*#__PURE__*/_jsx("span", {
            className: `text-[10px] font-medium ${isCenter ? "-mt-0.5" : ""} ${isActive && !isCenter ? "text-primary" : ""}`,
            children: item.label
          })]
        }, item.path);
      })
    })
  });
}