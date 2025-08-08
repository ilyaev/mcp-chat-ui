import * as React from "react";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PromptTemplate } from "@/prompts";

interface Props {
  onChange?: (templateId: number) => void;
  prompts: PromptTemplate[];
}

export class PromptsCombobox extends React.Component<
  Props,
  { open: boolean; value: number }
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      value: 0,
    };
    this.setOpen = this.setOpen.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  setOpen(open: boolean) {
    this.setState({ open });
  }

  setValue(value: number) {
    this.props.onChange?.(value);
  }

  render() {
    const { open } = this.state;
    return (
      <Popover open={open} onOpenChange={this.setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            id="btn-prompt-templates"
            aria-expanded={open}
            className="w-[400px] flex text-muted-foreground"
          >
            <SearchIcon className="size-4 shrink-0 opacity-50" />
            Prompt Templates (F1)
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Search prompt templates..."
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No prompt template found</CommandEmpty>
              {this.props.prompts.map((prompt) => (
                <CommandItem
                  key={prompt.id + ""}
                  value={prompt.name + "|" + prompt.id}
                  onSelect={(currentValue) => {
                    this.setValue(parseInt(currentValue.split("|")[1]));
                    this.setOpen(false);
                  }}
                >
                  {prompt.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
}
