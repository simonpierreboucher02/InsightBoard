import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Dataset } from "@shared/schema";
import { Database, Upload, FileText, Calendar } from "lucide-react";

export default function DatasetsPage() {
  const { data: datasets = [], isLoading: datasetsLoading } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  return (
    <div className="flex min-h-screen lg:h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Datasets" />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-datasets-title">Datasets</h1>
                <p className="text-muted-foreground" data-testid="text-datasets-description">
                  Manage and explore your imported datasets
                </p>
              </div>
              <Link href="/import">
                <Button data-testid="button-import-dataset">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Dataset
                </Button>
              </Link>
            </div>

            {/* Datasets Grid */}
            {datasetsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse" data-testid={`skeleton-dataset-${i}`}>
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : datasets.length === 0 ? (
              <Card data-testid="card-no-datasets">
                <CardContent className="p-12 text-center">
                  <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2" data-testid="text-no-datasets-title">
                    No datasets found
                  </h3>
                  <p className="text-muted-foreground mb-6" data-testid="text-no-datasets-description">
                    Import your first dataset to start building dashboards and analyzing your data
                  </p>
                  <Link href="/import">
                    <Button size="lg" data-testid="button-import-first-dataset">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Your First Dataset
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" data-testid="grid-datasets">
                {datasets.map((dataset) => (
                  <Card 
                    key={dataset.id} 
                    className="cursor-pointer hover:bg-accent transition-colors group" 
                    data-testid={`card-dataset-${dataset.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="group-hover:text-primary transition-colors" data-testid={`text-dataset-name-${dataset.id}`}>
                          {dataset.name}
                        </span>
                        <div className="text-xs bg-muted px-2 py-1 rounded font-normal" data-testid={`badge-dataset-type-${dataset.id}`}>
                          {dataset.fileType.toUpperCase()}
                        </div>
                      </CardTitle>
                      <CardDescription data-testid={`text-dataset-filename-${dataset.id}`}>
                        <FileText className="w-3 h-3 inline mr-1" />
                        {dataset.filename}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground" data-testid={`text-dataset-rows-${dataset.id}`}>
                        <Database className="w-3 h-3 mr-1" />
                        {Array.isArray(dataset.data) ? dataset.data.length : 0} rows
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground" data-testid={`text-dataset-created-${dataset.id}`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(dataset.createdAt!).toLocaleDateString()}
                      </div>
                      {dataset.tags && Array.isArray(dataset.tags) && dataset.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-2" data-testid={`tags-dataset-${dataset.id}`}>
                          {dataset.tags.map((tag: string, index: number) => (
                            <span 
                              key={index} 
                              className="text-xs bg-secondary px-2 py-1 rounded-full" 
                              data-testid={`tag-${tag}-${dataset.id}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Dataset Stats */}
            {datasets.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="stats-datasets">
                <Card data-testid="stat-total-datasets">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{datasets.length}</div>
                    <div className="text-sm text-muted-foreground">Total Datasets</div>
                  </CardContent>
                </Card>
                <Card data-testid="stat-total-rows">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {datasets.reduce((sum, dataset) => sum + (Array.isArray(dataset.data) ? dataset.data.length : 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </CardContent>
                </Card>
                <Card data-testid="stat-file-types">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {new Set(datasets.map(d => d.fileType)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">File Types</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}