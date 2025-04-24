import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetCourseDiscussionTopicsSchema = z.object({ course_id: z.number() });
export async function getCourseDiscussionTopics(
  args: z.infer<typeof GetCourseDiscussionTopicsSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/discussion_topics`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const topics = await res.json();
  return JSON.stringify(topics, null, 2);
}

export const GetTopicEntriesSchema = z.object({ course_id: z.number(), topic_id: z.number() });
export async function getTopicEntries(
  args: z.infer<typeof GetTopicEntriesSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id, topic_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/discussion_topics/${topic_id}/view`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new CanvasAPIError(res.status, await res.text());
  const entries = await res.json();
  return JSON.stringify(entries, null, 2);
}