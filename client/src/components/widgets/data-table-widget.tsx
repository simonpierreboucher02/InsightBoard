import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Search } from "lucide-react";

interface Column {
  key: string;
  label: string;
}

interface DataTableWidgetProps {
  title: string;
  data: any[];
  columns: Column[];
}

export function DataTableWidget({ title, data, columns }: DataTableWidgetProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card data-testid="widget-data-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-data-table-title">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search orders..."
                className="pl-9 w-48"
                data-testid="input-data-table-search"
              />
            </div>
            <Button variant="ghost" size="sm" data-testid="button-data-table-filter">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} data-testid={`header-${column.key}`}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50" data-testid={`row-${index}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key} data-testid={`cell-${index}-${column.key}`}>
                      {column.key === 'status' ? (
                        <Badge variant={getStatusBadgeVariant(row[column.key])}>
                          {row[column.key]}
                        </Badge>
                      ) : (
                        row[column.key]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
