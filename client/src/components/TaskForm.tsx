import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Task, TaskPriority, User } from "@shared/schema";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  task?: Task | null;
  maids: User[];
  isLoading?: boolean;
}

export function TaskForm({ open, onClose, onSubmit, task, maids, isLoading }: TaskFormProps) {
  const { t } = useApp();
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium" as TaskPriority,
    assignedTo: task?.assignedTo || "",
    deadline: task?.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      assignedTo: formData.assignedTo || null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {task ? t("editTask") : t("createTask")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              {t("taskTitle")}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t("taskTitle")}
              className="h-12 text-base"
              required
              data-testid="input-task-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("taskDescription")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("taskDescription")}
              className="min-h-24 text-base resize-none"
              data-testid="input-task-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("priority")}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
              >
                <SelectTrigger className="h-12" data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("low")}</SelectItem>
                  <SelectItem value="medium">{t("medium")}</SelectItem>
                  <SelectItem value="high">{t("high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium">
                {t("deadline")}
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="h-12"
                data-testid="input-deadline"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("assignTo")}</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
            >
              <SelectTrigger className="h-12" data-testid="select-assignee">
                <SelectValue placeholder={t("assignTo")} />
              </SelectTrigger>
              <SelectContent>
                {maids.map((maid) => (
                  <SelectItem key={maid.id} value={maid.id}>
                    {maid.name}
                  </SelectItem>
                ))}
                {maids.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {t("noMaids")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
              data-testid="button-cancel"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12"
              disabled={isLoading}
              data-testid="button-save-task"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
