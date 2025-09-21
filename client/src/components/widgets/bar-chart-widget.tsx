import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDatasetData, processDataForChart } from "@/hooks/useDatasetData";

interface BarChartData {
  name: string;
  value: number;
}

interface BarChartWidgetProps {
  title: string;
  data?: BarChartData[];
  datasetId?: string;
  xColumn?: string;
  yColumn?: string;
}

export function BarChartWidget({ title, data, datasetId, xColumn = 'name', yColumn = 'value' }: BarChartWidgetProps) {
  const { data: dataset, isLoading } = useDatasetData(datasetId || null);

  // Use dataset data if available, otherwise use provided data
  const chartData = datasetId && dataset 
    ? processDataForChart(dataset, xColumn, yColumn)
    : data || [];
  return (
    <Card data-testid="widget-bar-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-bar-chart-title">{title}</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-bar-chart-settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading && datasetId ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading chart data...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-muted-foreground"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                className="text-muted-foreground"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: number) => [`$${value}`, 'Sales']}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
