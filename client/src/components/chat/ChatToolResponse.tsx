import { Component } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { parseJSON } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { ImageResponseData } from "@/store/slices/chatSessionSlice";

interface ChatToolResponseProps {
  open: boolean;
  onClose: () => void;
  tool: {
    tool: string;
    text: string;
    type: string;
    args: string;
    items?: ImageResponseData[];
  };
}

class ChatToolResponse extends Component<ChatToolResponseProps> {
  render() {
    let result = "";

    if (this.props.tool.text) {
      result = JSON.stringify(parseJSON(this.props.tool.text), null, 2);

      if (
        this.props.tool.text &&
        this.props.tool.text[0] !== "{" &&
        this.props.tool.text[0] !== "["
      ) {
        result = this.props.tool.text;
      }
    } else if (this.props.tool.items) {
      result = this.props.tool.items
        .map((item) => JSON.stringify(item, null, 2))
        .join("\n");
    }

    const str =
      "Arguments: \n\n" +
      JSON.stringify(parseJSON(this.props.tool.args), null, 2) +
      "\n\nResult:\n\n" +
      result;
    return (
      <Dialog
        open={true}
        onOpenChange={() => this.props.onClose()}
        modal={true}
      >
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>Tool Response</DialogTitle>
            <DialogDescription>{this.props.tool.tool}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]  w-full rounded-md p-0 pr-5 border-0 overflow-auto">
            <Textarea value={str} readOnly />
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

export default ChatToolResponse;
