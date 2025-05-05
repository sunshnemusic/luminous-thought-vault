
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/AppHeader";
import NoteCard from "@/components/NoteCard";
import EmptyState from "@/components/EmptyState";
import CreateNoteButton from "@/components/CreateNoteButton";
import CreateNoteForm from "@/components/CreateNoteForm";
import { sampleNotes, Note } from "@/data/sample-notes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleCreateNote = () => {
    setIsCreateNoteOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, "id" | "date">) => {
    const newNote: Note = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...noteData
    };
    
    setNotes([newNote, ...notes]);
  };

  const handleNoteClick = (note: Note) => {
    toast({
      title: `Selected: ${note.title}`,
      description: "Note viewing/editing will be available in the next version.",
    });
  };

  const hasNotes = notes.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main 
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6",
            isMobile && sidebarOpen && "opacity-50"
          )}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">All Notes</h2>
              
              <div className="hidden md:flex">
                <Button className="bg-gradient hover:bg-brain-700" onClick={handleCreateNote}>
                  <Plus className="h-4 w-4 mr-2" /> New Note
                </Button>
              </div>
            </div>
            
            {hasNotes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    title={note.title}
                    content={note.content}
                    date={note.date}
                    tags={note.tags}
                    type={note.type}
                    onClick={() => handleNoteClick(note)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState action={handleCreateNote} />
            )}
          </div>
        </main>
      </div>
      
      {isMobile && <CreateNoteButton onClick={handleCreateNote} />}
      
      <CreateNoteForm
        isOpen={isCreateNoteOpen}
        onOpenChange={setIsCreateNoteOpen}
        onSave={handleSaveNote}
      />
    </div>
  );
};

export default Index;
