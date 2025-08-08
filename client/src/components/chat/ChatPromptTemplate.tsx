import { Component } from "react";
import { PromptsCombobox } from "./ChatPromptSelector";
import type { RootState } from "@/store";
import { connect } from "react-redux";
import type { Dispatch } from "@reduxjs/toolkit";
import {
  getPopularPrompts,
  getPromptTemplate,
  type PromptTemplate,
} from "@/prompts";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ChatPromptTemplateProps {
  templateId?: number;
  dispatch?: Dispatch;
  onPromptSelected: (value: string) => void;
}

interface State {
  isOpen: boolean;
  tpl: PromptTemplate | undefined;
  variables: Record<string, string>;
  prompts: PromptTemplate[];
}

class ChatPromptTemplate extends Component<ChatPromptTemplateProps, State> {
  constructor(props: ChatPromptTemplateProps) {
    super(props);
    this.state = {
      isOpen: false,
      tpl: undefined,
      variables: {},
      prompts: getPopularPrompts(),
    };
  }

  prefix: string =
    "chat_prompt_" + Math.random().toString(36).substring(2, 15) + "_";

  render() {
    return (
      <>
        {this.state.isOpen && this.renderDialog()}
        <div className="flex items-center justify-center mx-4">
          <PromptsCombobox
            prompts={this.state.prompts}
            onChange={(templateId) => {
              const tpl = getPromptTemplate(templateId);
              if (tpl?.variables) {
                this.setState({ isOpen: true, tpl });
              } else {
                this.props.onPromptSelected(tpl?.content || "");
              }
              setTimeout(() => {
                this.setState({ prompts: getPopularPrompts() });
              }, 1000);
            }}
          />
        </div>
      </>
    );
  }

  submitPrompt() {
    const prompt = this.state.tpl?.variables?.reduce((res, v) => {
      return res.replace(
        new RegExp(`\\[${v.name}\\]`, "ig"),
        this.state.variables[v.name] || v.value || ""
      );
    }, this.state.tpl.content);
    this.setState({ isOpen: false, tpl: undefined });
    this.props.onPromptSelected(prompt || "");
  }

  renderDialog() {
    return (
      <Dialog
        open={true}
        onOpenChange={(isOpen) => this.setState({ isOpen })}
        modal={true}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{this.state.tpl?.name}</DialogTitle>
            <DialogDescription>{this.state.tpl?.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {this.state.tpl?.variables?.map((variable) => (
              <div key={variable.name} className="grid gap-3">
                <Label htmlFor={variable.name}>{variable.label}</Label>
                <Input
                  id={`${this.prefix}_${variable.name}`}
                  name={variable.name}
                  value={
                    typeof this.state.variables[variable.name] !== "undefined"
                      ? this.state.variables[variable.name]
                      : variable.value || ""
                  }
                  onChange={(e) =>
                    this.setState({
                      variables: {
                        ...this.state.variables,
                        [variable.name]: e.target.value,
                      },
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (e.metaKey || e.ctrlKey) {
                        this.submitPrompt();
                        return;
                      }
                      e.preventDefault();
                      const variables = this.state.tpl?.variables || [];
                      const idx = variables.findIndex(
                        (v) => v.name === variable.name
                      );
                      if (idx < variables.length - 1) {
                        const nextVar = variables[idx + 1];
                        const nextInput = document.getElementById(
                          `${this.prefix}_${nextVar.name}`
                        );
                        nextInput?.focus();
                      } else {
                        this.submitPrompt();
                      }
                    }
                  }}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={this.submitPrompt.bind(this)}>
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  templateId: state.chatSession.templateId,
});

export default connect(mapStateToProps)(ChatPromptTemplate);
