
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import ModelSelector from "./ModelSelector";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppHeaderProps {
  toggleSidebar: () => void;
}

export default function AppHeader({ toggleSidebar }: AppHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold text-gradient">ThoughtVault</h1>
      </div>
      
      <div className="flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your second brain..."
            className="pl-8 w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden md:block">
          <ModelSelector />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
