import { useLocation, Link } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { LayoutDashboard, ListTodo, Users, Bell, Settings } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();
  const { t, user, unreadCount } = useApp();

  const isOwner = user?.role === "owner";

  const ownerLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/tasks", icon: ListTodo, label: t("tasks") },
    { href: "/maids", icon: Users, label: t("maids") },
    { href: "/notifications", icon: Bell, label: t("notifications"), badge: unreadCount },
    { href: "/settings", icon: Settings, label: t("settings") },
  ];

  const maidLinks = [
    { href: "/my-tasks", icon: ListTodo, label: t("myTasks") },
    { href: "/notifications", icon: Bell, label: t("notifications"), badge: unreadCount },
    { href: "/settings", icon: Settings, label: t("settings") },
  ];

  const links = isOwner ? ownerLinks : maidLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href}>
              <a
                className={`flex flex-col items-center justify-center flex-1 h-full relative touch-target ${
                  isActive ? "text-ios-blue" : "text-muted-foreground"
                }`}
                data-testid={`nav-${link.href.replace("/", "")}`}
              >
                <div className="relative">
                  <link.icon className="w-6 h-6" />
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1">{link.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
