import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { MessageSquare, Key, Server, Settings } from "lucide-react";

const navigation = [
  { name: "Chat", href: "/", icon: MessageSquare },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "MCP Servers", href: "/mcp-servers", icon: Server },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-[280px] flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">MCP Host</h1>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            )
        })}
      </nav>
      <div className="border-t p-4">
         <div className="text-xs text-muted-foreground">
             Status: Connected
         </div>
      </div>
    </div>
  );
}
