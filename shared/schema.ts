import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  recoveryKey: text("recovery_key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(), // 'csv', 'json', 'tsv'
  data: json("data").notNull(), // parsed data
  schema: json("schema").notNull(), // column definitions
  tags: json("tags").default([]), // array of tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  layout: json("layout").notNull(), // grid layout and widgets
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasets.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
