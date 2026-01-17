import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  provider: text("provider").notNull().default("openrouter"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mcpServers = pgTable("mcp_servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  config: jsonb("config").notNull(),
  status: text("status").notNull().default("disconnected"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isAgentic: boolean("is_agentic").default(false),
  agentStep: text("agent_step"),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  name: true,
  key: true,
  provider: true,
});

export const insertMcpServerSchema = createInsertSchema(mcpServers).pick({
  name: true,
  config: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  role: true,
  content: true,
  isAgentic: true,
  agentStep: true,
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type McpServer = typeof mcpServers.$inferSelect;
export type InsertMcpServer = z.infer<typeof insertMcpServerSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
