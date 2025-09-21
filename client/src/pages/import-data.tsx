import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ImportModal } from "@/components/modals/import-modal";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ImportDataPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/datasets", formData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Dataset imported successfully",
        description: "Your data is now ready for analysis",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      setShowImportModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (formData: FormData) => {
    uploadMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen lg:h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          title="Import Data" 
          subtitle="Upload CSV, JSON, or TSV files to start analyzing"
        />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Import Options */}
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4" data-testid="text-import-title">Import Your Data</h1>
              <p className="text-muted-foreground text-lg" data-testid="text-import-description">
                Upload your datasets to start creating powerful analytics dashboards
              </p>
            </div>

            {/* Quick Upload */}
            <Card data-testid="card-quick-upload">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Quick Upload
                </CardTitle>
                <CardDescription>
                  Upload files directly with automatic schema detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  onClick={() => setShowImportModal(true)}
                  className="w-full"
                  data-testid="button-open-import-modal"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Files or Drag & Drop
                </Button>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card data-testid="card-csv-format">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>CSV Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comma-separated values with automatic delimiter detection. Perfect for spreadsheet data.
                  </CardDescription>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <strong>Supported:</strong> .csv, .tsv
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-json-format">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>JSON Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Structured JSON data with nested object support. Great for API exports and complex datasets.
                  </CardDescription>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <strong>Supported:</strong> .json
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-security-features">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Privacy Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Optional data anonymization and client-side processing to keep your sensitive data secure.
                  </CardDescription>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <strong>Features:</strong> Anonymization, Encryption
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Best Practices */}
            <Card data-testid="card-best-practices">
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
                <CardDescription>
                  Tips for optimal data import and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">File Preparation</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Use clear, descriptive column headers</li>
                      <li>• Remove empty rows and columns</li>
                      <li>• Ensure consistent data types per column</li>
                      <li>• Keep file sizes under 100MB for best performance</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Privacy & Security</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Enable anonymization for sensitive data</li>
                      <li>• Review data before uploading</li>
                      <li>• Use meaningful dataset names and tags</li>
                      <li>• All data is encrypted at rest</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <ImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onUpload={handleFileUpload}
        isUploading={uploadMutation.isPending}
      />
    </div>
  );
}
