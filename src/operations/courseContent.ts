import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetCourseContentSchema = z.object({
  course_id: z.number(),
});

export async function getCourseContent(
  args: z.infer<typeof GetCourseContentSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) {
    throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");
  }

  const { course_id } = args;
  // Fetch modules with items included
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/modules?include[]=items`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new CanvasAPIError(res.status, body);
  }
  const modules = await res.json();
  return JSON.stringify(modules, null, 2);
}