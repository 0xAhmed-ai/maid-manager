import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { TaskCard } from "@/components/TaskCard";
import { StatsCard } from "@/components/StatsCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";
import type { Task } from "@shared/schema";
import { useLocation } from "wouter";

export default function MaidTasks() {
  const { t, user, tasks, setTasks } = useApp();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  const { data: tasksData, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/my"],
    enabled: !!user,
  });

  useEffect(() => {
    if (tasksData) setTasks(tasksData);
  }, [tasksData, setTasks]);

  const completedTasks = tasks.filter((task) => task.status === "completed");
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return task.status === "pending";
    if (activeTab === "in_progress") return task.status === "in_progress";
    if (activeTab === "completed") return task.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div>
            <p className="text-sm text-muted-foreground">{t("welcomeBack")}</p>
            <h1 className="text-xl font-bold">{user?.name}</h1>
          </div>
          <Avatar className="w-10 h-10 border-2 border-border">
            <AvatarFallback className="bg-ios-green text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        <section>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="ios-card p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ListTodo className="w-5 h-5 text-ios-blue" />
                  </div>
                </div>
                <p className="text-xl font-bold">{tasks.length}</p>
                <p className="text-xs text-muted-foreground">{t("totalTasks")}</p>
              </div>
              <div className="ios-card p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-ios-green" />
                  </div>
                </div>
                <p className="text-xl font-bold">{completedTasks.length}</p>
                <p className="text-xs text-muted-foreground">{t("completed")}</p>
              </div>
              <div className="ios-card p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-ios-orange" />
                  </div>
                </div>
                <p className="text-xl font-bold">{pendingTasks.length}</p>
                <p className="text-xs text-muted-foreground">{t("pending")}</p>
              </div>
            </div>
          )}
        </section>

        <section>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all" data-testid="tab-all">{t("allTasks")}</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">{t("pending")}</TabsTrigger>
              <TabsTrigger value="in_progress" data-testid="tab-in-progress">{t("inProgress")}</TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">{t("completed")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showAssignee={false}
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
      </main>

      <BottomNav />
    </div>
  );
}
