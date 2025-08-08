import express from "express";

const originalConsoleLog = console.log;

const buildLogMessage = (args: any[], level: string, extra: any = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    msg: args.join(", "),
    level,
    ...extra,
  });
};

console.log = (...args) => {
  const lastObject = args.find((arg) => typeof arg === "object");
  originalConsoleLog(
    buildLogMessage(
      lastObject ? args.slice(0, -1) : args,
      "info",
      lastObject || {}
    )
  );
};

console.warn = (...args) => {
  originalConsoleLog(buildLogMessage(args, "warn"));
};

console.error = (...args) => {
  if (args[1] instanceof Error) {
    originalConsoleLog(
      buildLogMessage([args[0]], "error", {
        success: false,
        error: args[1].message,
        stack: args[1].stack,
      })
    );
  } else {
    originalConsoleLog(
      buildLogMessage(args, "error", {
        success: false,
      })
    );
  }
};

export const log = (...args: any[]) => {
  console.log(...args);
};

export const logMCPRequest = (req: express.Request) => {
  if (req.body && req.body.method && req.body.method === "tools/call") {
    originalConsoleLog(
      buildLogMessage([`MCP Tool Call`], "info", {
        tool_name: req.body.params?.name,
        tool_params: req.body.params?.arguments,
      })
    );
  }
};
