import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import ChatPage from "@/pages/chat";
import ApiKeysPage from "@/pages/api-keys";
import McpServersPage from "@/pages/mcp-servers";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ChatPage} />
      <Route path="/api-keys" component={ApiKeysPage} />
      <Route path="/mcp-servers" component={McpServersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
