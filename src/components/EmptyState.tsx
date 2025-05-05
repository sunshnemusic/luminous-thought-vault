
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: () => void;
  actionText?: string;
}

export default function EmptyState({
  title = "No notes yet",
  description = "Create your first note to start building your second brain",
  action,
  actionText = "Create Note"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <Button onClick={action} className="bg-gradient hover:bg-brain-700">
          {actionText}
        </Button>
      )}
    </div>
  );
}
