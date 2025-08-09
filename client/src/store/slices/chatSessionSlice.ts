import { parseJSON } from "@/lib/utils";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ImageResponseData {
  text: string;
  type: string;
  data: string;
  mimeType: string;
}

export interface AgentResponse {
  text: string;
  id?: string;
  started?: boolean;
  finished?: boolean;
  name?: string;
  timestamp?: number;
  arguments?: string;
  runtime?: string;
  image?: ImageResponseData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json?: Record<string, any>;
}

export interface ChatItem {
  prompt: string;
  response: AgentResponse;
}

export interface ChatSessionState {
  tokens: number;
  items: ChatItem[];
  sending: boolean;
  connected: boolean;
  templateId: number;
  prompt: string;
  toolResponseId: string;
  mcpServers: { id: string; title: string }[];
}

const initialState: ChatSessionState = {
  tokens: 0,
  items: [],
  sending: false,
  connected: false,
  templateId: 0,
  prompt: "",
  toolResponseId: "",
  mcpServers: [],
};

const chatSessionSlice = createSlice({
  name: "chatSession",
  initialState,
  reducers: {
    addImageItem: (
      state,
      action: PayloadAction<{
        type: string;
        text: string;
        data: string;
        mimeType: string;
      }>
    ) => {
      const imageItem = action.payload;
      const item = {
        prompt: "",
        response: {
          text: "[image]",
          image: imageItem,
        },
      };
      state.items.push(item);
    },
    addChartItem: (
      state,
      action: PayloadAction<{
        id: string;
        output: { text: string; type: string };
      }>
    ) => {
      const chartItem = action.payload;
      const json = parseJSON(chartItem.output.text);
      const item = {
        prompt: "",
        response: {
          text: "[chart]",
          json,
        },
      };
      state.items.push(item);
    },
    addToolCall(
      state,
      action: PayloadAction<{
        sessionId: string;
        id: string;
        name: string;
        timestamp: number;
        arguments: string;
      }>
    ) {
      const item = state.items.find(
        (i) => i.response && i.response.id === action.payload.id
      );
      if (item) {
        item.response = {
          ...item.response,
          text: "[tool_call]",
          finished: true,
          started: false,
          runtime: (
            (action.payload.timestamp - item.response.timestamp!) /
            1000
          ).toFixed(1),
        };
      } else {
        state.items.push(
          {
            prompt: "",
            response: {
              ...action.payload,
              text: `[tool_call]`,
              started: true,
              finished: false,
            },
          },
          {
            prompt: "",
            response: {
              text: "",
            },
          }
        );
      }
    },
    setTokens(state, action: PayloadAction<number>) {
      state.tokens = action.payload;
    },
    setItems(state, action: PayloadAction<ChatItem[]>) {
      state.items = action.payload;
    },
    addItem(state, action: PayloadAction<ChatItem>) {
      state.items.push(action.payload);
    },
    updateLastResponse(state, action: PayloadAction<string>) {
      // const index = state.items.length - 1;
      let index = -1;
      for (let i = state.items.length - 1; i >= 0; i--) {
        if (
          typeof state.items[i].response.json === "undefined" &&
          typeof state.items[i].response.image === "undefined"
        ) {
          index = i;
          break;
        }
      }
      if (index >= 0 && state.items[index]) {
        state.items[index].response.text += action.payload;
      }
    },
    setSending(state, action: PayloadAction<boolean>) {
      state.sending = action.payload;
    },
    setPrompt(state, action: PayloadAction<string>) {
      state.prompt = action.payload;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setTemplateId(state, action: PayloadAction<number>) {
      state.templateId = action.payload;
    },
    showToolResponse(state, action: PayloadAction<string>) {
      state.toolResponseId = action.payload;
    },
    setMCPServers(
      state,
      action: PayloadAction<{ id: string; title: string }[]>
    ) {
      state.mcpServers = action.payload;
    },
    setChatSession(state, action: PayloadAction<Partial<ChatSessionState>>) {
      state.tokens =
        typeof action.payload.tokens === "undefined"
          ? state.tokens
          : action.payload.tokens;
      state.items =
        typeof action.payload.items === "undefined"
          ? state.items
          : action.payload.items;
      state.sending =
        typeof action.payload.sending === "undefined"
          ? state.sending
          : action.payload.sending;
      state.connected =
        typeof action.payload.connected === "undefined"
          ? state.connected
          : action.payload.connected;
    },
  },
});

export const {
  setTokens,
  setItems,
  setSending,
  setConnected,
  setChatSession,
  updateLastResponse,
  addItem,
  addToolCall,
  setTemplateId,
  setPrompt,
  showToolResponse,
  addChartItem,
  setMCPServers,
  addImageItem,
} = chatSessionSlice.actions;
export default chatSessionSlice.reducer;
