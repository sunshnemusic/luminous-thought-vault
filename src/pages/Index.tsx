
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AppHeader from "@/components/AppHeader";
import NoteCard from "@/components/NoteCard";
import EmptyState from "@/components/EmptyState";
import CreateNoteButton from "@/components/CreateNoteButton";
import CreateNoteForm from "@/components/CreateNoteForm";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useNotes } from "@/hooks/useNotes";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Note } from "@/services/apiService";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { notes, isLoadingNotes } = useNotes();
  const { searchResults } = useSearch();

  const handleCreateNote = () => {
    setIsCreateNoteOpen(true);
  };

  const handleNoteClick = (note: Note) => {
    toast({
      title: `Selected: ${note.title}`,
      description: "Note viewing/editing will be available in the next version.",
    });
  };

  const displayNotes = isSearching ? searchResults : notes;
  const hasNotes = displayNotes.length > 0;
  const isLoading = isLoadingNotes && !hasNotes;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onSearchResults={(hasResults) => setIsSearching(hasResults)}
        />
        
        <main 
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6",
            isMobile && sidebarOpen && "opacity-50"
          )}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {isSearching ? "Search Results" : "All Notes"}
              </h2>
              
              <div className="hidden md:flex">
                <Button className="bg-gradient hover:bg-brain-700" onClick={handleCreateNote}>
                  <Plus className="h-4 w-4 mr-2" /> New Note
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : hasNotes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayNotes.map((note) => (
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
      />
    </div>
  );
};

export default Index;
