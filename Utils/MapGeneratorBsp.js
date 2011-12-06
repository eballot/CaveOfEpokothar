

var MapGeneratorBsp = {
	kMinRoomWidth: 9*2,
	kMinRoomHeight: 9*2,

	/*
	 * Returns and object with the following properties:
	 *  "rooms" - an array of rooms (top-left and bottom-right coordinates)
	 *  "corridors" - an array of corridors that connect the rooms (start and end coordinates)
	 *  "up" - the coordinates of the stairs leading up
	 *  "down" - the coordinates of the stairs leading down
	 */
	generateMap: function(width, height) {
		var i, x, y, tiles, results, dungeon, room;
		tiles = new Array(width);
		for (x = 0; x < width; x++) {
			tiles[x] = new Array(height);
			for (y = 0; y < height; y++) {
				tiles[x][y] = {base:MapTile.wall};
			}
		}

		results = {
			tiles: tiles,
			rooms: [],
			corridors: []
		};
		
		dungeon = {
			top: 0,
			left: 0,
			width: width,
			height: height
		};
		this._generateMapInternal(dungeon, results);
		
		i = Math.floor(Math.random()*results.rooms.length);
		room = results.rooms[i];
		results.up = {
			x: room.x + Math.floor(room.w/2),
			y: room.y + Math.floor(room.h/2)
		};
		i = Math.floor(Math.random()*results.rooms.length);
		room = results.rooms[i];
		results.down = {
			x: room.x + Math.floor(room.w/2) + 1,
			y: room.y + Math.floor(room.h/2)
		};
		results.tiles[results.up.x][results.up.y] = {base:MapTile.stairsUp};
		results.tiles[results.down.x][results.down.y] = {base:MapTile.stairsDown};
		
		return results;
	},

	_generateMapInternal: function(dungeon, results) {
		var x, y, randModifier, topMod, heightMod, leftMod, widthMod, room;
		// Stop splitting once the dungeon size gets small enough to be a single room
		if (Math.random() < 0.5 && dungeon.width > MapGeneratorBsp.kMinRoomWidth) {
			MapGeneratorBsp._splitHoriz(dungeon, results);
		} else if (dungeon.height > MapGeneratorBsp.kMinRoomHeight) {
			MapGeneratorBsp._splitVert(dungeon, results);
		} else if (dungeon.width > MapGeneratorBsp.kMinRoomWidth) {
			MapGeneratorBsp._splitHoriz(dungeon, results);
		} else {
			dungeon.isNode = true;
			
			// Make sure the random values can't be large enough to give the room no size.
			// The following ensures a room will be at least 3x3 tiles
			randModifier = (dungeon.height > 9) ? 3 : (dungeon.height - 3) / 2;
			topMod = Math.ceil(Math.random() * randModifier);
			heightMod = Math.ceil(Math.random() * randModifier);

			randModifier = (dungeon.width > 9) ? 3 : (dungeon.width - 3) / 2;
			leftMod = Math.ceil(Math.random() * randModifier);
			widthMod = Math.ceil(Math.random() * randModifier);
			room = {
				x: dungeon.left + leftMod,
				y: dungeon.top + topMod,
				w: dungeon.width - leftMod - widthMod,
				h: dungeon.height - topMod - heightMod
			};
			
			for (x=0; x < room.w; x++) {
				for (y=0; y < room.h; y++) {
					results.tiles[x + room.x][y + room.y] = {base:MapTile.floor};
				}
			}
			results.rooms.push(room);
		}
	},

	_splitHoriz: function(dungeon, results) {
		var x, ld, rd;
		// split between 25-75%
		x = Math.floor(((Math.random() / 2) + 0.25) * dungeon.width);
		ld = {
			top: dungeon.top,
			left: dungeon.left,
			width: x,
			height: dungeon.height
		};
		rd = {
			top: dungeon.top,
			left: dungeon.left + x,
			width: dungeon.width - x,
			height: dungeon.height
		};
		dungeon.children = [ld, rd];
		MapGeneratorBsp._generateMapInternal(ld, results);
		MapGeneratorBsp._generateMapInternal(rd, results);
		
		// Connect with a corridor.
		if (!this._buildCorridorHoriz(x, dungeon, results, 0)) {
			if (!this._buildCorridorHoriz(x, dungeon, results, -1)) {
				if (!this._buildCorridorHoriz(x, dungeon, results, 1)) {
				}
			}
		}
	},
	
	_buildCorridorHoriz: function(x, dungeon, results, offsetY) {
		var corridorMade = false, startX, endX, midpointY;
		startX = endX = dungeon.left + x;
		midpointY = dungeon.top + offsetY + Math.round(dungeon.height/2);
		while (startX > dungeon.left && results.tiles[startX][midpointY].base === MapTile.wall) {
			--startX;
		}
		if (startX > dungeon.left) {
			++startX; // bump so it doesn't start in the room
			while (endX < (dungeon.left + dungeon.width) && results.tiles[endX][midpointY].base === MapTile.wall) {
				++endX;
			}
			
			if (endX < (dungeon.left + dungeon.width)) {
				--endX; // bump so it doesn't end in the room
				results.corridors.push({ startX:startX, startY:midpointY, endX:endX, endY:midpointY });
				corridorMade = true;
				for (x=startX; x <= endX; x++) {
					results.tiles[x][midpointY] = {base:MapTile.floor};
				}
			}
		}
		
		if (!corridorMade) {
			console.log("Failed to make horizontal corridor. startX="+startX+" endX="+endX+" y="+midpointY);
		}
		
		return corridorMade;
	},

	_splitVert: function(dungeon, results) {
		var y, td, bd;
		// split between 25-75%
		y = Math.floor(((Math.random() / 2) + 0.25) * dungeon.height);
		td = {
			top: dungeon.top,
			left: dungeon.left,
			width: dungeon.width,
			height: y
		};
		bd = {
			top: dungeon.top + y,
			left: dungeon.left,
			width: dungeon.width,
			height: dungeon.height - y
		};
		
		dungeon.children = [td, bd];
		MapGeneratorBsp._generateMapInternal(td, results);
		MapGeneratorBsp._generateMapInternal(bd, results);
		
		// Connect with a corridor.
		if (!this._buildCorridorVert(y, dungeon, results, 0)) {
			if (!this._buildCorridorVert(y, dungeon, results, -1)) {
				if (!this._buildCorridorVert(y, dungeon, results, 1)) {
				}
			}
		}
	},
	
	_buildCorridorVert: function(y, dungeon, results, offsetX) {
		var corridorMade = false, startY, endY, midpointX, addDoor;
		midpointX = dungeon.left + offsetX + Math.round(dungeon.width/2);
		startY = endY = dungeon.top + y;
		while (startY > dungeon.top && results.tiles[midpointX][startY].base === MapTile.wall) {
			--startY;
		}
		if (startY > dungeon.top) {
			++startY; // bump so it doesn't start in the room
			while (endY < (dungeon.top + dungeon.height) && results.tiles[midpointX][endY].base === MapTile.wall) {
				++endY;
			}
			
			if (endY < (dungeon.top + dungeon.height)) {
				--endY; // bump so it doesn't end in the room
				results.corridors.push({ startX:midpointX, startY:startY, endX:midpointX, endY:endY });
				corridorMade = true;
				for (y = startY; y <= endY; y++) {
					results.tiles[midpointX][y] = {base:MapTile.floor};
				}

				// For now, only adding doors on vertical corridors because it looks better. Maybe later, I'll add horizontal doors
				addDoor = Math.random();
				if (addDoor < 0.20 && results.tiles[midpointX-1][startY].base === MapTile.wall && results.tiles[midpointX+1][startY].base === MapTile.wall) {
					if (addDoor < 0.02) {
						results.tiles[midpointX][startY] = {base:MapTile.hiddenDoor};
					} else if (addDoor < 0.10) {
						results.tiles[midpointX][startY] = {base:MapTile.openDoor};
					} else {
						results.tiles[midpointX][startY] = {base:MapTile.closedDoor};
					}
				}
				addDoor = Math.random();
				if (addDoor < 0.20 && results.tiles[midpointX-1][endY].base === MapTile.wall && results.tiles[midpointX+1][endY].base === MapTile.wall) {
					if (addDoor < 0.02) {
						results.tiles[midpointX][endY] = {base:MapTile.hiddenDoor};
					} else if (addDoor < 0.10) {
						results.tiles[midpointX][endY] = {base:MapTile.openDoor};
					} else {
						results.tiles[midpointX][endY] = {base:MapTile.closedDoor};
					}
				}
			}
		}
		
		if (!corridorMade) {
			console.log("Failed to make vertical corridor. startY="+startY+" endY="+endY+" x="+midpointX);
		}

		return corridorMade;
	}
};