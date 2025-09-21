import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Dataset } from "@shared/schema";

interface WidgetConfig {
  title: string;
  datasetId: string;
  xColumn: string;
  yColumn: string;
}

interface WidgetConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: WidgetConfig) => void;
  widgetType: 'bar' | 'line' | 'pie' | 'table';
  initialConfig?: Partial<WidgetConfig>;
}

export function WidgetConfigModal({
  open,
  onOpenChange,
  onSave,
  widgetType,
  initialConfig
}: WidgetConfigModalProps) {
  const [config, setConfig] = useState<WidgetConfig>({
    title: initialConfig?.title || `${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)} Chart`,
    datasetId: initialConfig?.datasetId || "",
    xColumn: initialConfig?.xColumn || "",
    yColumn: initialConfig?.yColumn || "",
  });

  // Fetch available datasets
  const { data: datasets = [] } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  // Get selected dataset for column options
  const selectedDataset = datasets.find(d => d.id === config.datasetId);
  const availableColumns = selectedDataset?.schema ? Object.keys(selectedDataset.schema) : [];

  const handleSave = () => {
    if (!config.datasetId || !config.xColumn || !config.yColumn) {
      return; // Don't save if required fields are missing
    }
    onSave(config);
    onOpenChange(false);
  };

  const isValid = config.title && config.datasetId && config.xColumn && config.yColumn;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-widget-config">
        <DialogHeader>
          <DialogTitle>Configure {widgetType.charAt(0).toUpperCase() + widgetType.slice(1)} Widget</DialogTitle>
          <DialogDescription>
            Connect your widget to imported data and configure display options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Widget Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Enter widget title"
              data-testid="input-widget-title"
            />
          </div>

          <div>
            <Label htmlFor="dataset">Dataset</Label>
            <Select
              value={config.datasetId}
              onValueChange={(value) => setConfig({ ...config, datasetId: value, xColumn: "", yColumn: "" })}
            >
              <SelectTrigger data-testid="select-dataset">
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id} data-testid={`option-dataset-${dataset.id}`}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.datasetId && (
            <>
              <div>
                <Label htmlFor="xColumn">
                  {widgetType === 'table' ? 'Primary Column' : 'X-Axis Column (Categories)'}
                </Label>
                <Select
                  value={config.xColumn}
                  onValueChange={(value) => setConfig({ ...config, xColumn: value })}
                >
                  <SelectTrigger data-testid="select-x-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((column) => (
                      <SelectItem key={column} value={column} data-testid={`option-x-column-${column}`}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yColumn">
                  {widgetType === 'table' ? 'Secondary Column' : 'Y-Axis Column (Values)'}
                </Label>
                <Select
                  value={config.yColumn}
                  onValueChange={(value) => setConfig({ ...config, yColumn: value })}
                >
                  <SelectTrigger data-testid="select-y-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((column) => (
                      <SelectItem key={column} value={column} data-testid={`option-y-column-${column}`}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid} data-testid="button-save-widget">
            Save Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}