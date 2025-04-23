import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils";

export const GetCoursesSchema = z.object({});

export async function getCourses(
  args: z.infer<typeof GetCoursesSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token)
    throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");
  const url = `${base.replace(/\/$/, "")}/api/v1/courses` ;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text();
    throw new CanvasAPIError(res.status, body);
  }
  const data = await res.json();
  return JSON.stringify(data, null, 2);
}
