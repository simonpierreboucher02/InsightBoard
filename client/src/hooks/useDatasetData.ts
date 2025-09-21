import { useQuery } from "@tanstack/react-query";
import type { Dataset } from "@shared/schema";

export function useDatasetData(datasetId: string | null) {
  return useQuery<Dataset | null>({
    queryKey: ["/api/datasets", datasetId],
    queryFn: async () => {
      if (!datasetId) return null;
      const response = await fetch(`/api/datasets/${datasetId}`);
      if (!response.ok) throw new Error('Failed to fetch dataset');
      return response.json();
    },
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Utility function to process dataset data for charts
export function processDataForChart(
  dataset: Dataset | null,
  xColumn: string,
  yColumn: string
): Array<{ name: string; value: number }> {
  if (!dataset?.data || !Array.isArray(dataset.data)) {
    return [];
  }

  return dataset.data.map((row: any) => ({
    name: String(row[xColumn] || 'Unknown'),
    value: Number(row[yColumn]) || 0,
  }));
}

// Utility function to calculate KPI from dataset
export function calculateKPI(
  dataset: Dataset | null,
  column: string,
  operation: 'sum' | 'count' | 'avg' | 'max' | 'min' = 'sum'
): number {
  if (!dataset?.data || !Array.isArray(dataset.data)) {
    return 0;
  }

  const values = dataset.data
    .map((row: any) => Number(row[column]))
    .filter((val: number) => !isNaN(val));

  switch (operation) {
    case 'sum':
      return values.reduce((acc, val) => acc + val, 0);
    case 'count':
      return dataset.data.length;
    case 'avg':
      return values.length > 0 ? values.reduce((acc, val) => acc + val, 0) / values.length : 0;
    case 'max':
      return values.length > 0 ? Math.max(...values) : 0;
    case 'min':
      return values.length > 0 ? Math.min(...values) : 0;
    default:
      return 0;
  }
}