import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ScoreStore } from "../../server/src/storage/scoreStore";
import fs from "fs";
import path from "path";

describe("ScoreStore", () => {
  const testFile = path.join(process.cwd(), "data", "test-scores.json");

  beforeEach(() => {
    try {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    } catch {
      // Ignore
    }
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    } catch {
      // Ignore
    }
  });

  it("starts empty when file does not exist", () => {
    const store = new ScoreStore(testFile);
    expect(store.getScores()).toEqual([]);
  });

  it("records scores and sorts them in descending order", () => {
    const store = new ScoreStore(testFile);
    store.recordScore({ name: "Alice", score: 500, lines: 2, mode: "classic" });
    store.recordScore({ name: "Bob", score: 1200, lines: 4, mode: "speed" });
    store.recordScore({ name: "Charlie", score: 800, lines: 3, mode: "invisible" });

    const scores = store.getScores();
    expect(scores.length).toBe(3);
    expect(scores[0].name).toBe("Bob");
    expect(scores[0].score).toBe(1200);
    expect(scores[1].name).toBe("Charlie");
    expect(scores[2].name).toBe("Alice");
  });

  it("persists scores across new instances of ScoreStore", () => {
    const store1 = new ScoreStore(testFile);
    store1.recordScore({ name: "Alice", score: 900, lines: 3, mode: "classic" });

    const store2 = new ScoreStore(testFile);
    const scores = store2.getScores();
    expect(scores.length).toBe(1);
    expect(scores[0].name).toBe("Alice");
    expect(scores[0].score).toBe(900);
  });

  it("respects the limit argument", () => {
    const store = new ScoreStore(testFile);
    for (let i = 1; i <= 15; i++) {
      store.recordScore({ name: `Player ${i}`, score: i * 100, lines: i, mode: "classic" });
    }

    const top5 = store.getScores(5);
    expect(top5.length).toBe(5);
    expect(top5[0].score).toBe(1500);
    expect(top5[4].score).toBe(1100);
  });

  it("handles corrupted or invalid JSON file gracefully", () => {
    const dir = path.dirname(testFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(testFile, "{ invalid json content ]", "utf-8");

    const store = new ScoreStore(testFile);
    expect(store.getScores()).toEqual([]);
  });

  it("clears scores correctly", () => {
    const store = new ScoreStore(testFile);
    store.recordScore({ name: "Alice", score: 500, lines: 2, mode: "classic" });
    expect(store.getScores().length).toBe(1);

    store.clear();
    expect(store.getScores()).toEqual([]);
  });
});
