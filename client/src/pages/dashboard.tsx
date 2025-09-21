import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Save, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { DashboardGrid } from "@/components/dashboard-grid";
import { WidgetConfigModal } from "@/components/modals/widget-config-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dashboard } from "@shared/schema";

interface WidgetConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'table';
  title: string;
  datasetId?: string;
  xColumn?: string;
  yColumn?: string;
  position: { x: number; y: number; w: number; h: number };
}

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  
  const { data: dashboard, isLoading } = useQuery<Dashboard>({
    queryKey: ["/api/dashboards", id],
    enabled: !!id,
  });

  // Hydrate widgets from dashboard layout when dashboard loads
  useEffect(() => {
    if (dashboard?.layout) {
      const layoutWidgets = (dashboard.layout as any)?.widgets || [];
      if (Array.isArray(layoutWidgets)) {
        setWidgets(layoutWidgets);
      }
    }
  }, [dashboard]);

  // Mutation to save dashboard changes
  const saveDashboardMutation = useMutation({
    mutationFn: async (updatedLayout: any) => {
      const res = await apiRequest("PUT", `/api/dashboards/${id}`, {
        layout: updatedLayout
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Dashboard saved",
        description: "Your changes have been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards", id] });
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveWidget = (config: any) => {
    if (editingWidget) {
      // Update existing widget
      setWidgets(prev => prev.map(widget => 
        widget.id === editingWidget 
          ? { ...widget, title: config.title, datasetId: config.datasetId, xColumn: config.xColumn, yColumn: config.yColumn }
          : widget
      ));
      setEditingWidget(null);
    } else {
      // Add new widget to the dashboard layout
      const newWidget: WidgetConfig = {
        id: Date.now().toString(), // Simple ID for now
        type: config.widgetType || 'bar',
        title: config.title,
        datasetId: config.datasetId,
        xColumn: config.xColumn,
        yColumn: config.yColumn,
        position: { x: 0, y: 0, w: 6, h: 4 }, // Default position
      };
      setWidgets(prev => [...prev, newWidget]);
    }
    
    setShowWidgetConfig(false);
  };

  const handleSaveDashboard = () => {
    const currentLayout = dashboard?.layout || { widgets: [] };
    const updatedLayout = {
      ...currentLayout,
      widgets: widgets,
      lastUpdated: new Date().toISOString()
    };
    saveDashboardMutation.mutate(updatedLayout);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Loading..." />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                <div className="lg:col-span-4 h-48 bg-muted rounded-lg"></div>
                <div className="lg:col-span-8 h-48 bg-muted rounded-lg"></div>
                <div className="lg:col-span-6 h-64 bg-muted rounded-lg"></div>
                <div className="lg:col-span-6 h-64 bg-muted rounded-lg"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-screen lg:h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Dashboard Not Found" />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-muted-foreground">Dashboard not found</h2>
              <p className="text-muted-foreground mt-2">The requested dashboard could not be loaded.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen lg:h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          title={dashboard.name} 
          subtitle={`Last updated: ${new Date(dashboard.updatedAt!).toLocaleString()}`}
          actions={
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowWidgetConfig(true)}
                    data-testid="button-add-widget"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleSaveDashboard}
                    disabled={saveDashboardMutation.isPending}
                    data-testid="button-save-dashboard"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveDashboardMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditMode(false)}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditMode(true)}
                  data-testid="button-edit-dashboard"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Dashboard
                </Button>
              )}
            </div>
          }
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {editMode ? (
            <div className="space-y-4">
              <div className="bg-muted/30 border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">Dashboard Edit Mode</p>
                <p className="text-sm text-muted-foreground">
                  Add widgets and connect them to your imported datasets to create powerful visualizations.
                </p>
                {widgets.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Configured Widgets:</h3>
                    <div className="grid gap-2">
                      {widgets.map((widget) => (
                        <div 
                          key={widget.id} 
                          className="flex items-center justify-between p-3 bg-background rounded border"
                          data-testid={`widget-config-${widget.id}`}
                        >
                          <div>
                            <span className="font-medium">{widget.title}</span>
                            {widget.datasetId && (
                              <span className="text-sm text-muted-foreground ml-2">
                                • Connected to dataset
                              </span>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingWidget(widget.id);
                              setShowWidgetConfig(true);
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <DashboardGrid layout={dashboard.layout as any || { widgets: [] }} />
          )}
        </main>
      </div>

      <WidgetConfigModal
        open={showWidgetConfig}
        onOpenChange={setShowWidgetConfig}
        onSave={handleSaveWidget}
        widgetType="bar" // Default type, could be made dynamic
        initialConfig={editingWidget ? widgets.find(w => w.id === editingWidget) : undefined}
      />
    </div>
  );
}
