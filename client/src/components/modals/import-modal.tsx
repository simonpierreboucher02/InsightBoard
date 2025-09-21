import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudUpload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (formData: FormData) => void;
  isUploading: boolean;
}

export function ImportModal({ open, onOpenChange, onUpload, isUploading }: ImportModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [datasetName, setDatasetName] = useState("");
  const [autoDetectSchema, setAutoDetectSchema] = useState(true);
  const [anonymizeData, setAnonymizeData] = useState(false);
  const [tags, setTags] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/json': ['.json'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) return;

    // For now, upload the first file only
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', datasetName || file.name);
    formData.append('autoDetectSchema', autoDetectSchema.toString());
    formData.append('anonymize', anonymizeData.toString());
    formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim()).filter(Boolean)));

    onUpload(formData);
  };

  const resetForm = () => {
    setFiles([]);
    setDatasetName("");
    setAutoDetectSchema(true);
    setAnonymizeData(false);
    setTags("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl" data-testid="modal-import-data">
        <DialogHeader>
          <DialogTitle data-testid="text-import-modal-title">Import Dataset</DialogTitle>
          <DialogDescription data-testid="text-import-modal-description">
            Upload CSV, TSV, or JSON files to create a new dataset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
            data-testid="dropzone-upload"
          >
            <input {...getInputProps()} />
            <CloudUpload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isDragActive ? "Drop files here" : "Drop your files here"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Supports CSV, TSV, and JSON files up to 100MB
            </p>
            <Button type="button" variant="outline" data-testid="button-choose-files">
              Choose Files
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2" data-testid="file-list">
              <Label>Selected Files</Label>
              <div className="border rounded-lg p-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded" data-testid={`file-item-${index}`}>
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dataset Options */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="dataset-name">Dataset Name</Label>
              <Input
                id="dataset-name"
                placeholder="e.g., Sales Data Q4 2024"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                data-testid="input-dataset-name"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., sales, quarterly, revenue"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                data-testid="input-dataset-tags"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-detect"
                  checked={autoDetectSchema}
                  onCheckedChange={(checked) => setAutoDetectSchema(checked as boolean)}
                  data-testid="checkbox-auto-detect-schema"
                />
                <Label htmlFor="auto-detect" className="text-sm">
                  Auto-detect schema
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymize"
                  checked={anonymizeData}
                  onCheckedChange={(checked) => setAnonymizeData(checked as boolean)}
                  data-testid="checkbox-anonymize-data"
                />
                <Label htmlFor="anonymize" className="text-sm">
                  Anonymize sensitive data
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              data-testid="button-import-dataset"
            >
              {isUploading ? "Importing..." : "Import Dataset"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
