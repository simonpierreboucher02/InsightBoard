import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Upload, BarChart3, Database } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { DashboardModal } from "@/components/modals/dashboard-modal";
import { Dataset, Dashboard } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  
  const { data: datasets = [], isLoading: datasetsLoading } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  const { data: dashboards = [], isLoading: dashboardsLoading } = useQuery<Dashboard[]>({
    queryKey: ["/api/dashboards"],
  });

  const createDashboardMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      // Create dashboard with default empty layout
      const dashboardData = {
        name: data.name,
        layout: {
          widgets: [],
          grid: { cols: 12, rows: 12 },
          description: data.description
        },
        isTemplate: false
      };
      const res = await apiRequest("POST", "/api/dashboards", dashboardData);
      return await res.json();
    },
    onSuccess: (dashboard) => {
      toast({
        title: "Dashboard created successfully",
        description: "Your new dashboard is ready for customization",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      setShowDashboardModal(false);
      // Navigate to the new dashboard
      setLocation(`/dashboard/${dashboard.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateDashboard = (data: { name: string; description: string }) => {
    createDashboardMutation.mutate(data);
  };

  if (datasetsLoading || dashboardsLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Dashboard" />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg"></div>
                ))}
              </div>
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
        <Header title="InsightBoard" subtitle="Privacy-first analytics platform" />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" data-testid="text-quick-actions">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/import">
                <Card className="cursor-pointer hover:bg-accent transition-colors" data-testid="card-import-data">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Import Data</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Upload CSV, JSON, or TSV files to start creating insights
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Card className="cursor-pointer hover:bg-accent transition-colors" data-testid="card-create-dashboard" onClick={() => setShowDashboardModal(true)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Create Dashboard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Build interactive dashboards with drag-and-drop widgets
                  </CardDescription>
                </CardContent>
              </Card>

              <Link href="/datasets">
                <Card className="cursor-pointer hover:bg-accent transition-colors" data-testid="card-explore-data">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Explore Data</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Browse and analyze your imported datasets
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent Dashboards */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" data-testid="text-recent-dashboards">Recent Dashboards</h2>
              <Button size="sm" data-testid="button-new-dashboard" onClick={() => setShowDashboardModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Dashboard
              </Button>
            </div>
            
            {dashboards.length === 0 ? (
              <Card data-testid="card-no-dashboards">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No dashboards yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first dashboard to start visualizing your data
                  </p>
                  <Button data-testid="button-create-first-dashboard" onClick={() => setShowDashboardModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {dashboards.slice(0, 6).map((dashboard) => (
                  <Link key={dashboard.id} href={`/dashboard/${dashboard.id}`}>
                    <Card className="cursor-pointer hover:bg-accent transition-colors" data-testid={`card-dashboard-${dashboard.id}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span data-testid={`text-dashboard-name-${dashboard.id}`}>{dashboard.name}</span>
                          <BarChart3 className="w-5 h-5 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription data-testid={`text-dashboard-date-${dashboard.id}`}>
                          Created {new Date(dashboard.createdAt!).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Datasets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" data-testid="text-recent-datasets">Recent Datasets</h2>
              <Link href="/import">
                <Button size="sm" data-testid="button-import-data">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </Link>
            </div>
            
            {datasets.length === 0 ? (
              <Card data-testid="card-no-datasets">
                <CardContent className="p-8 text-center">
                  <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No datasets imported</h3>
                  <p className="text-muted-foreground mb-4">
                    Import your first dataset to start building dashboards
                  </p>
                  <Link href="/import">
                    <Button data-testid="button-import-first-dataset">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Dataset
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {datasets.slice(0, 6).map((dataset) => (
                  <Card key={dataset.id} className="cursor-pointer hover:bg-accent transition-colors" data-testid={`card-dataset-${dataset.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span data-testid={`text-dataset-name-${dataset.id}`}>{dataset.name}</span>
                        <div className="text-xs bg-muted px-2 py-1 rounded" data-testid={`text-dataset-type-${dataset.id}`}>
                          {dataset.fileType.toUpperCase()}
                        </div>
                      </CardTitle>
                      <CardDescription data-testid={`text-dataset-info-${dataset.id}`}>
                        {Array.isArray(dataset.data) ? dataset.data.length : 0} rows • 
                        {dataset.filename} • 
                        {new Date(dataset.createdAt!).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dashboard Creation Modal */}
      <DashboardModal
        open={showDashboardModal}
        onOpenChange={setShowDashboardModal}
        onCreateDashboard={handleCreateDashboard}
        isCreating={createDashboardMutation.isPending}
      />
    </div>
  );
}
