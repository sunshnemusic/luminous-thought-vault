
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService, Note, NoteCreateRequest } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

export function useNotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all notes
  const { data: notes = [], isLoading: isLoadingNotes, error: notesError } = useQuery({
    queryKey: ["notes"],
    queryFn: apiService.getNotes,
  });

  // Create note mutation
  const { mutate: createNote, isPending: isCreating } = useMutation({
    mutationFn: apiService.createNote,
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Note created",
        description: newNote.vectorId 
          ? "Your note has been created and stored as a vector embedding." 
          : "Your note has been created (without vector embedding)."
      });
    },
    onError: (error) => {
      console.error("Failed to create note:", error);
      toast({
        title: "Failed to create note",
        description: "There was an error creating your note. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    notes,
    isLoadingNotes,
    notesError,
    createNote,
    isCreating,
  };
}
