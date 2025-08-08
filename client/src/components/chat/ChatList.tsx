import React, { Component } from "react";
import { ChatPrompt } from "./ChatPrompt";
import ChatResponse from "./ChatResponse";
import type { ChatItem } from "@/store/slices/chatSessionSlice";
import { SpinnerIcon } from "@/components/ui/icons";
import { connect } from "react-redux";
import type { RootState } from "@/store";

interface ChatListProps {
  items: ChatItem[];
  sending?: boolean;
}

export class ChatList extends Component<ChatListProps> {
  render() {
    return (
      <div className="flex flex-col gap-2">
        {this.props.items.map((item, idx) => (
          <React.Fragment key={`chat-item-${idx}`}>
            {item.prompt && <ChatPrompt prompt={item.prompt} />}
            {item.response.text && <ChatResponse response={item.response} />}
          </React.Fragment>
        ))}
        {this.props.sending ? (
          <span className="inline-flex items-center gap-2 pl-0">
            <span>
              <SpinnerIcon />
            </span>
            Working...
          </span>
        ) : (
          ""
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  items: state.chatSession.items,
});

export default connect(mapStateToProps)(ChatList);
