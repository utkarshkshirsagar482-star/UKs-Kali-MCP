import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PentestClient {
    private client: Client | null = null;
    private transport: StdioClientTransport | null = null;

    async connect() {
        if (this.client) return;

        const pythonScript = path.resolve(__dirname, "../pentest_mcp.py");

        this.transport = new StdioClientTransport({
            command: "python3",
            args: [pythonScript],
        });

        this.client = new Client(
            {
                name: "mcp-host-client",
                version: "1.0.0",
            },
            {
                capabilities: {},
            }
        );

        await this.client.connect(this.transport);
        console.log("Connected to Pentest MCP Server");
    }

    async listTools() {
        if (!this.client) await this.connect();
        const result = await this.client?.listTools();
        return result?.tools || [];
    }

    async callTool(name: string, args: any) {
        if (!this.client) await this.connect();
        const result = await this.client?.callTool({
            name,
            arguments: args,
        });

        // Extract text content from result
        // @ts-ignore
        const textContent = result?.content.filter(c => c.type === 'text').map(c => c.text).join("\n");
        return textContent || "No text output";
    }

    async close() {
        await this.transport?.close();
    }
}

export const pentestClient = new PentestClient();
