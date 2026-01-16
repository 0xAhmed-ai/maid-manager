import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { TaskCard } from "@/components/TaskCard";
import { StatsCard } from "@/components/StatsCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";
import type { Task, User } from "@shared/schema";
import { isToday } from "date-fns";
import { useLocation } from "wouter";

export default function OwnerDashboard() {
  const { t, user, tasks, setTasks, maids, setMaids } = useApp();
  const [, navigate] = useLocation();

  const { data: tasksData, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const { data: maidsData, isLoading: maidsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/maids"],
    enabled: !!user,
  });

  useEffect(() => {
    if (tasksData) setTasks(tasksData);
  }, [tasksData, setTasks]);

  useEffect(() => {
    if (maidsData) setMaids(maidsData);
  }, [maidsData, setMaids]);

  const todayTasks = tasks.filter(
    (task) => task.deadline && isToday(new Date(task.deadline))
  );
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");

  const getMaid = (id: string | null) => maids.find((m) => m.id === id);

  const recentTasks = [...tasks]
    .sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const isLoading = tasksLoading || maidsLoading;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div>
            <p className="text-sm text-muted-foreground">{t("welcomeBack")}</p>
            <h1 className="text-xl font-bold">{user?.name}</h1>
          </div>
          <Avatar className="w-10 h-10 border-2 border-border">
            <AvatarFallback className="bg-ios-blue text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">{t("statistics")}</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatsCard
                title={t("totalTasks")}
                value={tasks.length}
                icon={ListTodo}
                color="blue"
              />
              <StatsCard
                title={t("completedTasks")}
                value={completedTasks.length}
                icon={CheckCircle2}
                color="green"
              />
              <StatsCard
                title={t("pendingTasks")}
                value={pendingTasks.length}
                icon={Clock}
                color="orange"
              />
              <StatsCard
                title={t("inProgress")}
                value={inProgressTasks.length}
                icon={TrendingUp}
                color="gray"
              />
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t("todayTasks")}</h2>
            <span className="text-sm text-muted-foreground">
              {todayTasks.length} {t("tasks").toLowerCase()}
            </span>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignee={getMaid(task.assignedTo)}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="ios-card p-8 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-ios-green mb-3" />
              <p className="text-muted-foreground">{t("noTasks")}</p>
            </div>
          )}
        </section>

        {recentTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{t("allTasks")}</h2>
              <button
                onClick={() => navigate("/tasks")}
                className="text-sm text-ios-blue font-medium"
                data-testid="button-view-all-tasks"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignee={getMaid(task.assignedTo)}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
