import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetCourseQuizzesSchema = z.object({ course_id: z.number() });
export async function getCourseQuizzes(
  args: z.infer<typeof GetCourseQuizzesSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/quizzes`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const quizzes = await res.json();
  return JSON.stringify(quizzes, null, 2);
}

export const GetQuizSubmissionsSchema = z.object({ course_id: z.number(), quiz_id: z.number() });
export async function getQuizSubmissions(
  args: z.infer<typeof GetQuizSubmissionsSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id, quiz_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/quizzes/${quiz_id}/submissions`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const subs = await res.json();
  return JSON.stringify(subs, null, 2);
}