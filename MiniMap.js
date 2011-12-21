/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

enyo.kind({
	name: "MiniMap",
	kind: enyo.Control,
	nodeTag:"canvas",
	
	create: function() {
		this.inherited(arguments);
		this.applyStyle("width", MapLevel.kMapWidth*2+"px");
		this.applyStyle("height", MapLevel.kMapHeight*2+"px");
	},
	
	rendered: function() {
		this.inherited(arguments);
		this.canvas = this.hasNode();
		this.canvas.height = MapLevel.kMapHeight*2;
		this.canvas.width = MapLevel.kMapWidth*2;
		this.ctx = this.canvas.getContext("2d");
		this.imageData = this.ctx.createImageData(MapLevel.kMapWidth*2, MapLevel.kMapHeight*2);
	},
	
	drawMap: function(tiles, player, initX, initY, extentX, extentY) {
		var x, y, columns, playerPos, tile;
		if (!this.ctx) {
			return; // Not ready yet, so just return
		}

		playerPos = player.getPosition();
		columns = tiles[0];
		initX = Math.max(0, initX);
		initY = Math.max(0, initY);
		extentX = Math.min(extentX, tiles.length);
		extentY = Math.min(extentY, columns.length);

		for (x = initX; x < extentX; x++) {
			columns = tiles[x];
			for (y = initY; y < extentY; y++) {
				if (x === playerPos.x && y === playerPos.y) {
					this._setPixel(x, y, "player");
				} else {
					tile = columns[y];
					if (tile) {
						if (tile.visited && tile.base.kind) {
							this._setPixel(x, y, tile.base.kind);
						} else {
							this._setPixel(x, y, "black");
						}
					} else {
						this._setPixel(x, y, "black");
					}
				}
			}
		}
		this.ctx.putImageData(this.imageData, 0, 0);
	},
	
	_setPixel: function(x, y, kind) {
		var index, imageData, r, g, b;
		switch (kind) {
		case MapTileIcons.floor.kind:
			r = 225; g = 225; b = 225; // off-white
			break;
		case MapTileIcons.wall.kind: 
		case MapTileIcons.doorHidden.kind: 
			r = 98; g = 98; b = 98; // gray
			break;
		case MapTileIcons.stairsDown.kind:
			r = 255; g = 0; b = 0; //red
			break;
		case MapTileIcons.stairsUp.kind:
			r = 51; g = 204; b = 0; //green
			break;
		case MapTileIcons.doorClosed.kind:
		case MapTileIcons.doorOpen.kind:
			r = 153; g = 51; b = 0; // brown
			break;
		case "player":
			r = 0; g = 0; b = 204;
			break;
		default:
			r = 0; g = 0; b = 0;
		}
		
		imageData = this.imageData;
		index = (x + y * imageData.width) * 8;
		imageData.data[index] = r;
		imageData.data[index+1] = g;
		imageData.data[index+2] = b;
		imageData.data[index+3] = 255;
		imageData.data[index+4] = r;
		imageData.data[index+5] = g;
		imageData.data[index+6] = b;
		imageData.data[index+7] = 255;
		
		index += imageData.width * 4;
		imageData.data[index] = r;
		imageData.data[index+1] = g;
		imageData.data[index+2] = b;
		imageData.data[index+3] = 255;
		imageData.data[index+4] = r;
		imageData.data[index+5] = g;
		imageData.data[index+6] = b;
		imageData.data[index+7] = 255;
	}
});
