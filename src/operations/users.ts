import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetCourseStudentsSchema = z.object({ course_id: z.number() });
export async function getCourseStudents(
  args: z.infer<typeof GetCourseStudentsSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/users?enrollment_type=student`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const students = await res.json();
  return JSON.stringify(students, null, 2);
}