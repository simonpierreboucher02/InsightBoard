import { type User, type InsertUser, type Dataset, type InsertDataset, type Dashboard, type InsertDashboard } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { recoveryKey: string }): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<void>;
  
  getUserDatasets(userId: string): Promise<Dataset[]>;
  getDataset(id: string): Promise<Dataset | undefined>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDataset(id: string, updates: Partial<InsertDataset>): Promise<Dataset | undefined>;
  deleteDataset(id: string): Promise<boolean>;
  
  getUserDashboards(userId: string): Promise<Dashboard[]>;
  getDashboard(id: string): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: string, updates: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: string): Promise<boolean>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private datasets: Map<string, Dataset>;
  private dashboards: Map<string, Dashboard>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.datasets = new Map();
    this.dashboards = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser & { recoveryKey: string }): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, password });
    }
  }

  async getUserDatasets(userId: string): Promise<Dataset[]> {
    return Array.from(this.datasets.values()).filter(
      (dataset) => dataset.userId === userId
    );
  }

  async getDataset(id: string): Promise<Dataset | undefined> {
    return this.datasets.get(id);
  }

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const id = randomUUID();
    const dataset: Dataset = {
      ...insertDataset,
      id,
      tags: insertDataset.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.datasets.set(id, dataset);
    return dataset;
  }

  async updateDataset(id: string, updates: Partial<InsertDataset>): Promise<Dataset | undefined> {
    const dataset = this.datasets.get(id);
    if (dataset) {
      const updated = { ...dataset, ...updates, updatedAt: new Date() };
      this.datasets.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteDataset(id: string): Promise<boolean> {
    return this.datasets.delete(id);
  }

  async getUserDashboards(userId: string): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(
      (dashboard) => dashboard.userId === userId
    );
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const id = randomUUID();
    const dashboard: Dashboard = {
      ...insertDashboard,
      id,
      isTemplate: insertDashboard.isTemplate || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dashboards.set(id, dashboard);
    return dashboard;
  }

  async updateDashboard(id: string, updates: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (dashboard) {
      const updated = { ...dashboard, ...updates, updatedAt: new Date() };
      this.dashboards.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    return this.dashboards.delete(id);
  }
}

export const storage = new MemStorage();
