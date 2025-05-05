
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiService, SearchRequest, Note } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

export function useSearch() {
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { mutate: performSearch, isPending: isSearching } = useMutation({
    mutationFn: (query: string) => {
      const request: SearchRequest = { query, limit: 10 };
      return apiService.semanticSearch(request);
    },
    onSuccess: (results) => {
      setSearchResults(results);
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search query or create new notes.",
        });
      }
    },
    onError: (error) => {
      console.error("Search failed:", error);
      toast({
        title: "Search failed",
        description: "There was an error performing your search. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      performSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  return {
    searchQuery,
    searchResults,
    isSearching,
    handleSearch,
    setSearchQuery,
  };
}
