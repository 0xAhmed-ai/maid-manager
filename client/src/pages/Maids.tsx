import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle2, Clock, ListTodo } from "lucide-react";
import type { User, Task } from "@shared/schema";

export default function Maids() {
  const { t, user, maids, setMaids, tasks, setTasks } = useApp();

  const { data: maidsData, isLoading: maidsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/maids"],
    enabled: !!user,
  });

  const { data: tasksData } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  useEffect(() => {
    if (maidsData) setMaids(maidsData);
  }, [maidsData, setMaids]);

  useEffect(() => {
    if (tasksData) setTasks(tasksData);
  }, [tasksData, setTasks]);

  const getMaidStats = (maidId: string) => {
    const maidTasks = tasks.filter((task) => task.assignedTo === maidId);
    const completed = maidTasks.filter((t) => t.status === "completed").length;
    const pending = maidTasks.filter((t) => t.status === "pending").length;
    const inProgress = maidTasks.filter((t) => t.status === "in_progress").length;
    return { total: maidTasks.length, completed, pending, inProgress };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
        <div className="p-4 max-w-lg mx-auto">
          <h1 className="text-xl font-bold">{t("maids")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {maids.length} {t("maids").toLowerCase()} registered
          </p>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {maidsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : maids.length > 0 ? (
          <div className="space-y-3">
            {maids.map((maid) => {
              const stats = getMaidStats(maid.id);
              return (
                <Card
                  key={maid.id}
                  className="ios-card hover-elevate"
                  data-testid={`card-maid-${maid.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 border-2 border-border">
                        <AvatarFallback className="bg-ios-green text-white text-lg font-semibold">
                          {maid.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{maid.name}</h3>
                        <p className="text-sm text-muted-foreground">@{maid.username}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            <ListTodo className="w-3 h-3 mr-1" />
                            {stats.total} {t("tasks").toLowerCase()}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {stats.completed} {t("completed").toLowerCase()}
                          </Badge>
                          {stats.pending > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {stats.pending} {t("pending").toLowerCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="ios-card p-8 text-center mt-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t("noMaids")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Maids can register with the maid role to appear here
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
