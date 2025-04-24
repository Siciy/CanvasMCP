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
import { getCourseAssignments, GetCourseAssignmentsSchema, getAssignmentDetails, GetAssignmentDetailsSchema } from "./operations/assignments.js";
import { getCoursePages, GetCoursePagesSchema, getPageContent, GetPageContentSchema } from "./operations/pages.js";
import { getCourseFiles, GetCourseFilesSchema, getFolderFiles, GetFolderFilesSchema } from "./operations/files.js";
import { getCourseDiscussionTopics, GetCourseDiscussionTopicsSchema, getTopicEntries, GetTopicEntriesSchema } from "./operations/discussions.js";
import { getCourseStudents, GetCourseStudentsSchema } from "./operations/users.js";
import { getAssignmentSubmissions, GetAssignmentSubmissionsSchema } from "./operations/submissions.js";
import { getCourseQuizzes, GetCourseQuizzesSchema, getQuizSubmissions, GetQuizSubmissionsSchema } from "./operations/quizzes.js";
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
      {
        name: "get_course_assignments",
        description: "List all assignments in a course",
        inputSchema: zodToJsonSchema(GetCourseAssignmentsSchema)
      },
      {
        name: "get_assignment_details",
        description: "Get details for a specific assignment",
        inputSchema: zodToJsonSchema(GetAssignmentDetailsSchema)
      },
      {
        name: "get_course_pages",
        description: "List course pages",
        inputSchema: zodToJsonSchema(GetCoursePagesSchema)
      },
      {
        name: "get_page_content",
        description: "Get page content",
        inputSchema: zodToJsonSchema(GetPageContentSchema)
      },
      { name: "get_course_files",
        description: "List course files",
        inputSchema: zodToJsonSchema(GetCourseFilesSchema)
      },
      {
        name: "get_folder_files",
        description: "List folder files",
        inputSchema: zodToJsonSchema(GetFolderFilesSchema) 
      },
      { 
        name: "get_course_discussion_topics",
        description: "List discussion topics",
        inputSchema: zodToJsonSchema(GetCourseDiscussionTopicsSchema) 
      },
      { 
        name: "get_topic_entries",
        description: "Get discussion entries",
        inputSchema: zodToJsonSchema(GetTopicEntriesSchema) 
      },
      { 
        name: "get_course_students",
        description: "List students in course",
        inputSchema: zodToJsonSchema(GetCourseStudentsSchema) 
      },
      { 
        name: "get_assignment_submissions",
        description: "List assignment submissions",
        inputSchema: zodToJsonSchema(GetAssignmentSubmissionsSchema) 
      },
      { 
        name: "get_course_quizzes",
        description: "List course quizzes",
        inputSchema: zodToJsonSchema(GetCourseQuizzesSchema) 
      },
      { 
        name: "get_quiz_submissions",
        description: "List quiz submissions",
        inputSchema: zodToJsonSchema(GetQuizSubmissionsSchema) 
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: argsRaw } = req.params;
    const args = (argsRaw ?? {}) as Record<string, unknown>;

    let text: string;
    try {
      switch (name) {
        case "get_courses": {
          text = await getCourses(GetCoursesSchema.parse(args));
          break;
        }
        case "get_course_content": {
          text = await getCourseContent(GetCourseContentSchema.parse(args));
          break;
        }
        case "get_course_assignments": {
          text = await getCourseAssignments(GetCourseAssignmentsSchema.parse(args));
          break;
        }
        case "get_assignment_details": {
          text = await getAssignmentDetails(GetAssignmentDetailsSchema.parse(args));
          break;
        }
        case "get_course_pages": {
          text = await getCoursePages(GetCoursePagesSchema.parse(args));
          break;
        }
        case "get_page_content": {
          text = await getPageContent(GetPageContentSchema.parse(args));
          break;
        }
        case "get_course_files": {
          text = await getCourseFiles(GetCourseFilesSchema.parse(args));
          break;
        }
        case "get_folder_files": {
          text = await getFolderFiles(GetFolderFilesSchema.parse(args));
          break;
        }
        case "get_course_discussion_topics": {
          text = await getCourseDiscussionTopics(GetCourseDiscussionTopicsSchema.parse(args));
          break;
        }
        case "get_topic_entries": {
          text = await getTopicEntries(GetTopicEntriesSchema.parse(args));
          break;
        }
        case "get_course_students": {
          text = await getCourseStudents(GetCourseStudentsSchema.parse(args));
          break;
        }
        case "get_assignment_submissions": {
          text = await getAssignmentSubmissions(GetAssignmentSubmissionsSchema.parse(args));
          break;
        }
        case "get_course_quizzes": {
          text = await getCourseQuizzes(GetCourseQuizzesSchema.parse(args));
          break;
        }
        case "get_quiz_submissions": {
          text = await getQuizSubmissions(GetQuizSubmissionsSchema.parse(args));
          break;
        }
        default:
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
