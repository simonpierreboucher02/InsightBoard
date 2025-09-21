import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartWidgetProps {
  title: string;
  data: PieChartData[];
}

export function PieChartWidget({ title, data }: PieChartWidgetProps) {
  return (
    <Card data-testid="widget-pie-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-pie-chart-title">{title}</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-pie-chart-settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: number) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm" data-testid={`pie-chart-legend-${index}`}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span data-testid={`text-pie-chart-category-${index}`}>{item.name}</span>
              </div>
              <span className="font-medium" data-testid={`text-pie-chart-value-${index}`}>{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
