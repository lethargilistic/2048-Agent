// This code runs the simulation and sends the selected moves to the game
function AgentManager(gameManager) {
    this.gameManager = gameManager;
    this.agent = new Agent();
    this.moveCount = 0;
};

var findLargest = function (grid)
{
	var largestSquare = Number.MIN_VALUE;
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
					largestSquare = cells[row][col].value;
			}
		}
	}
	//console.log("LARGEST", largestSquare);
	return largestSquare;
}

AgentManager.prototype.selectMove = function () {
    // 0: up, 1: right, 2: down, 3: left
    //if (this.gameManager.over) setTimeout(this.gameManager.restart.bind(this.gameManager), 1000);
    //else
    //    if (!this.gameManager.move(this.agent.selectMove(this.gameManager))) console.log("bad move");

    // game over
    if (this.gameManager.over) {
		if (findLargest(this.gameManager.grid) === 2048)
			alert("You got " + String(findLargest(this.gameManager.grid)));
        console.log(this.gameManager.score + " in " + this.moveCount + " moves.");

        this.moveCount = 0;
        setTimeout(this.gameManager.restart.bind(this.gameManager), 1000);
    } else { // game ongoing
        if (this.gameManager.won && !this.gameManager.keepPlaying) {
            this.gameManager.keepplaying();
            this.selectMove();
            console.log("Game Won!");
        }
        else {
            if (!this.gameManager.move(this.agent.selectMove(this.gameManager))) console.log("bad move");
            else this.moveCount++;
        }
    }
};