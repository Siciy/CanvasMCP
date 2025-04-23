import { config } from "dotenv";
import path from "path";

// process.argv[1] is the absolute path to your running bundle (e.g. .../dist/mcp-bundled.js)
const scriptPath = process.argv[1]!;
const scriptDir = path.dirname(scriptPath);

// assume your .env lives one level up from dist/, i.e. project root
const envPath = path.resolve(scriptDir, "../.env");

const result = config({ path: envPath });
if (result.error) {
  console.error("❌ dotenv failed to load from", envPath, result.error);
} else {
  console.error("✅ dotenv loaded from", envPath);
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
import { CanvasAPIError } from "./common/utils.js";

async function main() {
  const server = new Server(
    { name: "canvas-mcp-server", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  // Advertise our tool in ListTools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_courses",
        description: "List all courses for the current user",
        inputSchema: zodToJsonSchema(GetCoursesSchema),
      },
    ],
  }));

  // Handle invocations; ALWAYS return { content: [...] }
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: argsRaw } = req.params;
    const args = (argsRaw ?? {}) as Record<string, unknown>;

    let text: string;
    try {
      if (name !== "get_courses") {
        throw new Error(`Unknown tool: ${name}`);
      }
      // validate
      GetCoursesSchema.parse(args);
      // run your logic
      text = await getCourses(args);
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

    // Always include a content array
    return {
      content: [
        { type: "text", text }
      ]
    };
  });

  // Log banners on stderr so stdout stays JSON-clean
  console.error("🚀 Starting Canvas MCP server…");

  const transport = new StdioServerTransport();
  server.connect(transport).catch((err) => {
    console.error("MCP error:", err);
    process.exit(1);
  });

  console.error("✅ Canvas MCP server started—listening on STDIO");
  process.stdin.resume();
}

main().catch((err) => {
  console.error("Fatal error in MCP server:", err);
  process.exit(1);
});
