import { describe, expect, it } from "vitest";
import { BACKEND_OFFLINE_MESSAGE, isGatewayHtml, isNetworkFetchError } from "./api-errors";

describe("api-errors", () => {
  it("detects HTML gateway responses", () => {
    expect(isGatewayHtml("<!DOCTYPE html><html>")).toBe(true);
    expect(isGatewayHtml('{"ok":true}')).toBe(false);
  });

  it("includes health-check guidance in the offline message", () => {
    expect(BACKEND_OFFLINE_MESSAGE).toContain("/api/health");
    expect(BACKEND_OFFLINE_MESSAGE).toContain("docker compose up");
  });

  it("detects browser network fetch failures", () => {
    expect(isNetworkFetchError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkFetchError(new Error("Request failed (502)"))).toBe(false);
  });
});
