import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BottomNav } from "@/components/BottomNav";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Camera,
  MessageSquare,
  User,
  Loader2,
} from "lucide-react";
import type { Task, User as UserType } from "@shared/schema";
import { format } from "date-fns";

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:id");
  const [, navigate] = useLocation();
  const { t, user, tasks, updateTask, deleteTask, maids, setMaids, isRtl } = useApp();
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notes, setNotes] = useState("");

  const taskId = params?.id;
  const task = tasks.find((t) => t.id === taskId);

  const { data: maidsData } = useQuery<UserType[]>({
    queryKey: ["/api/users/maids"],
    enabled: !!user,
  });

  useEffect(() => {
    if (maidsData) setMaids(maidsData);
  }, [maidsData, setMaids]);

  useEffect(() => {
    if (task?.notes) setNotes(task.notes);
  }, [task?.notes]);

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await apiRequest("PATCH", `/api/tasks/${taskId}`, data);
      return res.json();
    },
    onSuccess: (updatedTask) => {
      updateTask(updatedTask);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t("taskUpdated") });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      deleteTask(taskId!);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: t("taskDeleted") });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleComplete = () => {
    updateTaskMutation.mutate({
      status: "completed",
      completedAt: new Date(),
    });
  };

  const handleStartProgress = () => {
    updateTaskMutation.mutate({ status: "in_progress" });
  };

  const handleSaveNotes = () => {
    updateTaskMutation.mutate({ notes });
  };

  const assignee = maids.find((m) => m.id === task?.assignedTo);
  const isOwner = user?.role === "owner";
  const isMaid = user?.role === "maid";

  if (!task) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
          <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              data-testid="button-back"
            >
              <ArrowLeft className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
            </Button>
            <h1 className="text-xl font-bold">{t("taskDetails")}</h1>
          </div>
        </header>
        <main className="p-4 max-w-lg mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 rounded" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-ios-green" />;
      case "in_progress":
        return <Clock className="w-6 h-6 text-ios-blue" />;
      default:
        return <Circle className="w-6 h-6 text-ios-orange" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              data-testid="button-back"
            >
              <ArrowLeft className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
            </Button>
            <h1 className="text-xl font-bold">{t("taskDetails")}</h1>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditForm(true)}
                data-testid="button-edit-task"
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
                data-testid="button-delete-task"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        <Card className="ios-card">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {getStatusIcon()}
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{task.title}</h2>
                {task.description && (
                  <p className="text-muted-foreground">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className={getStatusColor()}>
                    {t(task.status === "in_progress" ? "inProgress" : task.status)}
                  </Badge>
                  <Badge variant="secondary" className={getPriorityColor()}>
                    {t(task.priority)} {t("priority").toLowerCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="ios-card">
          <CardContent className="p-5 space-y-4">
            {task.deadline && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Calendar className="w-5 h-5 text-ios-blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("deadline")}</p>
                  <p className="font-medium">{format(new Date(task.deadline), "MMMM d, yyyy")}</p>
                </div>
              </div>
            )}
            {assignee && (
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-ios-green text-white">
                    {assignee.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">{t("assignedTo")}</p>
                  <p className="font-medium">{assignee.name}</p>
                </div>
              </div>
            )}
            {task.completedAt && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-ios-green" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("completedAt")}</p>
                  <p className="font-medium">{format(new Date(task.completedAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="ios-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">{t("notes")}</h3>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("addNote")}
              className="min-h-24 resize-none"
              data-testid="input-notes"
            />
            <Button
              className="mt-3 w-full"
              variant="secondary"
              onClick={handleSaveNotes}
              disabled={updateTaskMutation.isPending}
              data-testid="button-save-notes"
            >
              {updateTaskMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("save")
              )}
            </Button>
          </CardContent>
        </Card>

        {task.status !== "completed" && (
          <div className="space-y-3 pt-2">
            {task.status === "pending" && (
              <Button
                className="w-full h-12"
                variant="secondary"
                onClick={handleStartProgress}
                disabled={updateTaskMutation.isPending}
                data-testid="button-start-progress"
              >
                <Clock className="w-5 h-5 mr-2" />
                Start Progress
              </Button>
            )}
            <Button
              className="w-full h-12 bg-ios-green hover:bg-ios-green/90"
              onClick={handleComplete}
              disabled={updateTaskMutation.isPending}
              data-testid="button-mark-complete"
            >
              {updateTaskMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {t("markComplete")}
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      <TaskForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={async (data) => {
          await updateTaskMutation.mutateAsync(data);
          setShowEditForm(false);
        }}
        task={task}
        maids={maids}
        isLoading={updateTaskMutation.isPending}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTask")}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTaskMutation.mutate()}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteTaskMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("deleteTask")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
