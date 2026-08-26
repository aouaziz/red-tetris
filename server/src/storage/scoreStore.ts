import fs from 'fs';
import path from 'path';

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  lines: number;
  mode: string;
  date: string;
}

export class ScoreStore {
  private filePath: string;
  private scores: ScoreEntry[] = [];
  private loaded = false;

  constructor(customFilePath?: string) {
    this.filePath =
      customFilePath ||
      path.join(process.cwd(), 'data', 'scores.json');
    this.loadSync();
  }

  private loadSync(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.scores = parsed;
        }
      }
    } catch {
      this.scores = [];
    }
    this.loaded = true;
  }

  getScores(limit = 10): ScoreEntry[] {
    if (!this.loaded) {
      this.loadSync();
    }
    return this.scores
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  recordScore(entry: Omit<ScoreEntry, 'id' | 'date'>): ScoreEntry {
    if (!this.loaded) {
      this.loadSync();
    }
    const newEntry: ScoreEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
    };

    this.scores.push(newEntry);
    this.scores.sort((a, b) => b.score - a.score);
    if (this.scores.length > 50) {
      this.scores = this.scores.slice(0, 50);
    }

    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.scores, null, 2), 'utf-8');
    } catch {
      // In-memory fallback if file system is read-only
    }

    return newEntry;
  }

  clear(): void {
    this.scores = [];
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch {
      // Ignore
    }
  }
}

export const defaultScoreStore = new ScoreStore();
