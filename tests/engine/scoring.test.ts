import { describe, it, expect } from "vitest";
import { calculateLineScore, calculateDropScore } from "../../server/src/engine/scoring";

describe("scoring engine", () => {
  describe("calculateLineScore()", () => {
    it("returns 0 for 0 lines cleared", () => {
      expect(calculateLineScore(0)).toBe(0);
    });

    it("returns 100 for 1 line (Single)", () => {
      expect(calculateLineScore(1)).toBe(100);
    });

    it("returns 300 for 2 lines (Double)", () => {
      expect(calculateLineScore(2)).toBe(300);
    });

    it("returns 500 for 3 lines (Triple)", () => {
      expect(calculateLineScore(3)).toBe(500);
    });

    it("returns 800 for 4 lines (Tetris)", () => {
      expect(calculateLineScore(4)).toBe(800);
    });

    it("handles more than 4 lines cleanly", () => {
      expect(calculateLineScore(5)).toBe(1000);
    });
  });

  describe("calculateDropScore()", () => {
    it("returns 0 when rows is 0 or negative", () => {
      expect(calculateDropScore("soft", 0)).toBe(0);
      expect(calculateDropScore("soft", -2)).toBe(0);
      expect(calculateDropScore("hard", 0)).toBe(0);
      expect(calculateDropScore("hard", -1)).toBe(0);
    });

    it("returns 1 pt per row for soft drop", () => {
      expect(calculateDropScore("soft", 1)).toBe(1);
      expect(calculateDropScore("soft", 4)).toBe(4);
    });

    it("returns 2 pts per row for hard drop", () => {
      expect(calculateDropScore("hard", 1)).toBe(2);
      expect(calculateDropScore("hard", 6)).toBe(12);
    });
  });
});
