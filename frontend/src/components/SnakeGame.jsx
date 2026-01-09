import { useEffect, useRef, useState } from "react";

/* ================= DAILY HIGH SCORE ================= */
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getHighScore() {
  return Number(localStorage.getItem(`snake-highscore-${getTodayKey()}`)) || 0;
}

function saveHighScore(score) {
  localStorage.setItem(`snake-highscore-${getTodayKey()}`, score);
}

/* ================= GAME CONFIG ================= */
const GRID_SIZE = 15;
const SPEED = 140;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_DIR = { x: 0, y: -1 };

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(randomFood());
  const [dir, setDir] = useState(INITIAL_DIR);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getHighScore());

  const intervalRef = useRef(null);

  /* ================= FOOD ================= */
  function randomFood() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }

  /* ================= GAME LOOP ================= */
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = {
          x: head.x + dir.x,
          y: head.y + dir.y,
        };

        // WALL HIT
        if (
          newHead.x < 0 ||
          newHead.y < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y >= GRID_SIZE
        ) {
          gameOver();
          return prev;
        }

        // SELF HIT
        if (prev.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          gameOver();
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // EAT FOOD
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 1;
          setScore(newScore);

          if (newScore > highScore) {
            setHighScore(newScore);
            saveHighScore(newScore);
          }

          setFood(randomFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, SPEED);

    return () => clearInterval(intervalRef.current);
  }, [dir, running, food, score, highScore]);

  /* ================= CONTROLS ================= */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp" && dir.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && dir.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && dir.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && dir.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dir]);

  /* ================= GAME OVER ================= */
  function gameOver() {
    clearInterval(intervalRef.current);
    setRunning(false);
    alert(`Game Over 🐍\nScore: ${score}`);
  }

  function startGame() {
    setSnake(INITIAL_SNAKE);
    setFood(randomFood());
    setDir(INITIAL_DIR);
    setScore(0);
    setHighScore(getHighScore());
    setRunning(true);
  }

  /* ================= UI ================= */
  return (
    <div className="w-full flex flex-col items-center justify-center font-mono text-black">

      {/* HEADER */}
      <div className="w-[260px] flex justify-between text-xs mb-2">
        <span>Score: {score}</span>
        <span>High: {highScore}</span>
      </div>

      {/* SCREEN */}
      <div
        className="grid bg-[#9dbb61] border-[6px] border-[#4b5320]"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          width: 260,
          height: 260,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);

          const isSnake = snake.some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`border border-[#8aa34f]
                ${isSnake ? "bg-[#1b1b1b]" : ""}
                ${isFood ? "bg-red-600 rounded-full" : ""}`}
            />
          );
        })}
      </div>

      {/* CONTROLS */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div />
        <button onClick={() => setDir({ x: 0, y: -1 })}>⬆</button>
        <div />
        <button onClick={() => setDir({ x: -1, y: 0 })}>⬅</button>
        <button onClick={() => setDir({ x: 0, y: 1 })}>⬇</button>
        <button onClick={() => setDir({ x: 1, y: 0 })}>➡</button>
      </div>

      {/* START */}
      {!running && (
        <button
          onClick={startGame}
          className="mt-4 px-4 py-1 rounded bg-black text-[#9dbb61]"
        >
          START
        </button>
      )}
    </div>
  );
}
