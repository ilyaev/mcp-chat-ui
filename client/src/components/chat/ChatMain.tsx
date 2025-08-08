import { Component } from "react";
import ChatContainer from "./ChatContainer";
import ChatList from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WebSocketSessionClient } from "@/lib/ws_client";
import { connect } from "react-redux";
import type { Dispatch } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  showToolResponse,
  type ChatItem,
} from "@/store/slices/chatSessionSlice";
import { CardTitle } from "../ui/card";
import { ChatScrollToBottom } from "./ChatScrollToBottom";
import ChatToolResponse from "./ChatToolResponse";

interface ChatMainState {
  scroll: "auto" | "manual";
  brief: boolean;
}

interface ChatMainProps {
  handleLogout?: () => void;
  googleIdToken?: string | null;
  dispatch?: Dispatch;
  connected?: boolean;
  items?: ChatItem[];
  tokens?: number;
  sending?: boolean;
  username?: string;
  toolResponseId?: string;
  noAuth?: boolean;
}

class ChatMain extends Component<ChatMainProps, ChatMainState> {
  chatSession: WebSocketSessionClient | null = null;
  inScroll: boolean = false;
  scrollInterval: NodeJS.Timeout | null = null;
  manualScroll: boolean = false;

  state: ChatMainState = {
    brief: true,
    scroll: "auto",
  };

  componentDidMount(): void {
    if (!this.chatSession) {
      this.chatSession = new WebSocketSessionClient(
        this.props.googleIdToken || "",
        this.props.dispatch!
      );
      this.chatSession.onUpdate = () => {
        this.pushScrollToBottom(true);
      };
      document.body.addEventListener("keydown", this.onF1.bind(this));
    }
  }

  onF1(e: KeyboardEvent) {
    if (e.key === "F1") {
      e.preventDefault();
      document.getElementById("btn-prompt-templates")?.click();
    }
    if (e.key === "F2") {
      e.preventDefault();
      document.getElementById("input-prompt")?.focus();
    }
  }

  handleSend = async (prompt: string) => {
    if (!prompt.trim()) return;
    this.setState({ brief: false });
    this.manualScroll = false;
    this.chatSession?.send(prompt);
  };

  handlePromptSelected = (value: string) => {
    if (!this.props.sending) {
      setTimeout(() => {
        this.handleSend(value);
      }, 0);
    }
  };

  componentDidUpdate(prevProps: Readonly<ChatMainProps>): void {
    if (
      prevProps.googleIdToken !== this.props.googleIdToken &&
      this.chatSession &&
      this.props.googleIdToken
    ) {
      this.chatSession.googleIdToken = this.props.googleIdToken;
    }
  }

  getScrollAreaDiv = () => {
    const scrollArea = document.getElementById("chat-scroll-area");
    const firstDiv = scrollArea?.querySelector("div");
    return firstDiv as HTMLDivElement | null;
  };

  pushScrollToBottom = (auto: boolean = false) => {
    if (auto && this.manualScroll) {
      return;
    }
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
    this.scrollInterval = setTimeout(() => {
      this.manualScroll = false;
      if (this.state.scroll === "manual") {
        this.setState({ scroll: "auto" });
      }

      const firstDiv = this.getScrollAreaDiv();

      if (firstDiv) {
        this.inScroll = true;
        firstDiv.onscrollend = () => {
          this.inScroll = false;
          firstDiv.onscrollend = null;
          this.scrollInterval = null;
        };
        firstDiv.scrollTo({ top: firstDiv.scrollHeight, behavior: "smooth" });
      }
    }, 100);
  };

  render() {
    const brief = this.state.brief;
    return (
      <ChatContainer
        handleLogout={this.props.noAuth ? undefined : this.props.handleLogout}
        tokens={this.props.tokens}
        onPromptSelected={this.handlePromptSelected}
      >
        {!brief ? (
          <ScrollArea
            className="h-[77.3vh] w-full rounded-md p-0 pr-5 border-0 overflow-auto"
            id="chat-scroll-area"
            onScroll={this.onScroll.bind(this)}
            style={{ overflow: "auto" }}
          >
            <ChatList sending={this.props.sending} />
            {this.state.scroll === "manual" && (
              <ChatScrollToBottom
                onClick={() => this.pushScrollToBottom(false)}
              />
            )}
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground h-[30vh] flex items-end justify-center">
            <CardTitle className="text-4xl font-light mb-12 text-center">
              {this.props.username
                ? `Welcome, ${this.props.username}. Let's get started.`
                : "Hey, there. Ready to dive in?"}
            </CardTitle>
          </div>
        )}
        <div
          className={`${
            brief ? "w-[50vw] min-w-[700px]" : ""
          } center mx-auto mt-4`}
        >
          <ChatInput
            onSend={this.handleSend}
            brief={brief}
            disabled={this.props.sending === true}
          />
        </div>
        {brief && (
          <div className="text-center text-muted-foreground h-[41vh] flex items-center justify-center"></div>
        )}
        {this.props.toolResponseId && (
          <ChatToolResponse
            tool={
              this.chatSession?.toolCallResults[this.props.toolResponseId] || {
                tool: "Unknown",
                text: "Unknown",
                type: "Unknown",
                args: "Unknown",
              }
            }
            open={true}
            onClose={() => {
              this.props.dispatch!(showToolResponse(""));
            }}
          />
        )}
      </ChatContainer>
    );
  }

  onScroll() {
    if (this.inScroll) return;

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }

    this.manualScroll = true;
    const firstDiv = this.getScrollAreaDiv();

    if (
      Math.abs(
        firstDiv!.scrollTop - (firstDiv!.scrollHeight - firstDiv!.clientHeight)
      ) < 5
    ) {
      this.manualScroll = false;
    }

    const scrollState = this.manualScroll ? "manual" : "auto";

    if (this.state.scroll !== scrollState) {
      this.setState({ scroll: scrollState });
    }
  }
}

const mapStateToProps = (state: RootState) => ({
  googleIdToken: state.profile.googleIdToken,
  connected: state.chatSession.connected,
  tokens: state.chatSession.tokens,
  sending: state.chatSession.sending,
  username: state.profile.name.split(" ")[0] || "",
  toolResponseId: state.chatSession.toolResponseId || "",
  noAuth: state.profile.noAuth,
});

export default connect(mapStateToProps)(ChatMain);
