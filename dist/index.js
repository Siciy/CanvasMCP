#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const zod_1 = require("zod");
const courses_js_1 = require("./operations/courses.js");
const utils_js_1 = require("./common/utils.js");
async function main() {
    const server = new index_js_1.Server({ name: "canvas-mcp-server", version: "0.1.0" }, { capabilities: { tools: {} } });
    // Advertise our tool in ListTools
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
        tools: [
            {
                name: "get_courses",
                description: "List all courses for the current user",
                inputSchema: (0, zod_to_json_schema_1.zodToJsonSchema)(courses_js_1.GetCoursesSchema),
            },
        ],
    }));
    // Handle invocations; ALWAYS return { content: [...] }
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (req) => {
        const { name, arguments: argsRaw } = req.params;
        const args = (argsRaw ?? {});
        let text;
        try {
            if (name !== "get_courses") {
                throw new Error(`Unknown tool: ${name}`);
            }
            // validate
            courses_js_1.GetCoursesSchema.parse(args);
            // run your logic
            text = await (0, courses_js_1.getCourses)(args);
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
                text = `Invalid input: ${JSON.stringify(err.errors)}`;
            }
            else if (err instanceof utils_js_1.CanvasAPIError) {
                text = `Canvas API Error (${err.status}): ${err.message}`;
            }
            else if (err instanceof Error) {
                text = `Error: ${err.message}`;
            }
            else {
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
    const transport = new stdio_js_1.StdioServerTransport();
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
