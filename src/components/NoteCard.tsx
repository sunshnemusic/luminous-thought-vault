
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  title: string;
  content: string;
  date: string;
  tags: string[];
  type?: "note" | "link" | "image";
  onClick?: () => void;
}

export default function NoteCard({
  title,
  content,
  date,
  tags,
  type = "note",
  onClick
}: NoteCardProps) {
  return (
    <Card 
      className="h-full transition-all hover:border-brain-300 hover:shadow-md cursor-pointer" 
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs capitalize",
              type === "note" && "border-blue-300 text-blue-600",
              type === "link" && "border-green-300 text-green-600",
              type === "image" && "border-amber-300 text-amber-600"
            )}
          >
            {type}
          </Badge>
        </div>
        <CardDescription className="text-xs">{date}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
