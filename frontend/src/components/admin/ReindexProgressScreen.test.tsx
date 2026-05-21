import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReindexProgressScreen } from "./ReindexProgressScreen";

describe("ReindexProgressScreen", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ReindexProgressScreen
        open={false}
        progress={null}
        running={false}
        error={null}
        onDismiss={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows progress details while running", () => {
    render(
      <ReindexProgressScreen
        open
        running
        error={null}
        onDismiss={() => {}}
        progress={{ phase: "embedding", current: 500, total: 2500 }}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Building vector index/i)).toBeInTheDocument();
    expect(screen.getByText(/batch 500 \/ 2,500/i)).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("shows error state with close button", () => {
    const onDismiss = vi.fn();
    render(
      <ReindexProgressScreen
        open
        running={false}
        error="API key invalid"
        onDismiss={onDismiss}
        progress={{ phase: "error", current: 0, total: 2500, message: "API key invalid" }}
      />,
    );

    expect(screen.getByText(/Reindex failed/i)).toBeInTheDocument();
    expect(screen.getByText("API key invalid")).toBeInTheDocument();
  });
});
