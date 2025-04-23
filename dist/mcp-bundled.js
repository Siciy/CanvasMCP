#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_dotenv = require("dotenv");
var import_server = require("@modelcontextprotocol/sdk/server/index.js");
var import_stdio = require("@modelcontextprotocol/sdk/server/stdio.js");
var import_types = require("@modelcontextprotocol/sdk/types.js");
var import_zod_to_json_schema = require("zod-to-json-schema");
var import_zod2 = require("zod");

// src/operations/courses.ts
var import_node_fetch = __toESM(require("node-fetch"));
var import_zod = require("zod");

// src/common/utils.ts
var CanvasAPIError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "CanvasAPIError";
  }
};

// src/operations/courses.ts
var GetCoursesSchema = import_zod.z.object({});
async function getCourses(args) {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token)
    throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");
  const url = `${base.replace(/\/$/, "")}/api/v1/courses`;
  const res = await (0, import_node_fetch.default)(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text();
    throw new CanvasAPIError(res.status, body);
  }
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}

// src/index.ts
(0, import_dotenv.config)();
async function main() {
  const server = new import_server.Server(
    { name: "canvas-mcp-server", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );
  server.setRequestHandler(import_types.ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_courses",
        description: "List all courses for the current user",
        inputSchema: (0, import_zod_to_json_schema.zodToJsonSchema)(GetCoursesSchema)
      }
    ]
  }));
  server.setRequestHandler(import_types.CallToolRequestSchema, async (req) => {
    const { name, arguments: argsRaw } = req.params;
    const args = argsRaw ?? {};
    let text;
    try {
      if (name !== "get_courses") {
        throw new Error(`Unknown tool: ${name}`);
      }
      GetCoursesSchema.parse(args);
      text = await getCourses(args);
    } catch (err) {
      if (err instanceof import_zod2.z.ZodError) {
        text = `Invalid input: ${JSON.stringify(err.errors)}`;
      } else if (err instanceof CanvasAPIError) {
        text = `Canvas API Error (${err.status}): ${err.message}`;
      } else if (err instanceof Error) {
        text = `Error: ${err.message}`;
      } else {
        text = `Unknown error: ${String(err)}`;
      }
    }
    return {
      content: [
        { type: "text", text }
      ]
    };
  });
  console.error("\u{1F680} Starting Canvas MCP server\u2026");
  const transport = new import_stdio.StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error("MCP error:", err);
    process.exit(1);
  });
  console.error("\u2705 Canvas MCP server started\u2014listening on STDIO");
  process.stdin.resume();
}
main().catch((err) => {
  console.error("Fatal error in MCP server:", err);
  process.exit(1);
});
