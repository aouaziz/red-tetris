import React from "react";
import { Board as BoardType } from "../hooks/useGame";

interface BoardProps {
  board: BoardType;
}

const CELL_CLASS: Record<string, string> = {
  "0": "cell-empty",
  I: "cell-I",
  O: "cell-O",
  T: "cell-T",
  S: "cell-S",
  Z: "cell-Z",
  J: "cell-J",
  L: "cell-L",
  G: "cell-G",
};

const Board: React.FC<BoardProps> = ({ board }) => (
  <div className="board">
    {board.map((row, y) =>
      row.map((cell, x) => (
        <div
          key={`${y}-${x}`}
          className={`cell ${CELL_CLASS[String(cell)] ?? "cell-empty"}`}
        />
      )),
    )}
  </div>
);

export default Board;
