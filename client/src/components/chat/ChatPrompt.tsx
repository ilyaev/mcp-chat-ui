import { Component } from "react";
import { Card } from "@/components/ui/card";
import Markdown from "react-markdown";

interface ChatPromptProps {
  prompt: string;
}

export class ChatPrompt extends Component<ChatPromptProps> {
  render() {
    return (
      <Card className="mb-0 p-4 bg-muted text-lg font-semibold">
        <Markdown>{this.props.prompt}</Markdown>
      </Card>
    );
  }
}
