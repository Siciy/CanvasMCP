import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetCourseFilesSchema = z.object({ course_id: z.number() });
export async function getCourseFiles(
  args: z.infer<typeof GetCourseFilesSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/files`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const files = await res.json();
  return JSON.stringify(files, null, 2);
}

export const GetFolderFilesSchema = z.object({ folder_id: z.number() });
export async function getFolderFiles(
  args: z.infer<typeof GetFolderFilesSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { folder_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/folders/${folder_id}/files`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const files = await res.json();
  return JSON.stringify(files, null, 2);
}