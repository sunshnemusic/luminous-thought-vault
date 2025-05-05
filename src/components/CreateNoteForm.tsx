
import { useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotes } from "@/hooks/useNotes";
import { useToast } from "@/hooks/use-toast";
import { NoteCreateRequest } from "@/services/apiService";
import { cn } from "@/lib/utils";

interface CreateNoteFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateNoteForm({ isOpen, onOpenChange }: CreateNoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState<"note" | "link" | "image">("note");
  const [storeVectorEmbedding, setStoreVectorEmbedding] = useState(true);
  const { toast } = useToast();
  const { createNote, isCreating } = useNotes();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }
    
    const newNote: NoteCreateRequest = {
      title: title.trim(),
      content: content.trim(),
      tags,
      type,
      storeVector: storeVectorEmbedding
    };
    
    createNote(newNote);
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setTitle("");
    setContent("");
    setTagInput("");
    setTags([]);
    setType("note");
    setStoreVectorEmbedding(true);
  };
  
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-gradient">Create New Note</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as "note" | "link" | "image")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Enter note title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)} 
              className="border-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content" 
              placeholder={type === "link" ? "Enter URL" : "Enter note content"} 
              value={content}
              onChange={(e) => setContent(e.target.value)} 
              className="min-h-[150px] border-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input 
                id="tags" 
                placeholder="Add tags" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-input"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
            </div>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)} 
                  />
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="vector-storage" 
              checked={storeVectorEmbedding} 
              onCheckedChange={setStoreVectorEmbedding}
            />
            <Label htmlFor="vector-storage" className="cursor-pointer">
              Store as vector embedding
            </Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button 
              type="submit" 
              className="bg-gradient hover:bg-brain-700"
              disabled={isCreating}
            >
              {isCreating ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
