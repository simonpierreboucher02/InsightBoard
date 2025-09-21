import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3 } from "lucide-react";

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDashboard: (data: { name: string; description: string }) => void;
  isCreating: boolean;
}

export function DashboardModal({ open, onOpenChange, onCreateDashboard, isCreating }: DashboardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    
    onCreateDashboard({
      name: name.trim(),
      description: description.trim()
    });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-md" data-testid="modal-create-dashboard">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle data-testid="text-create-dashboard-title">Create Dashboard</DialogTitle>
              <DialogDescription data-testid="text-create-dashboard-description">
                Build a new dashboard to visualize your data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dashboard-name">Dashboard Name</Label>
            <Input
              id="dashboard-name"
              placeholder="Enter dashboard name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              data-testid="input-dashboard-name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-description">Description</Label>
            <Textarea
              id="dashboard-description"
              placeholder="Describe what this dashboard will show (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              data-testid="input-dashboard-description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              data-testid="button-cancel-dashboard"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!name.trim() || isCreating}
              data-testid="button-create-dashboard"
            >
              {isCreating ? "Creating..." : "Create Dashboard"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}