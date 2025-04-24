import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetAssignmentSubmissionsSchema = z.object({
  course_id: z.number(),
  assignment_id: z.number(),
  user_id: z.number().optional(),
});
export async function getAssignmentSubmissions(
  args: z.infer<typeof GetAssignmentSubmissionsSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id, assignment_id, user_id } = args;
  let url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/assignments/${assignment_id}/submissions`;
  if (user_id) url += `?student_ids[]=${user_id}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const subs = await res.json();
  return JSON.stringify(subs, null, 2);
}