import {
  apiKeys, mcpServers, messages,
  type ApiKey, type InsertApiKey,
  type McpServer, type InsertMcpServer,
  type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // API Keys
  getApiKeys(): Promise<ApiKey[]>;
  createApiKey(key: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<void>;

  // MCP Servers
  getMcpServers(): Promise<McpServer[]>;
  createMcpServer(server: InsertMcpServer): Promise<McpServer>;
  updateMcpServerStatus(id: number, status: string): Promise<McpServer>;
  deleteMcpServer(id: number): Promise<void>;

  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private apiKeys: Map<number, ApiKey>;
  private mcpServers: Map<number, McpServer>;
  private messages: Map<number, Message>;
  private currentId: number;

  constructor() {
    this.apiKeys = new Map();
    this.mcpServers = new Map();
    this.messages = new Map();
    this.currentId = 1;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values());
  }

  async createApiKey(insertKey: InsertApiKey): Promise<ApiKey> {
    const id = this.currentId++;
    const apiKey: ApiKey = { ...insertKey, id, createdAt: new Date(), provider: insertKey.provider || "openrouter" };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async deleteApiKey(id: number): Promise<void> {
    this.apiKeys.delete(id);
  }

  async getMcpServers(): Promise<McpServer[]> {
    return Array.from(this.mcpServers.values());
  }

  async createMcpServer(insertServer: InsertMcpServer): Promise<McpServer> {
    const id = this.currentId++;
    const server: McpServer = { ...insertServer, id, status: "disconnected", createdAt: new Date() };
    this.mcpServers.set(id, server);
    return server;
  }

  async updateMcpServerStatus(id: number, status: string): Promise<McpServer> {
    const server = this.mcpServers.get(id);
    if (!server) throw new Error("Server not found");
    const updatedServer = { ...server, status };
    this.mcpServers.set(id, updatedServer);
    return updatedServer;
  }

  async deleteMcpServer(id: number): Promise<void> {
    this.mcpServers.delete(id);
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => (a.id - b.id));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = {
        ...insertMessage,
        id,
        timestamp: new Date(),
        isAgentic: insertMessage.isAgentic || false,
        agentStep: insertMessage.agentStep || null
    };
    this.messages.set(id, message);
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
  }
}

export const storage = new MemStorage();
