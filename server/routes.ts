import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApiKeySchema, insertMcpServerSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import { processAgentMessage } from "./agent";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/agent/chat", async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: "Content required" });
        const response = await processAgentMessage(content);
        res.json({ response });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  });

  // API Keys
  app.get("/api/keys", async (req, res) => {
    const keys = await storage.getApiKeys();
    res.json(keys);
  });

  app.post("/api/keys", async (req, res) => {
    const parsed = insertApiKeySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const key = await storage.createApiKey(parsed.data);
    res.json(key);
  });

  app.delete("/api/keys/:id", async (req, res) => {
    await storage.deleteApiKey(Number(req.params.id));
    res.sendStatus(204);
  });

  // MCP Servers
  app.get("/api/mcp-servers", async (req, res) => {
    const servers = await storage.getMcpServers();
    res.json(servers);
  });

  app.post("/api/mcp-servers", async (req, res) => {
    const parsed = insertMcpServerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const server = await storage.createMcpServer(parsed.data);
    res.json(server);
  });

  app.delete("/api/mcp-servers/:id", async (req, res) => {
    await storage.deleteMcpServer(Number(req.params.id));
    res.sendStatus(204);
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    const parsed = insertMessageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const message = await storage.createMessage(parsed.data);
    res.json(message);
  });

  app.delete("/api/messages", async (req, res) => {
      await storage.clearMessages();
      res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
