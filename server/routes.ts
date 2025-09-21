import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertDatasetSchema, insertDashboardSchema } from "@shared/schema";
import multer from "multer";
import Papa from "papaparse";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Dataset routes
  app.get("/api/datasets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const datasets = await storage.getUserDatasets(req.user!.id);
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch datasets" });
    }
  });

  app.post("/api/datasets", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { name, tags, anonymize, autoDetectSchema } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }

      let data: any[] = [];
      let schema: any = {};
      const fileType = file.originalname.split('.').pop()?.toLowerCase();

      // Parse file based on type
      if (fileType === 'csv' || fileType === 'tsv') {
        const delimiter = fileType === 'tsv' ? '\t' : ',';
        const parsed = Papa.parse(file.buffer.toString(), {
          header: true,
          delimiter,
          skipEmptyLines: true,
          dynamicTyping: autoDetectSchema === 'true'
        });
        data = parsed.data;
        
        if (autoDetectSchema === 'true' && data.length > 0) {
          schema = Object.keys(data[0]).reduce((acc, key) => {
            const sample = data[0][key];
            acc[key] = {
              type: typeof sample === 'number' ? 'number' : 
                   typeof sample === 'boolean' ? 'boolean' : 'string',
              nullable: false
            };
            return acc;
          }, {} as any);
        }
      } else if (fileType === 'json') {
        data = JSON.parse(file.buffer.toString());
        if (!Array.isArray(data)) {
          return res.status(400).json({ message: "JSON must be an array of objects" });
        }
        
        if (autoDetectSchema === 'true' && data.length > 0) {
          schema = Object.keys(data[0]).reduce((acc, key) => {
            const sample = data[0][key];
            acc[key] = {
              type: typeof sample === 'number' ? 'number' : 
                   typeof sample === 'boolean' ? 'boolean' : 'string',
              nullable: false
            };
            return acc;
          }, {} as any);
        }
      } else {
        return res.status(400).json({ message: "Unsupported file type" });
      }

      // Anonymize sensitive data if requested
      if (anonymize === 'true') {
        // Simple anonymization - hash values that look like emails, phones, etc.
        data = data.map(row => {
          const newRow = { ...row };
          Object.keys(newRow).forEach(key => {
            const value = newRow[key];
            if (typeof value === 'string') {
              // Anonymize email-like patterns
              if (value.includes('@')) {
                newRow[key] = `user${Math.random().toString(36).substr(2, 9)}@example.com`;
              }
              // Anonymize phone-like patterns
              else if (/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
                newRow[key] = `+1-555-${Math.random().toString().substr(2, 7)}`;
              }
            }
          });
          return newRow;
        });
      }

      const dataset = await storage.createDataset({
        userId: req.user!.id,
        name: name || file.originalname,
        filename: file.originalname,
        fileType: fileType!,
        data,
        schema,
        tags: tags ? JSON.parse(tags) : []
      });

      res.status(201).json(dataset);
    } catch (error) {
      console.error('Dataset creation error:', error);
      res.status(500).json({ message: "Failed to create dataset" });
    }
  });

  app.get("/api/datasets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset || dataset.userId !== req.user!.id) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      res.json(dataset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dataset" });
    }
  });

  app.delete("/api/datasets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset || dataset.userId !== req.user!.id) {
        return res.status(404).json({ message: "Dataset not found" });
      }
      
      await storage.deleteDataset(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dataset" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dashboards = await storage.getUserDashboards(req.user!.id);
      res.json(dashboards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboards" });
    }
  });

  app.post("/api/dashboards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const result = insertDashboardSchema.safeParse({
        ...req.body,
        userId: req.user!.id
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid dashboard data" });
      }

      const dashboard = await storage.createDashboard(result.data);
      res.status(201).json(dashboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to create dashboard" });
    }
  });

  app.get("/api/dashboards/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dashboard = await storage.getDashboard(req.params.id);
      if (!dashboard || dashboard.userId !== req.user!.id) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  app.put("/api/dashboards/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dashboard = await storage.getDashboard(req.params.id);
      if (!dashboard || dashboard.userId !== req.user!.id) {
        return res.status(404).json({ message: "Dashboard not found" });
      }

      const updated = await storage.updateDashboard(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dashboard" });
    }
  });

  app.delete("/api/dashboards/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const dashboard = await storage.getDashboard(req.params.id);
      if (!dashboard || dashboard.userId !== req.user!.id) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      await storage.deleteDashboard(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dashboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
