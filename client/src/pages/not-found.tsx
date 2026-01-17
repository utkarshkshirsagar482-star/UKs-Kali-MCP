import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <Link href="/">
          <a className="text-primary hover:underline">Return Home</a>
        </Link>
      </div>
    </div>
  );
}
