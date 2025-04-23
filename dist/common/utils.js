"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasAPIError = void 0;
class CanvasAPIError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "CanvasAPIError";
    }
}
exports.CanvasAPIError = CanvasAPIError;
