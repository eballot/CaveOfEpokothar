var PathFinder = {
	// in map: the MapLevel object
	//    start: the start point (x,y coordinates)
	//    target: the destination point (x,y coordinates)
	// Returns a stack of tile coordinates containing the path to the target tile (includes start and target tiles)
	find: function(map, start, target) {
		var result, cols, rows, i, j, maxDistance, startId, length, distance, bestDistance, bestCandidateIdx, visitList, candidateTiles, adjTilesList, currentTile, adjacentTile;
		visitList = {};
		result = null; 
		cols = map.map.tiles[0].length;
		rows = map.map.tiles.length;
		maxDistance = cols * rows;
		target.id = target.x + target.y * cols;
		startId = start.x + start.y * cols;
		visitList[startId] = 1; // start position automatically in the list
		candidateTiles = [{
			id: startId,
			x: start.x,
			y: start.y,
			distanceFrom: 0,
			distanceTotal: 0 // initial distance doesn't matter
		}];

		length = candidateTiles.length;
		do {
			bestDistance = maxDistance;
			bestCandidateIdx = 0;
			// Find which tile of the remaining candidate list is closest to the target
			// TODO: would it be faster to sort the candidateTiles list
			for (i = 0; i < length; ++i) {
				distance = candidateTiles[i].distanceTotal;
				if (distance < bestDistance) {
					bestDistance = distance;
					bestCandidateIdx = i;
				}
			}
			
			currentTile = candidateTiles.splice(bestCandidateIdx, 1)[0];
			if (currentTile.id === target.id) {
				// Found the target. Create the stack of tiles representing the path and break out of this loop
				result = [];
				while (currentTile) {
//					map.ctx.fillStyle = "rgba(0,0,80,0.4)";
//					map.ctx.fillRect((currentTile.x*MapLevel.kTileSize), (currentTile.y*MapLevel.kTileSize), MapLevel.kTileSize, MapLevel.kTileSize);
					result.push(currentTile);
					currentTile = currentTile.prev;
				}
				break;
			} else {
//				map.ctx.fillStyle = "rgba(80,0,0,0.4)";
//				map.ctx.fillRect((currentTile.x*MapLevel.kTileSize), (currentTile.y*MapLevel.kTileSize), MapLevel.kTileSize, MapLevel.kTileSize);
				adjTilesList = PathFinder._adjacentTiles(currentTile.x, currentTile.y, map, rows, cols);
				length = adjTilesList.length;
				for (i = 0, j = length; i < j; ++i) {
					adjacentTile = adjTilesList[i];
					adjacentTile.id = adjacentTile.x + adjacentTile.y * cols;
					if (!(adjacentTile.id in visitList)) {
						visitList[adjacentTile.id] = 1;

						adjacentTile.prev = currentTile;
						adjacentTile.distanceFrom = currentTile.distanceFrom + PathFinder._distanceTo(adjacentTile, currentTile);
						adjacentTile.distanceTotal = adjacentTile.distanceFrom + PathFinder._distanceTo(adjacentTile, target);
						candidateTiles.push(adjacentTile);
					}
				}
			}
			length = candidateTiles.length;
		} while (length > 0);
		
		return result;
	},
		
	// The straight-line distance (i.e., the hypotenuse).
	_distanceTo: function(start, end) {
		return  Math.floor(Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2)));
	},

	_adjacentTiles: function(x, y, map, rows, cols) {
		var result, northY, southY, eastX, westX;
		result = [];
		northY = y - 1;
		southY = y + 1;
		eastX = x + 1;
		westX = x - 1;
		
		// Note: the map always has wall tiles on the edge so don't need to push column or row 0
		if (northY > 0 && !map.isBlocked(x, northY)) {
			result.push({x: x, y: northY});
		}
		if (southY < rows && !map.isBlocked(x, southY)) {
			result.push({x: x, y: southY});
		}
		if (eastX < cols) {
			if (!map.isBlocked(eastX, y)) {
				result.push({x: eastX, y: y});
			}
			// Diagonal tiles
			if (northY > 0 && !map.isBlocked(eastX, northY)) {
				result.push({x: eastX, y: northY});
			}
			if (southY < rows && !map.isBlocked(eastX, southY)) {
				result.push({x: eastX, y: southY});
			}
		}
		if (westX > 0) {
			if (!map.isBlocked(westX, y)) {
				result.push({x: westX, y: y});
			}
			// Diagonal tiles
			if (northY > 0 && !map.isBlocked(westX, northY)) {
				result.push({x: westX, y: northY});
			}
			if (southY < rows && !map.isBlocked(westX, southY)) {
				result.push({x: westX, y: southY});
			}
		}
		
		return result;
	}
};
