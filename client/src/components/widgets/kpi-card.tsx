import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Percent,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: "dollar" | "shopping-cart" | "users" | "percentage";
}

const iconMap = {
  dollar: DollarSign,
  "shopping-cart": ShoppingCart,
  users: Users,
  percentage: Percent,
};

const colorMap = {
  dollar: "text-green-600 bg-green-100 dark:bg-green-900/20",
  "shopping-cart": "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
  users: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
  percentage: "text-red-600 bg-red-100 dark:bg-red-900/20",
};

export function KPICard({ title, value, change, changeType, icon }: KPICardProps) {
  const IconComponent = iconMap[icon];
  const iconColorClass = colorMap[icon];

  return (
    <Card data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground" data-testid={`text-kpi-title-${title.toLowerCase().replace(/\s+/g, "-")}`}>
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground" data-testid={`text-kpi-value-${title.toLowerCase().replace(/\s+/g, "-")}`}>
              {value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {changeType === "positive" ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className={cn(
                "text-sm",
                changeType === "positive" ? "text-green-600" : "text-red-600"
              )} data-testid={`text-kpi-change-${title.toLowerCase().replace(/\s+/g, "-")}`}>
                {change} from last month
              </p>
            </div>
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColorClass)}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
