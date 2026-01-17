import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { McpServer, InsertMcpServer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function McpServersPage() {
  const [name, setName] = useState("");
  const [config, setConfig] = useState("");

  const { data: servers } = useQuery<McpServer[]>({
    queryKey: ["/api/mcp-servers"],
  });

  const createMutation = useMutation({
    mutationFn: async (newServer: InsertMcpServer) => {
      await apiRequest("POST", "/api/mcp-servers", newServer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp-servers"] });
      setName("");
      setConfig("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/mcp-servers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcp-servers"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const parsedConfig = JSON.parse(config);
        createMutation.mutate({ name, config: parsedConfig });
    } catch (e) {
        alert("Invalid JSON config");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">MCP Servers</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Server</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Server"
                required
              />
            </div>
            <div className="grid w-full gap-2">
              <label className="text-sm font-medium">Configuration (JSON)</label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                placeholder="{ ... }"
                required
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              Add Server
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {servers?.map((server) => (
          <Card key={server.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold">{server.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${server.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <p className="text-sm text-muted-foreground">{server.status}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(server.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
         {servers?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
                No MCP servers configured.
            </div>
        )}
      </div>
    </div>
  );
}
