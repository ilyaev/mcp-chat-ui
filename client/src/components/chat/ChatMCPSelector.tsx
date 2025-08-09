import * as React from "react";
import { StarsIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "../ui/checkbox";

export const LOCAL_STORAGE_KEY = "externalMCPServers";

interface Props {
  servers: { id: string; title: string }[];
}

export class MCPServersSelector extends React.Component<
  Props,
  { open: boolean; values: string[] }
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      values: localStorage.getItem(LOCAL_STORAGE_KEY)
        ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]")
        : [],
    };
    this.setOpen = this.setOpen.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  setOpen(open: boolean) {
    this.setState({ open });
  }

  setValue(value: string) {
    const existingValues = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
    );
    const newValues = existingValues.includes(value)
      ? existingValues.filter((id: string) => id !== value)
      : [...existingValues, value];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newValues));
    this.setState({ values: newValues });
  }

  render() {
    const { open } = this.state;
    return (
      <>
        <div
          className=""
          title={`${
            this.state.values.length || "0"
          } External MCP Servers selected`}
        >
          {this.state.values.length || "0"}
        </div>
        <Popover open={open} onOpenChange={this.setOpen}>
          <PopoverTrigger asChild>
            <StarsIcon className="cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            {this.props.servers.map((server) => (
              <div
                key={server.id}
                onClick={() => this.setValue(server.id)}
                className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
              >
                <Checkbox checked={this.state.values.includes(server.id)} />
                {server.title}
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </>
    );
  }
}
