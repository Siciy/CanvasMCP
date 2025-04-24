import { config } from "dotenv";
import path from "path";

const scriptPath = process.argv[1]!;
const scriptDir = path.dirname(scriptPath);
const envPath = path.resolve(scriptDir, "../.env");

const result = config({ path: envPath });
if (result.error) {
  console.error("dotenv failed to load from", envPath, result.error);
} else {
  console.error("dotenv loaded from", envPath);
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

import { getCourses, GetCoursesSchema } from "./operations/courses.js";
import { getCourseContent, GetCourseContentSchema } from "./operations/courseContent.js";
import { CanvasAPIError } from "./common/utils.js";

async function main() {
  const server = new Server(
    { name: "canvas-mcp-server", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_courses",
        description: "List all courses for the current user",
        inputSchema: zodToJsonSchema(GetCoursesSchema),
      },
      {
        name: "get_course_content",
        description: "Retrieve the modules and items for a specified course",
        inputSchema: zodToJsonSchema(GetCourseContentSchema),
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: argsRaw } = req.params;
    const args = (argsRaw ?? {}) as Record<string, unknown>;

    let text: string;
    try {
      if (name === "get_courses") {
        GetCoursesSchema.parse(args);
        text = await getCourses(args);
      } else if (name === "get_course_content") {
        const { course_id } = GetCourseContentSchema.parse(args);
        text = await getCourseContent({ course_id });
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
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

  console.error("Starting Canvas MCP server…");

  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error("MCP error:", err);
    process.exit(1);
  });

  console.error("Canvas MCP server started—listening on STDIO");
  process.stdin.resume();
}

main().catch((err) => {
  console.error("Fatal error in MCP server:", err);
  process.exit(1);
});
