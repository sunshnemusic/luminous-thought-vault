
import { useState } from "react";
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useModel } from "@/contexts/ModelContext";

const models = [
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast and affordable model with vision capabilities",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
    description: "Powerful all-purpose model with vision capabilities",
  },
  {
    value: "gpt-4.5-preview",
    label: "GPT-4.5 Preview",
    description: "Most advanced model with superior reasoning",
  },
];

export default function ModelSelector() {
  const [open, setOpen] = useState(false);
  const { currentModel, setCurrentModel } = useModel();

  const handleSelectModel = (value: string) => {
    setCurrentModel(value as "gpt-4o-mini" | "gpt-4o" | "gpt-4.5-preview");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[220px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>{models.find(model => model.value === currentModel)?.label || "Select model"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 md:w-[320px]">
        <Command>
          <CommandInput placeholder="Search AI models..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup>
            {models.map((model) => (
              <CommandItem
                key={model.value}
                onSelect={() => handleSelectModel(model.value)}
                className="flex flex-col items-start py-2"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                    <span>{model.label}</span>
                  </div>
                  {currentModel === model.value && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <p className="ml-6 text-xs text-muted-foreground">
                  {model.description}
                </p>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
