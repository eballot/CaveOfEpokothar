var MapGeneratorBossLevel = {

	/*
	 * Returns and object with the following properties:
	 *  "rooms" - undefined because this is a special level so no random monsters nor items
	 *  "up" - the coordinates of the stairs leading up
	 *  "throne" - position of epokothar's throne
	 *  "epok" - the dimensions of epokothar's royal chamber 
	 * 
	 */
	generateMap: function(width, height) {
		var results, x, y, tiles, rooms, epok, throne, loot, stairsUpX, midpointY, corridorWX, corridorEX, corridorNY, corridorSY,
			chamberWX, chamberEX, chamberNY, chamberSY;
		
		// First fill it all with walls and later carve out the rooms and corridors
		tiles = new Array(width);
		for (x = 0; x < width; x++) {
			tiles[x] = new Array(height);
			for (y = 0; y < height; y++) {
				tiles[x][y] = {base:MapTileIcons.wall};
			}
		}

		stairsUpX = 2;
		midpointY = Math.floor(height/2);
		tiles[stairsUpX][midpointY] = {base:MapTileIcons.stairsUp};
		
		corridorWX = stairsUpX + 1;
		corridorNY = 10;
		corridorEX = width - 3;
		corridorSY = height - 11;

		// Main vertical corridors
		for (y = corridorNY; y <= corridorSY; y++) {
			tiles[corridorWX][y] =  {base:MapTileIcons.floor};
			tiles[corridorWX+1][y] =  {base:MapTileIcons.floor};
			tiles[corridorEX-1][y] =  {base:MapTileIcons.floor};
			tiles[corridorEX][y] =  {base:MapTileIcons.floor};
		}

		// Main horizontal corridors
		for (x = corridorWX+2; x < corridorEX; x++) {
			tiles[x][corridorNY] =  {base:MapTileIcons.floor};
			tiles[x][corridorNY+1] =  {base:MapTileIcons.floor};
			tiles[x][corridorSY-1] =  {base:MapTileIcons.floor};
			tiles[x][corridorSY] =  {base:MapTileIcons.floor};
		}

		rooms = [];
		//Storage rooms
		this._buildStorageSet(tiles, corridorWX, corridorNY - 7, true, rooms);
		this._buildStorageSet(tiles, corridorWX + 30, corridorNY - 7, true, rooms);
		this._buildStorageSet(tiles, corridorWX, corridorSY + 3, false, rooms);
		this._buildStorageSet(tiles, corridorWX + 30, corridorSY + 3, false, rooms);
		
		// Foyer to main chamber
		chamberEX = corridorEX - 2;
		chamberWX = chamberEX - 10;
		chamberNY = midpointY - 8;
		chamberSY = midpointY + 8;
		tiles[chamberEX][midpointY-1] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY+1] =  {base:MapTileIcons.floor};
		--chamberEX;
		tiles[chamberEX][midpointY-1] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY+1] =  {base:MapTileIcons.floor};
		this._buildRoom(tiles, chamberWX, chamberEX, chamberNY, chamberSY+1);

		// Main chamber
		chamberEX = chamberWX - 1;
		chamberWX = chamberEX - 35;
		chamberNY = midpointY - 12;
		chamberSY = midpointY + 12;
		tiles[chamberEX][midpointY-1] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY+1] =  {base:MapTileIcons.floor};
		--chamberEX;
		tiles[chamberEX][midpointY-1] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY] =  {base:MapTileIcons.floor};
		tiles[chamberEX][midpointY+1] =  {base:MapTileIcons.floor};
		this._buildRoom(tiles, chamberWX, chamberEX, chamberNY, chamberSY+1);
		epok = {x:chamberWX, y:chamberNY, w:10, h:chamberSY-chamberNY};
		throne = {x:chamberWX + 3, y:midpointY};
		tiles[throne.x][throne.y] = {base:MapTileIcons.throne};

		// Add pillar
		for (x = chamberWX + 3; x < chamberEX - 2; x += 3) {
			tiles[x][chamberNY+4] = {base:MapTileIcons.bighead};
			tiles[x][chamberSY-4] = {base:MapTileIcons.bighead};
		}

		// Add secret loot room
		this._buildRoom(tiles, chamberWX-8, chamberWX-1, midpointY-3, midpointY+4);
		loot = [{x:chamberWX-8, y:midpointY-3, w:7, h:6}];
		tiles[chamberWX-1][midpointY] = {base:MapTileIcons.doorHidden};

		results = {
			tiles: tiles,
			up: {x:stairsUpX, y:midpointY},
			epok: epok,
			throne: throne,
			loot: loot,
			rooms: rooms
		};
		return results;
	},
	
	_buildRoom: function(tiles, startX, extentX, startY, extentY) {
		var x, y;
		for (x = startX; x < extentX; x++) {
			for (y = startY; y < extentY; y++) {
				tiles[x][y] = {base:MapTileIcons.floor};
			}
		}
	},
	
	_buildStorageSet: function(tiles, startX, startY, up, rooms) {
		var extentX, extentY;
		extentX = startX + 10;
		extentY = startY + 5;
		rooms.push({x:startX, y:startY, w:10, h:5});
		this._buildRoom(tiles, startX, extentX, startY, extentY);

		startX = extentX + 1;
		extentX = startX + 5;
		tiles[startX - 1][startY + 2] =  {base:MapTileIcons.floor};
		tiles[extentX][startY + 2] =  {base:MapTileIcons.floor};
		if (up) {
			tiles[startX + 2][extentY] =  {base:MapTileIcons.floor};
			tiles[startX + 2][extentY + 1] =  {base:MapTileIcons.floor};
		} else {
			tiles[startX + 2][startY - 2] =  {base:MapTileIcons.floor};
			tiles[startX + 2][startY - 1] =  {base:MapTileIcons.floor};
		}
		this._buildRoom(tiles, startX, extentX, startY, extentY);

		startX = extentX + 1;
		extentX = startX + 10;
		rooms.push({x:startX, y:startY, w:10, h:5});
		this._buildRoom(tiles, startX, extentX, startY, extentY);
	}
};