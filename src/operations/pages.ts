import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetCoursePagesSchema = z.object({ course_id: z.number() });
export async function getCoursePages(
  args: z.infer<typeof GetCoursePagesSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/pages`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const pages = await res.json();
  return JSON.stringify(pages, null, 2);
}

export const GetPageContentSchema = z.object({ course_id: z.number(), page_url: z.string() });
export async function getPageContent(
  args: z.infer<typeof GetPageContentSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id, page_url } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/pages/${encodeURIComponent(page_url)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const content = await res.json();
  return JSON.stringify(content, null, 2);
}