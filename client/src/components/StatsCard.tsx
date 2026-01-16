import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "gray";
}

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-ios-blue dark:bg-blue-900/30",
    green: "bg-green-100 text-ios-green dark:bg-green-900/30",
    orange: "bg-orange-100 text-ios-orange dark:bg-orange-900/30",
    gray: "bg-gray-100 text-ios-gray dark:bg-gray-800",
  };

  return (
    <Card className="ios-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
