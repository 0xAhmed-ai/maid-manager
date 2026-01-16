import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BottomNav } from "@/components/BottomNav";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ListTodo } from "lucide-react";
import type { Task, User } from "@shared/schema";
import { useLocation } from "wouter";

export default function Tasks() {
  const { t, user, tasks, setTasks, addTask, maids, setMaids } = useApp();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: tasksData, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const { data: maidsData } = useQuery<User[]>({
    queryKey: ["/api/users/maids"],
    enabled: !!user,
  });

  useEffect(() => {
    if (tasksData) setTasks(tasksData);
  }, [tasksData, setTasks]);

  useEffect(() => {
    if (maidsData) setMaids(maidsData);
  }, [maidsData, setMaids]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: (newTask) => {
      addTask(newTask);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t("taskCreated") });
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && task.status === "pending";
    if (activeTab === "in_progress") return matchesSearch && task.status === "in_progress";
    if (activeTab === "completed") return matchesSearch && task.status === "completed";
    return matchesSearch;
  });

  const getMaid = (id: string | null) => maids.find((m) => m.id === id);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
        <div className="p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">{t("tasks")}</h1>
            <Button
              size="icon"
              onClick={() => setShowForm(true)}
              data-testid="button-create-task"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`${t("tasks")}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              data-testid="input-search-tasks"
            />
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" data-testid="tab-all">{t("allTasks")}</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">{t("pending")}</TabsTrigger>
            <TabsTrigger value="in_progress" data-testid="tab-in-progress">{t("inProgress")}</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">{t("completed")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={getMaid(task.assignedTo)}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="ios-card p-8 text-center mt-8">
            <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t("noTasks")}</p>
            <Button
              className="mt-4"
              onClick={() => setShowForm(true)}
              data-testid="button-create-first-task"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("createTask")}
            </Button>
          </div>
        )}
      </main>

      <TaskForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        onSubmit={async (data) => {
          await createTaskMutation.mutateAsync(data);
        }}
        task={editingTask}
        maids={maids}
        isLoading={createTaskMutation.isPending}
      />

      <BottomNav />
    </div>
  );
}
