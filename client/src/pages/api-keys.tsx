import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ApiKey, InsertApiKey } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function ApiKeysPage() {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");

  const { data: keys } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });

  const createMutation = useMutation({
    mutationFn: async (newKey: InsertApiKey) => {
      await apiRequest("POST", "/api/keys", newKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setName("");
      setKey("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, key, provider: "openrouter" });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Keys</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Key</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="grid w-full gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My OpenRouter Key"
                required
              />
            </div>
            <div className="grid w-full gap-2">
              <label className="text-sm font-medium">Key</label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-or-..."
                type="password"
                required
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              Add Key
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {keys?.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold">{apiKey.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {apiKey.key.substring(0, 8)}...
                </p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteMutation.mutate(apiKey.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {keys?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
                No API keys added yet.
            </div>
        )}
      </div>
    </div>
  );
}
