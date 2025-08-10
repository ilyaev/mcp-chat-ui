import { Component } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  showToolResponse,
  type AgentResponse,
} from "@/store/slices/chatSessionSlice";
import {
  SpinnerIcon,
  CheckmarkIcon,
  PromptIcon,
  EntityIdIcon,
  EntityTypeIcon,
  CalendarIcon,
  TimezoneIcon,
  SearchIcon,
  ExpressionIcon,
  LimitIcon,
  OffsetIcon,
} from "@/components/ui/icons";
import { parseJSON } from "@/lib/utils";
import { connect } from "react-redux";
import type { Dispatch } from "@reduxjs/toolkit";
import { ChatChart, type ChatChartConfig } from "./ChatChart";
import HTMLPreview from "../preview/HTMLPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface ChatResponseProps {
  response: AgentResponse;
  nextItem?: AgentResponse;
  dispatch?: Dispatch;
  index: number;
  onFixErrors?: (index: number, errors: string[]) => void;
}

interface State {
  errors: string[];
}

const IconsMap = {
  prompt: <PromptIcon />,
  entityId: <EntityIdIcon />,
  entityType: <EntityTypeIcon />,
  type: <EntityTypeIcon />,
  dateFrom: <CalendarIcon />,
  timezone: <TimezoneIcon />,
  search: <SearchIcon />,
  expressions: <ExpressionIcon />,
  limit: <LimitIcon />,
  offset: <OffsetIcon />,
} as never;

export class ChatResponse extends Component<ChatResponseProps, State> {
  constructor(props: ChatResponseProps) {
    super(props);
    this.state = {
      errors: [],
    };
  }

  componentDidMount(): void {
    window.addEventListener("message", (event) => {
      const data = event.data;
      if (data && data.type === "error-tracking") {
        this.setState((prevState) => ({
          errors: [...prevState.errors, data.error],
        }));
      }
    });
  }

  render() {
    const { started, finished, name } = this.props.response;
    const toolArguments = this.props.response.arguments;
    const isTool = Boolean(name || toolArguments);
    const isChart = Boolean(
      this.props.response.json && this.props.response.json.chartData
    );
    const isImage = Boolean(
      this.props.response.image && this.props.response.image.data
    );
    const isHtml = Boolean(
      this.props.response.html && this.props.response.html.text
    );
    return (
      <div
        style={{ maxWidth: "95vw", overflow: "auto" }}
        className={`bg-transparent border-0 text-base item flex flex-col ${
          isTool
            ? "p-0 mb-1 flex-row items-center gap-2 text-muted-foreground flex"
            : "mb-2 p-1 gap-6"
        }`}
      >
        {started && <SpinnerIcon />}
        {finished && <CheckmarkIcon />}
        {isTool ? (
          this.renderTool(this.props.response)
        ) : isChart ? (
          this.renderChart(this.props.response)
        ) : isImage ? (
          this.renderImage(this.props.response)
        ) : isHtml ? null : (
          <>
            {this.props.nextItem && this.props.nextItem.html ? (
              <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="account">HTML Preview</TabsTrigger>
                  <TabsTrigger value="password">HTML Code</TabsTrigger>
                  {this.state.errors.length > 0 && (
                    <TabsTrigger value="errors" style={{ color: "red" }}>
                      Errors
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="account">
                  <HTMLPreview index={this.props.index}>
                    {this.props.nextItem.html.text}
                  </HTMLPreview>
                </TabsContent>
                <TabsContent value="password">
                  <Textarea style={{ width: "1024px" }}>
                    {this.props.nextItem.html.text
                      .replace("```html", "")
                      .replace("```", "")}
                  </Textarea>
                </TabsContent>
                {this.state.errors.length > 0 && (
                  <TabsContent value="errors">
                    {Array.from(new Set(this.state.errors)).map(
                      (error, index) => (
                        <div key={index}>{error}</div>
                      )
                    )}
                    <Button
                      variant="destructive"
                      className="mt-2"
                      onClick={() => {
                        if (this.props.onFixErrors) {
                          this.props.onFixErrors(
                            this.props.index,
                            this.state.errors
                          );
                        }
                      }}
                    >
                      Auto Fix Errors
                    </Button>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <Markdown remarkPlugins={[remarkGfm]}>
                {this.props.response.text.replace("[CHART_HERE]", "")}
              </Markdown>
            )}
          </>
        )}
      </div>
    );
  }

  renderImage(response: AgentResponse) {
    const { image } = response;
    if (!image) return null;

    return (
      <div className="flex flex-col">
        <img src={`data:${image.mimeType};base64,${image.data}`} width={640} />
      </div>
    );
  }

  renderChart(response: AgentResponse) {
    const config = response.json as ChatChartConfig;
    return <ChatChart config={config} />;
  }

  renderTool(response: AgentResponse) {
    const {
      name,
      arguments: toolArguments,
      runtime,
      id: toolResponseId,
    } = response;
    const argList = parseJSON(toolArguments || "{}");
    return (
      <div className="flex flex-row items-center gap-2">
        <div
          className={"font-italic underline cursor-pointer"}
          onClick={() => {
            if (this.props.dispatch) {
              this.props.dispatch(showToolResponse(toolResponseId || ""));
            }
          }}
        >
          {name}
        </div>
        <div className="flex flex-row items-center gap-4 text-sm text-muted-foreground">
          {Object.entries(argList)
            .filter(([key]) => key !== "dateTo")
            .map(([key, value]) => (
              <div key={key} className="flex items-center gap-1">
                {this.renderOneArgument(
                  key,
                  key === "dateFrom"
                    ? `${value} to ${argList.dateTo || "Today"}`
                    : value
                )}
              </div>
            ))}
          {runtime && <div> {runtime} sec</div>}
        </div>
      </div>
    );
  }

  renderOneArgument(key: string, value: unknown) {
    return (
      <span className="border rounded px-2 py-1 flex items-center gap-1">
        <span className="font-medium">{IconsMap[key] || key + ":"}</span>
        <span>
          {typeof value === "string" ? (
            value.length < 80 ? (
              value
            ) : (
              value.slice(0, 80) + "..."
            )
          ) : Array.isArray(value) ? (
            value.length > 5 ? (
              <span title={value.join(", ")}>[{value.length} values]</span>
            ) : (
              value.join(", ")
            )
          ) : (
            String(value)
          )}
        </span>
      </span>
    );
  }
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps)(ChatResponse);
