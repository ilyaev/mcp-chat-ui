import React, { Component } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { connect } from "react-redux";
import type { RootState } from "@/store";
import type { ProfileState } from "@/store/slices/profileSlice";

import ChatPromptTemplate from "./ChatPromptTemplate";
import { BoxIcon } from "lucide-react";

interface ChatContainerProps {
  children: React.ReactNode;
  handleLogout?: () => void;
  tokens?: number;
  profile: ProfileState;
  onPromptSelected: (value: string) => void;
}

class ChatContainer extends Component<ChatContainerProps> {
  render() {
    const { name, email, picture } = this.props.profile;
    return (
      <Card className="w-full h-full mx-0 mt-0 bg-background p-3 border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex">
            Chat MCP
            <div className="flex-1 flex justify-center">
              <ChatPromptTemplate
                onPromptSelected={this.props.onPromptSelected}
              />
              {typeof this.props.tokens !== "undefined" &&
                this.props.tokens > 0 && (
                  <div className="flex items-center gap-1 border-0 text-muted-foreground">
                    <Label>
                      <BoxIcon /> {this.props.tokens}K
                    </Label>
                  </div>
                )}
            </div>
          </CardTitle>
          {this.props.handleLogout && (
            <CardAction className="text-sm text-muted-foreground flex items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={this.props.handleLogout}>
                  Logout
                </Button>
                <Avatar title={`Google Account: ${name} <${email}>`}>
                  <AvatarImage src={picture} />
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="noborder">{this.props.children}</CardContent>
      </Card>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  profile: state.profile,
});

export default connect(mapStateToProps)(ChatContainer);
