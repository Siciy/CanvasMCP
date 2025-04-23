import fetch from "node-fetch";
import { z } from "zod";
import { CanvasAPIError } from "../common/utils";

interface Course {
  id: number;
  name: string;
  start_at: string | null;
  end_at: string | null;
  [key: string]: any;
}

interface CourseGroups {
  past: Course[];
  current: Course[];
  future: Course[];
  timestamp: string;
}

type Term = "Spring" | "Summer" | "Fall";

function getTermNumber(term: Term): number {
  switch (term) {
    case "Spring": return 0;
    case "Summer": return 1;
    case "Fall": return 2;
  }
}

function compareSemesters(year1: number, term1: Term, year2: number, term2: Term): number {
  if (year1 !== year2) {
    return year1 - year2;
  }
  return getTermNumber(term1) - getTermNumber(term2);
}

export const GetCoursesSchema = z.object({});

export async function getCourses(
  args: z.infer<typeof GetCoursesSchema>
): Promise<string> {
  const base = process.env.CANVAS_BASE_URL;
  const token = process.env.CANVAS_ACCESS_TOKEN;
  if (!base || !token)
    throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");

  const url = `${base.replace(/\/$/, "")}/api/v1/courses`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text();
    throw new CanvasAPIError(res.status, body);
  }

  const courses = await res.json() as Course[];
  const now = new Date();

  // Determine current term
  const currentMonth = now.getMonth();
  let currentTerm: Term;
  if (currentMonth >= 0 && currentMonth < 5) { // January to May
    currentTerm = "Spring";
  } else if (currentMonth >= 5 && currentMonth < 8) { // June to August
    currentTerm = "Summer";
  } else { // September to December
    currentTerm = "Fall";
  }
  const currentYear = now.getFullYear();

  // Group courses by their status
  const result: CourseGroups = {
    past: [],
    current: [],
    future: [],
    timestamp: now.toISOString()
  };

  for (const course of courses) {
    const termYear = course.name.match(/\((Spring|Summer|Fall)\s+(\d{4})\)/);

    if (!termYear) {
      // If we can't determine the term/year, use start_at date if available
      if (course.start_at) {
        const startDate = new Date(course.start_at);
        if (startDate < now) {
          result.past.push(course);
        } else if (startDate > now) {
          result.future.push(course);
        } else {
          result.current.push(course);
        }
      } else {
        // If no date information available, assume current
        result.current.push(course);
      }
      continue;
    }

    const [_, courseTerm, yearStr] = termYear;
    const courseYear = parseInt(yearStr);
    const comparison = compareSemesters(courseYear, courseTerm as Term, currentYear, currentTerm);

    if (comparison < 0) {
      result.past.push(course);
    } else if (comparison > 0) {
      result.future.push(course);
    } else {
      result.current.push(course);
    }
  }

  return JSON.stringify(result, null, 2);
}