import { describe, expect, it } from "vitest";
import { BACKEND_OFFLINE_MESSAGE, isGatewayHtml } from "./api-errors";

describe("api-errors", () => {
  it("detects HTML gateway responses", () => {
    expect(isGatewayHtml("<!DOCTYPE html><html>")).toBe(true);
    expect(isGatewayHtml('{"ok":true}')).toBe(false);
  });

  it("includes health-check guidance in the offline message", () => {
    expect(BACKEND_OFFLINE_MESSAGE).toContain("/api/health");
    expect(BACKEND_OFFLINE_MESSAGE).toContain("ok");
  });
});
