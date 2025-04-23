"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCoursesSchema = void 0;
exports.getCourses = getCourses;
const node_fetch_1 = __importDefault(require("node-fetch"));
const zod_1 = require("zod");
const utils_1 = require("../common/utils");
exports.GetCoursesSchema = zod_1.z.object({});
async function getCourses(args) {
    const base = process.env.CANVAS_BASE_URL;
    const token = process.env.CANVAS_ACCESS_TOKEN;
    if (!base || !token)
        throw new Error("Missing CANVAS_BASE_URL or CANVAS_ACCESS_TOKEN");
    const url = `${base.replace(/\/$/, "")}/api/v1/courses`;
    const res = await (0, node_fetch_1.default)(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        const body = await res.text();
        throw new utils_1.CanvasAPIError(res.status, body);
    }
    const data = await res.json();
    return JSON.stringify(data, null, 2);
}
