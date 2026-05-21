import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WarningsBanner } from "./WarningsBanner";

describe("WarningsBanner", () => {
  it("renders nothing when there are no warnings", () => {
    const { container } = render(<WarningsBanner warnings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders warnings and rerank errors", () => {
    render(
      <WarningsBanner
        warnings={["embeddings unavailable, using lexical fallback"]}
        rerankError="parse failed"
      />,
    );

    expect(screen.getByText(/Pipeline notices/i)).toBeInTheDocument();
    expect(screen.getByText(/embeddings unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Rerank error: parse failed/i)).toBeInTheDocument();
  });
});
