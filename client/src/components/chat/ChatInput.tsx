import React, { Component } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PROMPT_HISTORY_KEY = "chatPromptHistory";

function getPromptHistory(): string[] {
  const raw = localStorage.getItem(PROMPT_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

function pushPromptToHistory(prompt: string) {
  if (!prompt) return;
  const history = getPromptHistory();
  if (history.length === 0 || history[history.length - 1] !== prompt) {
    history.push(prompt);
    localStorage.setItem(
      PROMPT_HISTORY_KEY,
      JSON.stringify(history.slice(-10))
    );
  }
}

interface ChatInputProps {
  onSend: (prompt: string) => void;
  disabled?: boolean;
  brief?: boolean;
}

interface State {
  input: string;
  historyIndex: number;
}

export class ChatInput extends Component<ChatInputProps, State> {
  state = {
    historyIndex: -1,
    input: "",
  };

  handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ historyIndex: -1, input: e.target.value });
  };

  handleSend = () => {
    pushPromptToHistory(this.state.input);
    this.props.onSend(this.state.input);
    this.setState({ historyIndex: -1, input: "" });
  };

  handleClear = () => {
    this.setState({ historyIndex: -1, input: "" });
  };

  handleHistoryNav = (direction: "prev" | "next") => {
    const history = getPromptHistory();
    if (history.length === 0) return;
    let idx = this.state.historyIndex;
    if (idx === -1) {
      idx = direction === "prev" ? history.length - 1 : 0;
    } else {
      idx = direction === "prev" ? idx - 1 : idx + 1;
      if (idx < 0) idx = history.length - 1;
      if (idx >= history.length) idx = -1;
    }
    this.setState({ historyIndex: idx, input: idx === -1 ? "" : history[idx] });
  };

  render() {
    return (
      <div
        className={`${
          this.props.brief ? "" : "flex flex-row "
        }items-center gap-3 p-0 mt-6 text-lg`}
      >
        <Textarea
          className="flex-1 min-h-[80px] max-h-[80px] border-1 resize-none text-lg rounded-lg"
          value={this.state.input}
          style={{ fontSize: "large" }}
          onChange={this.handleTextareaChange}
          id={"input-prompt"}
          placeholder="Enter your prompt here... or cmd/ctrl + arrows to scroll through history. cmd/ctrl + enter to send. F2 to focus"
          disabled={this.props.disabled}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              this.handleSend();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "ArrowUp") {
              e.preventDefault();
              this.handleHistoryNav("prev");
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") {
              e.preventDefault();
              this.handleHistoryNav("next");
            }
          }}
        />
        <div
          className={
            this.props.brief
              ? "items-center flex justify-center py-3 gap-3"
              : "flex gap-3"
          }
        >
          <Button
            onClick={this.handleSend}
            disabled={this.props.disabled}
            className="text-lg"
          >
            Send
          </Button>
          <Button
            variant="secondary"
            onClick={this.handleClear}
            disabled={this.props.disabled || !this.state.input}
            className="text-lg mr-5"
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }
}
