import Papa from 'papaparse';

export interface ParsedCSVData {
  data: any[];
  errors: any[];
  meta: Papa.ParseMeta;
}

export function parseCSV(file: File): Promise<ParsedCSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function parseCSVText(text: string, delimiter = ','): ParsedCSVData {
  const results = Papa.parse(text, {
    header: true,
    delimiter,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return {
    data: results.data,
    errors: results.errors,
    meta: results.meta,
  };
}

export function detectCSVSchema(data: any[]): Record<string, any> {
  if (data.length === 0) return {};

  const schema: Record<string, any> = {};
  const sample = data[0];

  Object.keys(sample).forEach(key => {
    const value = sample[key];
    const type = typeof value;
    
    schema[key] = {
      type: type === 'number' ? 'number' : type === 'boolean' ? 'boolean' : 'string',
      nullable: false,
      example: value,
    };
  });

  return schema;
}

export function cleanCSVData(data: any[]): any[] {
  // Remove duplicates based on JSON string comparison
  const seen = new Set();
  return data.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
