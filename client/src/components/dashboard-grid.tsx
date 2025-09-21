import { KPICard } from "./widgets/kpi-card";
import { LineChartWidget } from "./widgets/line-chart-widget";
import { PieChartWidget } from "./widgets/pie-chart-widget";
import { DataTableWidget } from "./widgets/data-table-widget";
import { BarChartWidget } from "./widgets/bar-chart-widget";

interface WidgetConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'table' | 'kpi';
  title: string;
  datasetId?: string;
  xColumn?: string;
  yColumn?: string;
  position: { x: number; y: number; w: number; h: number };
}

interface DashboardLayoutConfig {
  widgets: WidgetConfig[];
  grid?: { cols: number; rows: number };
  description?: string;
  lastUpdated?: string;
}

interface DashboardGridProps {
  layout: DashboardLayoutConfig;
}

export function DashboardGrid({ layout }: DashboardGridProps) {
  // Check if we have configured widgets or show sample widgets
  const hasConfiguredWidgets = layout?.widgets && layout.widgets.length > 0;
  
  if (hasConfiguredWidgets) {
    return (
      <div className="space-y-6" data-testid="dashboard-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {layout.widgets.map((widget) => (
            <div key={widget.id} data-testid={`widget-${widget.id}`}>
              {widget.type === 'bar' && (
                <BarChartWidget
                  title={widget.title}
                  datasetId={widget.datasetId}
                  xColumn={widget.xColumn || 'name'}
                  yColumn={widget.yColumn || 'value'}
                />
              )}
              {widget.type === 'line' && (
                <LineChartWidget
                  title={widget.title}
                  subtitle={widget.datasetId ? 'Connected to dataset' : undefined}
                />
              )}
              {widget.type === 'pie' && (
                <PieChartWidget
                  title={widget.title}
                  data={[]} // This would need to be processed from dataset
                />
              )}
              {widget.type === 'table' && (
                <DataTableWidget
                  title={widget.title}
                  data={[]} // This would need to be processed from dataset
                  columns={[]} // This would need to be processed from dataset
                />
              )}
            </div>
          ))}
        </div>
        
        {layout.widgets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No widgets configured yet.</p>
            <p className="text-sm">Enter edit mode to add widgets and connect them to your datasets.</p>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback to sample widgets for demonstration
  // Sample data - shown when no configured widgets exist
  const sampleMetrics = [
    {
      title: "Total Revenue",
      value: "$847,392",
      change: "+12.3%",
      changeType: "positive" as const,
      icon: "dollar" as const,
    },
    {
      title: "Orders",
      value: "12,847",
      change: "+8.7%",
      changeType: "positive" as const,
      icon: "shopping-cart" as const,
    },
    {
      title: "Customers",
      value: "8,392",
      change: "+15.2%",
      changeType: "positive" as const,
      icon: "users" as const,
    },
    {
      title: "Conversion",
      value: "3.47%",
      change: "-2.1%",
      changeType: "negative" as const,
      icon: "percentage" as const,
    },
  ];

  const sampleOrders = [
    {
      id: "#ORD-001",
      customer: "John Smith",
      product: "MacBook Pro",
      amount: "$2,499",
      status: "Completed",
      statusColor: "green",
    },
    {
      id: "#ORD-002",
      customer: "Sarah Johnson",
      product: "iPhone 15",
      amount: "$999",
      status: "Processing",
      statusColor: "yellow",
    },
    {
      id: "#ORD-003",
      customer: "Mike Chen",
      product: "AirPods Pro",
      amount: "$249",
      status: "Shipped",
      statusColor: "blue",
    },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard-grid">
      <div className="mb-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Demo Mode:</strong> This dashboard shows sample widgets. 
          Switch to edit mode to create widgets connected to your imported datasets.
        </p>
      </div>
      <div className="grid grid-cols-12 gap-6 h-full">
      {/* KPI Cards Row */}
      <div className="col-span-12 grid grid-cols-4 gap-4 mb-6">
        {sampleMetrics.map((metric, index) => (
          <KPICard key={index} {...metric} />
        ))}
      </div>

      {/* Line Chart Widget */}
      <div className="col-span-8">
        <LineChartWidget
          title="Revenue Trend"
          subtitle="Last 30 days"
        />
      </div>

      {/* Pie Chart Widget */}
      <div className="col-span-4">
        <PieChartWidget
          title="Sales by Category"
          data={[
            { name: "Electronics", value: 42.3, color: "#3b82f6" },
            { name: "Clothing", value: 28.7, color: "#10b981" },
            { name: "Home & Garden", value: 18.9, color: "#8b5cf6" },
            { name: "Other", value: 10.1, color: "#f59e0b" },
          ]}
        />
      </div>

      {/* Data Table Widget */}
      <div className="col-span-7">
        <DataTableWidget
          title="Recent Orders"
          data={sampleOrders}
          columns={[
            { key: "id", label: "Order ID" },
            { key: "customer", label: "Customer" },
            { key: "product", label: "Product" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
          ]}
        />
      </div>

      {/* Bar Chart Widget */}
      <div className="col-span-5">
        <BarChartWidget
          title="Top Products"
          data={[
            { name: "MacBook Pro", value: 2499 },
            { name: "iPhone 15", value: 1899 },
            { name: "AirPods Pro", value: 899 },
            { name: "iPad Air", value: 699 },
            { name: "Apple Watch", value: 399 },
          ]}
          // Example: datasetId="some-dataset-id"
          // xColumn="product_name"
          // yColumn="price"
        />
      </div>
    </div>
    </div>
  );
}
