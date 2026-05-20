from heapq import heappop, heappush

from flask import Flask, jsonify, render_template, request


app = Flask(__name__)


def manhattan(a, b):
	return abs(a[0] - b[0]) + abs(a[1] - b[1])


def reconstruct_path(came_from, current):
	path = [current]
	while current in came_from:
		current = came_from[current]
		path.append(current)
	path.reverse()
	return path


def astar(grid, start, end):
	if not grid or not grid[0]:
		return []

	rows = len(grid)
	cols = len(grid[0])

	def in_bounds(node):
		row, col = node
		return 0 <= row < rows and 0 <= col < cols

	if not in_bounds(start) or not in_bounds(end):
		return []

	if grid[start[0]][start[1]] == 1 or grid[end[0]][end[1]] == 1:
		return []

	open_heap = []
	heappush(open_heap, (manhattan(start, end), 0, start))

	came_from = {}
	g_score = {start: 0}
	closed = set()

	while open_heap:
		_, current_cost, current = heappop(open_heap)

		if current in closed:
			continue

		if current == end:
			return reconstruct_path(came_from, current)

		closed.add(current)

		row, col = current
		for neighbor in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
			nr, nc = neighbor
			if not in_bounds(neighbor):
				continue
			if grid[nr][nc] == 1:
				continue

			tentative_g = current_cost + 1
			if tentative_g < g_score.get(neighbor, float("inf")):
				came_from[neighbor] = current
				g_score[neighbor] = tentative_g
				f_score = tentative_g + manhattan(neighbor, end)
				heappush(open_heap, (f_score, tentative_g, neighbor))

	return []


@app.route("/")
def index():
	return render_template("index.html")


@app.route("/solve", methods=["POST"])
def solve():
	payload = request.get_json(silent=True) or {}
	grid = payload.get("grid")
	start = payload.get("start")
	end = payload.get("end")

	if not isinstance(grid, list) or not isinstance(start, list) or not isinstance(end, list):
		return jsonify({"error": "Invalid payload. Expected grid, start, and end."}), 400

	try:
		start_node = (int(start[0]), int(start[1]))
		end_node = (int(end[0]), int(end[1]))
		normalized_grid = [[int(cell) for cell in row] for row in grid]
	except (TypeError, ValueError, IndexError):
		return jsonify({"error": "Payload must contain numeric grid and coordinate values."}), 400

	path = astar(normalized_grid, start_node, end_node)
	return jsonify([[row, col] for row, col in path])


if __name__ == "__main__":
	app.run(debug=True)
