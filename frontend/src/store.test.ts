import { describe, expect, it, beforeEach } from "vitest";
import { useStore } from "./store";

describe("useStore", () => {
  beforeEach(() => {
    useStore.setState({ apiKey: "" });
  });

  it("stores api key in memory", () => {
    useStore.getState().setApiKey("sk-test-key");
    expect(useStore.getState().apiKey).toBe("sk-test-key");
  });
});
