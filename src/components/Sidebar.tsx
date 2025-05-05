
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brain, Book, Tag, Folder, Settings, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ icon: Icon, label, isActive, onClick }: SidebarLinkProps) => (
  <Button
    variant={isActive ? "secondary" : "ghost"}
    className={cn(
      "w-full justify-start gap-2 rounded-lg px-3",
      isActive && "bg-accent text-accent-foreground"
    )}
    onClick={onClick}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </Button>
);

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("All Notes");
  const isMobile = useIsMobile();
  
  const handleItemClick = (item: string) => {
    setActiveItem(item);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out",
        isMobile && !isOpen && "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gradient">ThoughtVault</h2>
        </div>

        <Button className="bg-gradient hover:bg-brain-700 mb-6 flex gap-2">
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </Button>

        <div className="space-y-1">
          <SidebarLink
            icon={Brain}
            label="All Notes"
            isActive={activeItem === "All Notes"}
            onClick={() => handleItemClick("All Notes")}
          />
          <SidebarLink
            icon={Book}
            label="Recent"
            isActive={activeItem === "Recent"}
            onClick={() => handleItemClick("Recent")}
          />
          <SidebarLink
            icon={Tag}
            label="Tags"
            isActive={activeItem === "Tags"}
            onClick={() => handleItemClick("Tags")}
          />
          <SidebarLink
            icon={Folder}
            label="Folders"
            isActive={activeItem === "Folders"}
            onClick={() => handleItemClick("Folders")}
          />
        </div>

        <div className="mt-auto">
          <SidebarLink
            icon={Settings}
            label="Settings"
            isActive={activeItem === "Settings"}
            onClick={() => handleItemClick("Settings")}
          />
        </div>
      </div>
    </aside>
  );
}
