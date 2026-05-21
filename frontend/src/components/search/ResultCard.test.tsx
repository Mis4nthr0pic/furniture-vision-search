import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { RankedProduct } from "../../types";
import { ResultCard } from "./ResultCard";

const product: RankedProduct = {
  id: "p1",
  title: "Minimalist Walnut Wide Bookshelf",
  description: "desc",
  category: "Bookshelves",
  type: "Wide Bookshelf",
  price: 899,
  width: 180,
  height: 200,
  depth: 40,
  attrs: { style: "Minimalist", material: "Walnut", color: "Espresso" },
  score: 0.842,
  rerankScore: 0.93,
  reason: "Strong visual match for shelf proportions and finish.",
  breakdown: { vec: 0.5, lex: 0.8, cat: 1, type: 1, color: 0, style: 0, mat: 0, dim: 0 },
  contributions: { vec: 0.1, lex: 0.16, cat: 0.15, type: 0.15, color: 0, style: 0, mat: 0, dim: 0 },
};

describe("ResultCard", () => {
  it("renders product details and reason", () => {
    render(<ResultCard rank={1} product={product} onRate={() => {}} />);

    expect(screen.getByText(/Minimalist Walnut Wide Bookshelf/i)).toBeInTheDocument();
    expect(screen.getByText(/Strong visual match/i)).toBeInTheDocument();
    expect(screen.getByText("$899")).toBeInTheDocument();
    expect(screen.getByText("0.93")).toBeInTheDocument();
    expect(screen.getByText("rerank")).toBeInTheDocument();
    expect(screen.getByText(/hybrid 0\.84/)).toBeInTheDocument();
  });

  it("calls onRate when relevance buttons are clicked", async () => {
    const user = userEvent.setup();
    const onRate = vi.fn();

    render(<ResultCard rank={1} product={product} onRate={onRate} />);

    await user.click(screen.getByRole("button", { name: "Relevant" }));
    expect(onRate).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button", { name: "Not relevant" }));
    expect(onRate).toHaveBeenCalledWith(false);
  });

  it("reveals secondary score breakdown when the gauge is clicked", async () => {
    const user = userEvent.setup();
    render(<ResultCard rank={1} product={product} onRate={() => {}} />);

    const toggle = screen.getByRole("button", { expanded: false });
    await user.click(toggle);

    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument();
    expect(screen.getByText(/raw vec/i)).toBeInTheDocument();
  });
});
