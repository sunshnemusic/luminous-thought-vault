
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import ModelSelector from "./ModelSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearch } from "@/hooks/useSearch";
import { useState, useEffect } from "react";

interface AppHeaderProps {
  toggleSidebar: () => void;
  onSearchResults?: (hasResults: boolean) => void;
}

export default function AppHeader({ toggleSidebar, onSearchResults }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const { searchQuery, handleSearch, isSearching, searchResults } = useSearch();
  const [inputValue, setInputValue] = useState("");
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue) {
        handleSearch(inputValue);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [inputValue]);
  
  // Notify parent component about search results
  useEffect(() => {
    if (onSearchResults) {
      onSearchResults(searchResults.length > 0);
    }
  }, [searchResults, onSearchResults]);

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
          <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${isSearching ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
          <Input
            type="search"
            placeholder="Search your second brain..."
            className="pl-8 w-full"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
