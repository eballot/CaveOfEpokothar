
// Saves storage space by performing a simple run-length encoding on the tiles.

var MapRleCodex = {
	encode: function(tiles) {
		var compressedRow, compressedTiles, tx, txlen, row, ty, tylen, rleChar, rleVisited, rleCount, prevTile, currTile;
		compressedTiles = [];
		txlen = tiles.length;
		for (tx = 0; tx < txlen; tx++) {
			row = tiles[tx];
			tylen = row.length;
			compressedRow = [];
			rleCount = 0;
			for (ty = 0; ty < tylen; ty++) {
				currTile = row[ty];
				if (prevTile && prevTile.base === currTile.base && ((prevTile.visited && currTile.visited) || (!prevTile.visited && !currTile.visited))) {
					++rleCount;
				} else {
					if (rleCount > 0) {
						compressedRow.push({t:rleChar, c:rleCount, v:rleVisited});
					}
					rleChar = currTile.base.kind;
					rleVisited = currTile.visited ? 1 : 0;
					rleCount = 1;
				}
				prevTile = currTile;
			}
			if (rleCount > 0) {
				compressedRow.push({t:rleChar, c:rleCount, v:rleVisited});
			}
			compressedTiles.push(compressedRow);
		}
		
		return compressedTiles;
	},
	
	decode: function(rleTiles) {
		var tiles, tx, txlen, row, ty, tylen, rleRow, rleObj, rleCount, rleBase, tile;
		txlen = rleTiles.length;
		tiles = [];
		for (tx = 0; tx < txlen; tx++) {
			rleRow = rleTiles[tx];
			tylen = rleRow.length;
			row = [];
			for (ty = 0; ty < tylen; ty++) {
				rleObj = rleRow[ty];
				rleCount = rleObj.c;
				
				rleBase = MapTileIcons[rleObj.t];
				if (!rleBase) {
					rleBase = MapTileIcons.wall;
				}

				while (rleCount-- > 0) {
					// Need to create separate objects for each tile since they need individual properties, like "visited"  
					tile = { base:rleBase, visited:rleObj.v };
					row.push(tile);
				}
			}
			tiles.push(row);
		}
		
		return tiles;
	}	
};
