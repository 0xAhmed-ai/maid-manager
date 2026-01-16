import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, CheckCircle2, Circle, AlertCircle, Calendar, User, ChevronRight } from "lucide-react";
import type { Task, User as UserType } from "@shared/schema";
import { format, isToday, isPast, isTomorrow } from "date-fns";

interface TaskCardProps {
  task: Task;
  assignee?: UserType;
  onClick?: () => void;
  showAssignee?: boolean;
}

export function TaskCard({ task, assignee, onClick, showAssignee = true }: TaskCardProps) {
  const { t, isRtl } = useApp();

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-ios-green" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-ios-blue" />;
      default:
        return <Circle className="w-5 h-5 text-ios-orange" />;
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

  const getDeadlineText = () => {
    if (!task.deadline) return null;
    const deadline = new Date(task.deadline);
    if (isToday(deadline)) return t("today");
    if (isTomorrow(deadline)) return "Tomorrow";
    if (isPast(deadline) && task.status !== "completed") return t("overdue");
    return format(deadline, "MMM d");
  };

  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== "completed";

  return (
    <Card
      className={`ios-card hover-elevate active-elevate-2 cursor-pointer transition-all ${
        task.status === "completed" ? "opacity-75" : ""
      }`}
      onClick={onClick}
      data-testid={`card-task-${task.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-lg font-semibold leading-tight ${
                  task.status === "completed" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </h3>
              <ChevronRight className={`w-5 h-5 text-muted-foreground flex-shrink-0 ${isRtl ? "rotate-180" : ""}`} />
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
                {t(task.status === "in_progress" ? "inProgress" : task.status)}
              </Badge>
              <Badge variant="secondary" className={`text-xs ${getPriorityColor()}`}>
                {t(task.priority)}
              </Badge>
              {task.deadline && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                  {isOverdue ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5" />
                  )}
                  <span>{getDeadlineText()}</span>
                </div>
              )}
            </div>
            {showAssignee && assignee && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-accent">
                    {assignee.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{assignee.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
