# AI Maze Solver 🧠🚀

A web-based interactive maze solver powered by the **A* (A-Star) Search Algorithm**. Built entirely from scratch using Python (Flask) for the backend logic and vanilla HTML/CSS/JavaScript for the frontend UI and animations.

## 🎯 Features

* **Interactive Grid:** A 20x20 dynamic grid where users can draw walls, set a starting point, and define an end goal using the mouse.
* **Smart Pathfinding:** Implements the A* algorithm with Manhattan Distance heuristic to guarantee the shortest path.
* **Real-time Animation:** Visualizes the computed path step-by-step directly in the browser.
* **Random Maze Generation:** Features a dynamic slider to adjust wall density (0% to 100%) and instantly generates random obstacles.
* **No External AI Libraries:** The core search algorithm and priority queue (Min-Heap) are implemented using standard Python structures to demonstrate a deep understanding of data structures.

## 🛠️ Technologies Used

* **Backend:** Python 3, Flask, `heapq` (for Priority Queue).
* **Frontend:** HTML5, CSS3 (Modern Dashboard UI), Vanilla JavaScript (DOM manipulation and Fetch API).

## 🧠 How It Works (The Algorithm)

The backend utilizes the **A* Search Algorithm**, which finds the shortest path by evaluating nodes based on the formula: 
`f(n) = g(n) + h(n)`
* `g(n)`: The actual cost from the start node to the current node.
* `h(n)`: The estimated cost from the current node to the end node (calculated using **Manhattan Distance** since diagonal movement is not allowed).

The algorithm efficiently explores the grid and returns the optimal path as a JSON array of coordinates, which the frontend then animates.

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/kgamal001/AI-Maze-Solver..git](https://github.com/kgamal001/AI-Maze-Solver..git)
   cd AI-Maze-Solver
