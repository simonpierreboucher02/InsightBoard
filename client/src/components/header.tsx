import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { MobileMenuButton } from "./sidebar";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 lg:px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-foreground" data-testid="text-header-title">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground" data-testid="text-header-subtitle">{subtitle}</p>
            )}
          </div>
        </div>
        {actions || (
          <div className="flex items-center gap-2 lg:gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex" data-testid="button-export-pdf">
              <Download className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Export PDF</span>
            </Button>
            <Button size="sm" data-testid="button-add-widget">
              <Plus className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Add Widget</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
