
export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  type: "note" | "link" | "image";
}

export const sampleNotes: Note[] = [
  {
    id: "1",
    title: "How to Build a Second Brain",
    content: "The Second Brain method is a personal knowledge management system created by Tiago Forte. It consists of four steps: Capture, Organize, Distill, and Express (CODE).",
    date: "2023-05-05",
    tags: ["productivity", "PKM"],
    type: "note",
  },
  {
    id: "2",
    title: "Vector Databases for Beginners",
    content: "Vector databases store data as high-dimensional vectors, enabling similarity search rather than exact matches. Popular options include Pinecone, Weaviate, and Milvus.",
    date: "2023-05-10",
    tags: ["database", "AI", "vectors"],
    type: "note",
  },
  {
    id: "3",
    title: "React Design Patterns",
    content: "Key React patterns include: Compound Components, Render Props, Custom Hooks, Context API, and Higher-Order Components. Each solves specific problems in component design.",
    date: "2023-05-15",
    tags: ["react", "frontend", "programming"],
    type: "note",
  },
  {
    id: "4",
    title: "Stanford CS229: Machine Learning",
    content: "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU",
    date: "2023-04-28",
    tags: ["learning", "AI", "course"],
    type: "link",
  },
  {
    id: "5",
    title: "The PARA Method for Knowledge Organization",
    content: "PARA stands for Projects, Areas, Resources, and Archives. It provides a simple, actionable way to organize digital information across tools and platforms.",
    date: "2023-04-20",
    tags: ["productivity", "organization"],
    type: "note",
  },
];
