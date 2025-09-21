import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartWidgetProps {
  title: string;
  subtitle?: string;
}

// Sample data - in real app this would come from datasets
const sampleData = [
  { date: 'Jan 1', revenue: 12000 },
  { date: 'Jan 8', revenue: 19000 },
  { date: 'Jan 15', revenue: 15000 },
  { date: 'Jan 22', revenue: 25000 },
  { date: 'Jan 29', revenue: 22000 },
  { date: 'Feb 5', revenue: 30000 },
  { date: 'Feb 12', revenue: 28000 },
  { date: 'Feb 19', revenue: 35000 },
];

export function LineChartWidget({ title, subtitle }: LineChartWidgetProps) {
  return (
    <Card data-testid="widget-line-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle data-testid="text-line-chart-title">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground" data-testid="text-line-chart-subtitle">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="30-days">
              <SelectTrigger className="w-32" data-testid="select-line-chart-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30-days">Last 30 days</SelectItem>
                <SelectItem value="90-days">Last 90 days</SelectItem>
                <SelectItem value="1-year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" data-testid="button-line-chart-settings">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
