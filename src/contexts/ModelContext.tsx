
import { createContext, useState, useContext, ReactNode } from "react";

type ModelType = "gpt-4o-mini" | "gpt-4o" | "gpt-4.5-preview";

interface ModelContextType {
  currentModel: ModelType;
  setCurrentModel: (model: ModelType) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [currentModel, setCurrentModel] = useState<ModelType>("gpt-4o");

  return (
    <ModelContext.Provider value={{ currentModel, setCurrentModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
