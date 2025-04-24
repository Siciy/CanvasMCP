import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils.js";

export const GetCourseAssignmentsSchema = z.object({
  course_id: z.number(),
});

export async function getCourseAssignments(
  args: z.infer<typeof GetCourseAssignmentsSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/assignments`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text();
    throw new CanvasAPIError(res.status, body);
  }
  const assignments = await res.json();
  return JSON.stringify(assignments, null, 2);
}

export const GetAssignmentDetailsSchema = z.object({
  course_id: z.number(),
  assignment_id: z.number(),
});

export async function getAssignmentDetails(
  args: z.infer<typeof GetAssignmentDetailsSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token) throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const { course_id, assignment_id } = args;
  const url = `${base.replace(/\/$/, "")}/api/v1/courses/${course_id}/assignments/${assignment_id}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text();
    throw new CanvasAPIError(res.status, body);
  }
  const details = await res.json();
  return JSON.stringify(details, null, 2);
}