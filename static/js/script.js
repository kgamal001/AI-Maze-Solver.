const GRID_SIZE = 20;
const PATH_DELAY_MS = 35;

const gridElement = document.getElementById("grid");
const statusBox = document.getElementById("statusBox");
const solveBtn = document.getElementById("solveBtn");
const clearGridBtn = document.getElementById("clearGridBtn");
const randomMazeBtn = document.getElementById("randomMazeBtn");
const modeGroup = document.getElementById("modeGroup");
const wallDensitySlider = document.getElementById("wallDensitySlider");
const wallDensityLabel = document.getElementById("wallDensityLabel");

let grid = [];
let cells = [];
let currentMode = "start";
let start = [0, 0];
let end = [GRID_SIZE - 1, GRID_SIZE - 1];
let isMouseDown = false;
let isAnimating = false;

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function setStatus(message) {
  statusBox.textContent = message;
}

function coordinatesMatch(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

function applyCellClasses(row, col) {
  const cell = cells[row][col];
  cell.className = "cell";

  if (coordinatesMatch([row, col], start)) {
    cell.classList.add("start");
    return;
  }

  if (coordinatesMatch([row, col], end)) {
    cell.classList.add("end");
    return;
  }

  if (grid[row][col] === 1) {
    cell.classList.add("wall");
  }
}

function renderGrid() {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      applyCellClasses(row, col);
    }
  }
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll(".mode-option").forEach((option) => {
    option.classList.toggle(
      "active",
      option.querySelector("input").value === mode,
    );
  });
}

function clearPathVisuals() {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const cell = cells[row][col];
      cell.classList.remove("path");
    }
  }
}

function resetGrid(keepStartEnd = true) {
  grid = createEmptyGrid();
  if (!keepStartEnd) {
    start = [0, 0];
    end = [GRID_SIZE - 1, GRID_SIZE - 1];
  }
  clearPathVisuals();
  renderGrid();
}

function placeStart(row, col) {
  if (coordinatesMatch([row, col], end)) {
    setStatus("Start and end cannot occupy the same cell.");
    return;
  }

  start = [row, col];
  grid[row][col] = 0;
  clearPathVisuals();
  renderGrid();
  setStatus(`Start placed at (${row}, ${col}).`);
}

function placeEnd(row, col) {
  if (coordinatesMatch([row, col], start)) {
    setStatus("Start and end cannot occupy the same cell.");
    return;
  }

  end = [row, col];
  grid[row][col] = 0;
  clearPathVisuals();
  renderGrid();
  setStatus(`End placed at (${row}, ${col}).`);
}

function toggleWall(row, col) {
  if (
    coordinatesMatch([row, col], start) ||
    coordinatesMatch([row, col], end)
  ) {
    return;
  }

  grid[row][col] = 1;
  cells[row][col].classList.add("wall");
}

function handleCellAction(row, col) {
  if (isAnimating) {
    return;
  }

  if (currentMode === "start") {
    placeStart(row, col);
  } else if (currentMode === "end") {
    placeEnd(row, col);
  } else {
    toggleWall(row, col);
  }
}

function createGrid() {
  gridElement.innerHTML = "";
  cells = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    const rowCells = [];

    for (let col = 0; col < GRID_SIZE; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);

      cell.addEventListener("mousedown", () => {
        isMouseDown = true;
        handleCellAction(row, col);
      });

      cell.addEventListener("mouseenter", () => {
        if (isMouseDown && currentMode === "wall") {
          toggleWall(row, col);
        }
      });

      gridElement.appendChild(cell);
      rowCells.push(cell);
    }

    cells.push(rowCells);
  }

  document.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  renderGrid();
}

function generateRandomMaze() {
  if (isAnimating) {
    return;
  }

  const wallDensityPercent = Number(wallDensitySlider.value);
  const wallProbability = wallDensityPercent / 100;

  clearPathVisuals();
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const isStart = coordinatesMatch([row, col], start);
      const isEnd = coordinatesMatch([row, col], end);
      grid[row][col] =
        isStart || isEnd ? 0 : Math.random() < wallProbability ? 1 : 0;
    }
  }

  renderGrid();
  setStatus(
    `Random maze generated with approximately ${wallDensityPercent}% walls.`,
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animatePath(path) {
  isAnimating = true;
  solveBtn.disabled = true;
  clearGridBtn.disabled = true;
  randomMazeBtn.disabled = true;

  clearPathVisuals();

  for (const [row, col] of path) {
    if (
      coordinatesMatch([row, col], start) ||
      coordinatesMatch([row, col], end)
    ) {
      continue;
    }

    cells[row][col].classList.add("path");
    await sleep(PATH_DELAY_MS);
  }

  isAnimating = false;
  solveBtn.disabled = false;
  clearGridBtn.disabled = false;
  randomMazeBtn.disabled = false;
}

async function solveMaze() {
  if (isAnimating) {
    return;
  }

  setStatus("Solving maze with A*...");
  solveBtn.disabled = true;

  try {
    const response = await fetch("/solve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grid,
        start,
        end,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to solve maze.");
    }

    const path = Array.isArray(data) ? data : data.path || [];

    if (path.length === 0) {
      setStatus("No path found. Adjust the walls and try again.");
    } else {
      setStatus(`Path found with ${path.length} steps. Animating solution...`);
      await animatePath(path);
      setStatus(`Solved! Shortest path contains ${path.length} cells.`);
    }
  } catch (error) {
    setStatus(error.message);
  } finally {
    solveBtn.disabled = false;
  }
}

modeGroup.addEventListener("change", (event) => {
  if (event.target && event.target.name === "mode") {
    setMode(event.target.value);
  }
});

wallDensitySlider.addEventListener("input", () => {
  wallDensityLabel.textContent = `Wall Density: ${wallDensitySlider.value}%`;
});

clearGridBtn.addEventListener("click", () => {
  if (isAnimating) {
    return;
  }

  grid = createEmptyGrid();
  clearPathVisuals();
  renderGrid();
  setStatus("Grid cleared. Start and end points preserved.");
});

randomMazeBtn.addEventListener("click", generateRandomMaze);
solveBtn.addEventListener("click", solveMaze);

window.addEventListener("contextmenu", (event) => event.preventDefault());

grid = createEmptyGrid();
createGrid();
setMode("start");
renderGrid();
