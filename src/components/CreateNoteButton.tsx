
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateNoteButtonProps {
  onClick: () => void;
}

export default function CreateNoteButton({ onClick }: CreateNoteButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 bg-gradient hover:bg-brain-700 shadow-lg md:hidden"
      aria-label="Create new note"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
