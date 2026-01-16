import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCircle2, Clock, AlertCircle, User, CheckCheck } from "lucide-react";
import type { Notification as NotificationType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { t, user, notifications, setNotifications, markNotificationRead } = useApp();

  const { data: notificationsData, isLoading } = useQuery<NotificationType[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  useEffect(() => {
    if (notificationsData) setNotifications(notificationsData);
  }, [notificationsData, setNotifications]);

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      markNotificationRead(id);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle2 className="w-5 h-5 text-ios-green" />;
      case "task_assigned":
        return <Clock className="w-5 h-5 text-ios-blue" />;
      case "task_overdue":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-ios-orange" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "task_completed":
        return "bg-green-100 dark:bg-green-900/30";
      case "task_assigned":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "task_overdue":
        return "bg-red-100 dark:bg-red-900/30";
      default:
        return "bg-orange-100 dark:bg-orange-900/30";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold">{t("notifications")}</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`ios-card hover-elevate cursor-pointer transition-all ${
                  !notification.read ? "ring-2 ring-ios-blue/20" : ""
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markReadMutation.mutate(notification.id);
                  }
                }}
                data-testid={`notification-${notification.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${getIconBg(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold ${!notification.read ? "" : "text-muted-foreground"}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-ios-blue rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="ios-card p-8 text-center mt-8">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t("noNotifications")}</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
