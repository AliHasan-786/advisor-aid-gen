import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">New York Life</h2>
            <p className="text-sm text-muted-foreground">Advisor Brief Builder</p>
          </div>
        </div>
      </div>
    </header>
  );
};