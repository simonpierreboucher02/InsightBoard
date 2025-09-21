export interface ParsedJSONData {
  data: any[];
  errors: string[];
}

export function parseJSON(file: File): Promise<ParsedJSONData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!Array.isArray(parsed)) {
          resolve({
            data: [],
            errors: ['JSON must be an array of objects'],
          });
          return;
        }
        
        resolve({
          data: parsed,
          errors: [],
        });
      } catch (error) {
        resolve({
          data: [],
          errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
        });
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

export function parseJSONText(text: string): ParsedJSONData {
  try {
    const parsed = JSON.parse(text);
    
    if (!Array.isArray(parsed)) {
      return {
        data: [],
        errors: ['JSON must be an array of objects'],
      };
    }
    
    return {
      data: parsed,
      errors: [],
    };
  } catch (error) {
    return {
      data: [],
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

export function detectJSONSchema(data: any[]): Record<string, any> {
  if (data.length === 0) return {};

  const schema: Record<string, any> = {};
  const sample = data[0];

  function inferType(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  function processObject(obj: any, prefix = ''): void {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      const type = inferType(value);
      
      schema[fullKey] = {
        type,
        nullable: value === null || value === undefined,
        example: value,
      };
      
      // Recursively process nested objects
      if (type === 'object' && value !== null) {
        processObject(value, fullKey);
      }
    });
  }

  processObject(sample);
  return schema;
}

export function flattenJSONData(data: any[]): any[] {
  return data.map(item => {
    const flattened: any = {};
    
    function flatten(obj: any, prefix = ''): void {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else {
          flattened[fullKey] = value;
        }
      });
    }
    
    flatten(item);
    return flattened;
  });
}
