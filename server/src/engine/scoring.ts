// Pure scoring calculations for Red Tetris
// Standard arcade scoring system:
// 1 Line: 100 pts
// 2 Lines: 300 pts
// 3 Lines: 500 pts
// 4 Lines (Tetris): 800 pts
// Soft drop: 1 pt per row
// Hard drop: 2 pts per row

export function calculateLineScore(cleared: number): number {
  switch (cleared) {
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      return cleared > 4 ? cleared * 200 : 0;
  }
}

export function calculateDropScore(type: 'soft' | 'hard', rows: number): number {
  if (rows <= 0) return 0;
  return type === 'soft' ? rows : rows * 2;
}
