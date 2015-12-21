// Constants
var PLY = 2
var INITIAL_DEPTH = 2 * PLY + 1; //Should be odd.
var NUMBER_OF_CHANCE_SQUARES = 5;
var PRAISE_MAX_CORNER = 99999;

// helper functions
function randomInt(n) {
    return Math.floor(Math.random() * n);
};

function AgentBrain(gameEngine) {
    this.size = 4;
    this.previousState = gameEngine.grid.serialize();
    this.reset();
    this.score = 0;
};

AgentBrain.prototype.reset = function () {
    this.score = 0;
    this.grid = new Grid(this.previousState.size, this.previousState.cells);
};

// Adds a tile in a random position
AgentBrain.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(), value);

        this.grid.insertTile(tile);
    }
};

AgentBrain.prototype.chooseExpectedTiles = function ()
{
	returnTiles = []
	if (this.grid.cellsAvailable())
	{
		twoCells = this.grid.availableCells();
		fourCells = this.grid.availableCells();
		numOfChoices = NUMBER_OF_CHANCE_SQUARES 
						>= twoCells.length ? 
							NUMBER_OF_CHANCE_SQUARES : twoCells.length;
		for (var i = 0; i < numOfChoices; i++)
		{
			var value = Math.random() < 0.9 ? 2 : 4;
			var cell = ""
			
			if (value == 2 && twoCells.length > 0)
			{
				//get random cell
				cell = twoCells[Math.floor(Math.random(twoCells.length))];
				//remove cell from the available cells
				twoCells.splice(twoCells.indexOf(cell), 1);
			}
			else if (fourCells.length > 0) //4
			{
				//get random cell
				cell = fourCells[Math.floor(Math.random(fourCells.length))];
				//remove cell from the available cells
				fourCells.splice(fourCells.indexOf(cell), 1);
			}
			else //All possible options have been checked.
			{
				break;
			}
			try
			{	
				returnTiles.push(new Tile(cell, value));
			}
			catch(e)
			{
				console.log("BOTH", cell);
				console.log(twoCells);
				console.log(fourCells);
			}
		}
	}
	return returnTiles;
}

AgentBrain.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
AgentBrain.prototype.move = function (direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this;

    var cell, tile;

    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;

    //console.log(vector);
	
    //console.log(traversals);

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = { x: x, y: y };
            tile = self.grid.cellContent(cell);

            if (tile) {
                var positions = self.findFarthestPosition(cell, vector);
                var next = self.grid.cellContent(positions.next);

                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    var merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);

                    // Converge the two tiles' positions
                    tile.updatePosition(positions.next);

                    // Update the score
                    self.score += merged.value;

                } else {
                    self.moveTile(tile, positions.farthest);
                }

                if (!self.positionsEqual(cell, tile)) {
                    moved = true; // The tile moved from its original cell!
                }
            }
        });
    });
    //console.log(moved);
    //if (moved) {
    //    this.addRandomTile();
    //}
    return moved;
};

// Get the vector representing the chosen direction
AgentBrain.prototype.getVector = function (direction) {
    // Vectors representing tile movement
    var map = {
        0: { x: 0, y: -1 }, // Up
        1: { x: 1, y: 0 },  // Right
        2: { x: 0, y: 1 },  // Down
        3: { x: -1, y: 0 }   // Left
    };

    return map[direction];
};

// Build a list of positions to traverse in the right order
AgentBrain.prototype.buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
};

AgentBrain.prototype.findFarthestPosition = function (cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
        previous = cell;
        cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) &&
             this.grid.cellAvailable(cell));

    return {
        farthest: previous,
        next: cell // Used to check if a merge is required
    };
};

AgentBrain.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
};

function Agent() {
};

var getLargest = function (grid)
{
	var largestSquare = Number.MIN_VALUE+1;
	var secondLargest = Number.MIN_VALUE
	cells = grid.serialize()["cells"];
	for (var row = 0; row < cells.length; row++)
	{
		////console.log("ROW", cells[row]);
		for (var col = 0; col < cells[row].length; col++)
		{
			if (cells[row][col] !== null)
			{
				////console.log("col", cells[row][col].value);
				if (cells[row][col].value > largestSquare)
				{
					secondLargest = largestSquare;
					largestSquare = cells[row][col].value;
				}
				else if (cells[row][col].value > secondLargest)
				{
					secondLargest = cells[row][col].value;
				}
			}
		}
	}
	//console.log("LARGEST", largestSquare);
	//console.log("EXAMPLES", largestSquare, secondLargest);
	//console.log({first: largestSquare, second: secondLargest});
	return {first: largestSquare, second: secondLargest};
}

var isLargestInCorner = function (firstLargest, secondLargest, grid)
{
	var cells = grid.serialize()["cells"];
	//console.log(largestSquare, cells[0][0]);
	var util = 0
	if (cells[3][0] && cells[3][0].value == firstLargest)
		//|| (cells[0][3] && cells[0][3].value == largestSquare)
		//|| (cells[3][0] && cells[3][0].value == largestSquare)
		//|| (cells[3][3] && cells[3][3].value == largestSquare))
		util += PRAISE_MAX_CORNER;
		if ((cells[2][0] && (cells[2][0].value == secondLargest
							|| cells[2][0].value == firstLargest))
				|| (cells[3][1] && (cells[3][1].value == secondLargest
							|| cells[3][1].value == firstLargest)))
			util += PRAISE_MAX_CORNER;
	return util;
}

var heuristic = function (brain)
{
	//console.log("HEURISTIC",brain.score, Math.log(brain.score));
	var largest = getLargest(brain.grid);
	//console.log(largest);
	//var scoreLog = Math.floor(Math.log(brain.score));
	var val = 0;
	//val += scoreLog > 0 ? scoreLog : 0;
	//val += Math.floor(largest.first / PLY);
    val += isLargestInCorner(largest.first, largest.second, brain.grid);
	val += (brain.grid.availableCells().length) * 2;
	//console.log(val);
	return val;
};

var findMax = function (arr)
{
	var max = Number.MIN_VALUE;
	for (var i = 1; i < arr.length; i++)
	{
		max = Math.max(arr[i-1], arr[i]);
	}
	
	return max;
};

var expectimax = function (brain, depth) 
{ 	
	//console.log("EXPECTIMAX", brain);
	//TODO: cellsAvailable ends when all cells have a square. Could still be mergeable squares.
	if (depth === 0 || !brain.grid.availableCells())
	{
		return heuristic(brain);
	}
	if (depth % 2 == 1) //Is MAX turn
	{
		//console.log("MAX", depth);
		var heuristicArray = [];
		for (var direction = 0; direction < 4; direction++)
		{
			var movedCopy = new AgentBrain(brain);
			if (movedCopy.move(direction)) //If it can move there, go down in tree.
			{
				//console.log("CAN MOVE", direction);
				heuristicArray.push(heuristic(brain) + expectimax(movedCopy, depth-1));
			}
			else
			{
				//Fill the place in the array to show we can't move that direction.
				//console.log("WILL NOT", direction);
				heuristicArray.push(Number.MIN_VALUE);
			}
			//console.log("ARRAY IN LOOP", heuristicArray);
		}
		
		var max = Math.max(...heuristicArray);
		
		if (depth == INITIAL_DEPTH)
		{
			//console.log(heuristicArray)
			return heuristicArray.indexOf(max);
		}
		else
			return max
	}
	else //CHANCE turn
	{
		//console.log("CHANCE", depth);
		//choose random space for there to be a block. 90% = 2, 10% = 4
		heuristicArray = [];
		//chosenTiles = brain.chooseExpectedTiles()
		chosenTiles = []
		for (var i = 0; i < NUMBER_OF_CHANCE_SQUARES; i++)
		{
			chosenTiles.push("");
		}
		for (var i = 0; i < chosenTiles.length; i++)
		{
			var brainWRandom = new AgentBrain(brain);
		
			//brainWRandom.grid.insertTile(chosenTiles[i])
			brainWRandom.addRandomTile();
			//console.log("AFTER ADD");
			heuristicArray[i] = heuristic(brain) + expectimax(brainWRandom, depth-1);
		}
		
		/*heuristicArray.splice(Math.min(...heuristicArray), 1);
		var secondWorst = Math.min(...heuristicArray)
		heuristicArray.splice(Math.min(...heuristicArray), 1);
		var secondBest = Math.min(...heuristicArray)
		return Math.random() < 0.5 ? secondWorst : secondBest; */
		return Math.min(...heuristicArray);
	}
};

Agent.prototype.selectMove = function (gameManager) {
    var brain = new AgentBrain(gameManager);

	//console.log("ENTERED")
    // Use the brain to simulate moves
    // brain.move(i) 
    // i = 0: up, 1: right, 2: down, 3: left
    // brain.reset() resets the brain to the current game board

	//Expectimax
	moving = expectimax(brain, INITIAL_DEPTH);
	//console.log("MOVING", moving)
	if (brain.move(moving))
	{
		//console.log("MOVED", moving)
		return moving;
	}
    //if (brain.move(0)) return 0;
    //if (brain.move(1)) return 1;
    //if (brain.move(3)) return 3;
    //if (brain.move(2)) return 2;
};

Agent.prototype.evaluateGrid = function (gameManager) {
    // calculate a score for the current grid configuration

};
