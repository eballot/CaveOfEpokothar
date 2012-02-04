/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

enyo.kind({
	name: "MapLevel",
	kind: enyo.Control,
	events: {
		onStatusText: "doStatusText",
		onMonsterClicked: "",
		onMonsterDied: "",
		onQuestComplete: ""
	},
	components: [{
		//Need to call render() on a div that doesn't include the canvas so canvas doesn't redraw whenever a new actor is added
		name: "actorsContainer",
		className: "actors-container"
	}, {
		name: "missile",
		className: "missile-animation"
	}],
	className: "map-styles",
	statics: {
		kMapHeight: 72,
		kMapWidth: 72,
		kTileSize: 32,
		kViewRadius: 8,
		kCanvasPartsCount: 3,
		kDrawStateBlack: 0,
		kDrawStateShadow: 1,
		kDrawStateVisible: 2
	},
	
	create: function() {
		var tileDrawState, x, y;
		this.inherited(arguments);
		this.boundVisit = this.visit.bind(this);
		this.boundIsBlocked = this.isBlocked.bind(this);

		tileDrawState = new Array(MapLevel.kMapWidth);
		for (x = 0; x < MapLevel.kMapWidth; x++) {
			tileDrawState[x] = new Array(MapLevel.kMapHeight);
			for (y = 0; y < MapLevel.kMapHeight; y++) {
				tileDrawState[x][y] = MapLevel.kDrawStateBlack;
			}
		}
		this.tileDrawState = tileDrawState;
		
		this.applyStyle("width", (MapLevel.kMapWidth*MapLevel.kTileSize)+"px");
		this.applyStyle("height", (MapLevel.kMapHeight*MapLevel.kTileSize)+"px");
	},

	newGame: function() {
		this.level = 0;
		this.setLevel(1);
	},
	
	getLevel: function() {
		return this.level;
	},

	setLevel: function(level) {
		var key;
		if (this.level) {
			this.save();
		}
		
		if (this.actors) {
			for (key in this.actors) {
				this.actors[key].destroy();
			}
		}
		this.actors = {};
		this.items = {};
		this.level = level;
		if (!this.restore()) {
			this._buildLevel();
			if (this.player) {
				// A new map is created when the user goes down stairs. Logically,
				// they should be located at the stairs up.
				//TODO: this is currently true because there's a single way down to the next
				// level (the stairs). Need an optional param to specify positioning override.
				this.player.positionAt(this.map.stairsUp.x, this.map.stairsUp.y);
			}
		}

		this._renderMap(0,0, MapLevel.kMapWidth, MapLevel.kMapHeight, true);
		if (this.player) {
			this.showFieldOfView(this.player, true);
			if (this.miniMap) {
				this.miniMap.drawMap(this.map.tiles, this.player, 0, 0, MapLevel.kMapWidth, MapLevel.kMapHeight);
			}
		}

		this.doStatusText(new enyo.g11n.Template($L("You are now on level #{level}.")).evaluate(this));
	},
	
	save: function() {
		// Save: items, actors, map
		var key, originalMapTiles, serialized, serializedActors = [], serializedItems = [];
		for (key in this.actors) {
			serializedActors.push(this.actors[key].saveToString());
		}
		for (key in this.items) {
			serializedItems.push('"' + key + '":[' + this.items[key].toString() + ']');
		}
		
		originalMapTiles = this.map.tiles;
		this.map.tiles = MapRleCodex.encode(originalMapTiles);

		serialized = '{"actors":[' + serializedActors.toString() +
			'],"items":{' + serializedItems.toString() +
			'},"map":' + JSON.stringify(this.map) +
			',"player":' + JSON.stringify(this.player.getPosition()) + '}';
		localStorage.setItem("map"+this.level, serialized);
		
		this.map.tiles = originalMapTiles;
	},
	
	restore: function() {
		var loaded = false, data, itemStack, item, key, idx, arrayLen, serialized;
		
		serialized = localStorage.getItem("map"+this.level);
		if (serialized) {
			try {
				data = JSON.parse(serialized);
				for (key in data.items) {
					itemStack = data.items[key];
					arrayLen = itemStack.length;
					for (idx = 0; idx < arrayLen; idx++) {
						// Replace the raw object with an ItemModel object
						item = itemStack[idx];
						itemStack[idx] = new ItemModel(item.category, item.type, item.extras);
					}
					data.items[key] = new ItemPile(itemStack);
				}
				
				arrayLen = data.actors.length;
				this.actors = {};
				for (idx = 0; idx < arrayLen; idx++) {
					item = data.actors[idx];
					key = this._itemsKey(item.position.x, item.position.y);
					this.actors[key] = this.createComponent({
						kind: "ActorOnMap",
						owner: this,
						parent: this.$.actorsContainer,				
						position: item.position,
						showing: false,
						monsterModel: MonsterModel.loadFromObject(item.monsterModel),
						onclick: "_monsterClicked",
						onDied: "_monsterDiedHandler",
						onStatusText: "doStatusText",
						onItemPickedUp: "_monsterPickedUpItemHandler"
					});
				}
				
				// Build out the tiles
				data.map.tiles = MapRleCodex.decode(data.map.tiles);
				this.map = data.map;
				this.items = data.items;

				this.player.positionAt(data.player.x, data.player.y);
				
				this.render();			
				loaded = true;
				
			} catch(e) {
				console.error("MapLevel load failure: "+e.toString());
			}
		}
		
		return loaded;
	},
	
	purgeMaps: function() {
		var level, maxLevel, mapLevel;
		level = 1; // Start at 1 because there is no zero level
		maxLevel = 1;
		for (level = 1; level < 100; level++) {
			mapLevel = "map" + level;
			if (localStorage.hasOwnProperty(mapLevel)) {
				localStorage.removeItem(mapLevel);
				maxLevel = level;
			}
		}
		
		// The max level explored is either the current map level or the last level deleted from localStorage
		return Math.max(maxLevel, this.level);
	},
	
	/*
	 * A single large canvas takes too long to re-render itself. To improve performance, create 9 smaller canvases
	 * so the re-rendering is less obvious (best-case 1/9 as bad, worst case 4/9 as bad). To keep click handling
	 * unchanged, overlay the canvas array with a single large div.
	 */
	rendered: function() {
		var x, y, n, rawWidth, rawHeight, width, height, top, left, newNodes, mapNode, insertBeforeThisNode;
		this.inherited(arguments);
		
		this.canvasTileWidth = Math.ceil(MapLevel.kMapWidth / MapLevel.kCanvasPartsCount);
		this.canvasTileHeight = Math.ceil(MapLevel.kMapHeight / MapLevel.kCanvasPartsCount);
		rawWidth = this.canvasTileWidth * MapLevel.kTileSize;
		rawHeight = this.canvasTileHeight * MapLevel.kTileSize;
		width = rawWidth + "px";
		height = rawHeight + "px";
		
		this.ctx = [];
		newNodes = [];
		for (y = 0; y < MapLevel.kCanvasPartsCount; y++) {
			top = (rawHeight * y) + "px";
			for (x = 0; x < MapLevel.kCanvasPartsCount; x++) {
				left = (rawWidth * x) + "px";
				n = document.createElement("canvas");
				n.height = rawHeight;
				n.width = rawWidth;
				n.style.position = "absolute";
				n.style.top = top;
				n.style.left = left;
				n.style.width = width;
				n.style.height = height;
				this.ctx.push(n.getContext("2d"));
				newNodes.push(n);
			}
		}

		n = document.createElement("div");
		n.style.position = "absolute";
		n.style.top = "0";
		n.style.left = "0";
		n.style.width = (MapLevel.kMapWidth * MapLevel.kTileSize) + "px";
		n.style.height = (MapLevel.kMapHeight * MapLevel.kTileSize) + "px";
		newNodes.push(n);

		mapNode = this.hasNode();
		insertBeforeThisNode = this.$.actorsContainer.hasNode();
		for (x = 0; x < newNodes.length; x++) {
			mapNode.insertBefore(newNodes[x], insertBeforeThisNode);
		}

		if (MapTileIcons.iconsLoaded) {
			this._renderMap(0,0, MapLevel.kMapWidth, MapLevel.kMapHeight, true);
			if (this.player) {
				this.showFieldOfView(this.player, true);
				if (this.miniMap) {
					// The minimap is "rendered" after the maplevel. To ensure the entire map gets fully displayed in
					// the minimap, setup a small delay. The other option would be to setup a callback in the minimap's
					// rendered function, which feels just a bit overkill.
					var delayedDrawMap = this.miniMap.drawMap.bind(this.miniMap, this.map.tiles, this.player, 0, 0, MapLevel.kMapWidth, MapLevel.kMapHeight);
					setTimeout(delayedDrawMap, 25);
				}
			}
		}
	},
	
	useStairsAt: function(x, y) {
		var tileKind = this.getTileKindAt(x, y);
		if (tileKind === MapTileIcons.stairsDown.kind) {
			this.setLevel(this.level + 1);
		} else if (tileKind === MapTileIcons.stairsUp.kind) {
			if (this.level > 1) {
				this.setLevel(this.level - 1);
			}
		}
	},
	
	showFieldOfView: function(item, updateActors) {
		var x, y, extentX, extentY, position, key, actor;
		if (!MapTileIcons.iconsLoaded || !this.map || !this.map.tiles) {
			return;
		}
		
		position = item.getPosition();
		this.currentTime = Date.now();
		fieldOfView(position.x, position.y, MapLevel.kViewRadius, this.boundVisit, this.boundIsBlocked);
		
		x = position.x - MapLevel.kViewRadius - 1;
		extentX = position.x + MapLevel.kViewRadius + 2;
		y = position.y - MapLevel.kViewRadius - 1;
		extentY = position.y + MapLevel.kViewRadius + 2;
		this._renderMap(x, y, extentX, extentY, false);
		if (this.miniMap) {
			this.miniMap.drawMap(this.map.tiles, this.player, x, y, extentX, extentY);
		}
		
		if (updateActors) {
			for (key in this.actors) {
				actor = this.actors[key];
				actor.setShowing(this.hasLineOfSiteToPlayer(actor));
			}
		}
	},
	
	// Callback used by the FieldOfVision function
	visit: function(x, y) {
		var tile;
		if (x < MapLevel.kMapWidth && y < MapLevel.kMapHeight) {
			tile = this.map.tiles[x][y];
			if (tile) {
				tile.visited = this.currentTime;
			}
		}
	},

	// Callback used by the FieldOfVision function
	isBlocked: function(x, y) {
		var tile, blocked;
		if (x < MapLevel.kMapWidth && y < MapLevel.kMapHeight) {
			tile = this.map.tiles[x][y];
			if (tile && tile.base.obstructed) {
				blocked = true;
			} else {
				blocked = false;
			}
		} else {
			blocked = true;
		}
		
		return blocked;
	},
	
	isActorAt: function(x, y) {
		return !!this.actors[this._itemsKey(x, y)];
	},

	setPlayer: function(inPlayer) {
		this.player = inPlayer;
	},
	
	setMiniMap: function(inMiniMap) {
		this.miniMap = inMiniMap;
	},
	
	getPlayer: function() {
		return this.player;
	},

	openDoorAt: function(x, y) {
		var t = this.map.tiles[x][y];
		if (t && t.base.kind === MapTileIcons.doorClosed.kind) {
			t.base = MapTileIcons.doorOpen;
			this._renderMap(x, y, x+1, y+1, true);
		}
	},
	
	closeDoorAt: function(x, y) {
		var t = this.map.tiles[x][y];
		if (t && t.base.kind === MapTileIcons.doorOpen.kind && !this.getItemPileAt({x:x, y:y})) {
			t.base = MapTileIcons.doorClosed;
			this._renderMap(x, y, x+1, y+1, true);
		}
	},
	
	getItemPileAt:function(position) {
		return this.items[this._itemsKey(position.x, position.y)];
	},

	createItem: function(category, type, extras) {
		var position, itemTemplate, item;
		itemTemplate = kItemsData.getItemTemplate(category, type);
		if (!itemTemplate) {
			return null;
		}
		
		position = this._generateRandomPosition();
		if (position) {
			item = new ItemModel(category, type, extras);
			this.addItem(item, position.x, position.y);
		} else {
			item = null;
		}
		return item;
	},

	addItem: function(itemModel, x, y) {
		var key, pile;
		key = this._itemsKey(x, y);
		pile = this.items[key];
		if (!pile) {
			this.items[key] = new ItemPile(itemModel);
		} else {
			pile.addItem(itemModel);
		}
		
		// Dispay the updated pile of items
		this._renderMap(x, y, x+1, y+1, true);
	},
	
	itemPileChanged: function(position) {
		var key, pile;
		key = this._itemsKey(position.x, position.y);
		pile = this.items[key];
		if (pile) {
			if (pile.isEmpty()) {
				delete this.items[key];
			}
			this._renderMap(position.x, position.y, position.x+1, position.y+1, true);
		}
	},

	createRandomItems: function(category, value) {
		var typeKeys, type, item, magical;
		typeKeys = Object.keys(kItemsData[category]);
		while (value > 0) {
			type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
			item = this.createItem(category, type);
			if (item) {
				if (item.canConsolidate() && category !== "potions") {
					item.setRemainingUses(Math.floor(Math.random() * 12) + 3);
				}
				
				// Small chance to add magical bonus
				magical = Math.floor(Math.random() * (10 + 2 * this.level));
				if (magical > 15) {
					item.addMagicBonus(this.level);
				} else if (magical > 13) {
					item.addRacialAdornment();
				}
				value -= item.getGoldValue();
			}
		}
		return value;
	},

	createRandomMonster: function(attitude, position) {
		var m, key, playerX, playerY, monsterKeys;
		monsterKeys = kMonstersAtLevel[this.level - 1];
		if (!monsterKeys) {
			console.error("MonsterAtLevel undefined for level " + this.level);
			monsterKeys = Object.keys(kMonsterData);
		}
		m = new MonsterModel({
			race: monsterKeys[Math.floor(Math.random() * monsterKeys.length)],
			level: Math.ceil(this.level / 2), // monster's power is commensurate with the level it resides in
			attitude:attitude
		});
		if (!position) {
			// Make sure the random position isn't already occupied by another monster or the player
			if (this.player) {
				position = this.player.getPosition();
				playerX = position.x;
				playerY = position.y;
			}

			do {
				position = this._generateRandomPosition();
				key = this._itemsKey(position.x, position.y);
			} while (this.actors[key] || (position.x === playerX && position.y === playerY));
		}

		if (position) {
			this._addActor(m, position, "_monsterDiedHandler");
		}
		
		return !!position;
	},
	
	everyoneTakeATurn: function() {
		var keys, oldKey, position, oldX, oldY, actor, i, arrayLength;
		keys = Object.keys(this.actors);
		arrayLength = keys.length;
		for (i = 0; i < arrayLength; i++) {
			oldKey = keys[i];
			actor = this.actors[oldKey];
			position = actor.getPosition();
			oldX = position.x; // store the 'old' x & y coordinates before taking a turn
			oldY = position.y;
			actor.performTurn(this);
			// Check if the actor moved. Note that position is a reference to an object so don't need to
			// 'get' it again (the properties within it are updated by the actor).
			if (position.x !== oldX || position.y !== oldY) {
				delete this.actors[oldKey];
				this.actors[this._itemsKey(position.x, position.y)] = actor;
			}
		}
		
		// Periodically check to see if more actors should appear on the scene
		if (arrayLength < 3 + this.level && GameMain.turnCount % 150 === 0) {
			if (this.createRandomMonster("hostile")) {
				this.$.actorsContainer.render(); // enyo doesn't add the new component to the DOM tree until you call render() on an ancestor
			}
		}
	},
	
	whoCanPlayerSee: function() {
		var key, actor, visibleActors = [];
		for (key in this.actors) {
			actor = this.actors[key];
			if (this.hasLineOfSiteToPlayer(actor)) {
				visibleActors.push(actor);
			}
		}
		return visibleActors;
	},
	
	moveBy: function(actor, deltaX, deltaY) {
		var position, x, y, something, acted = false;
		position = actor.getPosition();
		x = position.x;
		y = position.y;
		if (deltaX) {
			x = x + deltaX;
			if (x < 0) {
				x = 0;
			} else if (x >= MapLevel.kMapWidth) {
				x = MapLevel.kMapWidth - 1;
			}
		}

		if (deltaY) {
			y = y + deltaY;
			if (y < 0) {
				y = 0;
			} else if (y >= MapLevel.kMapHeight) {
				y = MapLevel.kMapHeight - 1;
			}
		}
		
		something = this.whatIsAt(x, y);
		if (!something) {
			// If the spot is clear, the move to it 
			acted = true;
			actor.positionAt(x, y);
		} else if (something === actor) {
			// Nothing to do since we're standing still
			acted = true;
		} else if (something.obstructed) {
			// Try to move along the wall
			if (deltaX !== 0 && deltaY !== 0) {
				acted = this.moveBy(actor, 0, deltaY);
				if (!acted) {
					acted = this.moveBy(actor, deltaX, 0);
				}
			}
		} else {
			switch (something.kind) {
			case "PlayerOnMap":
			case "ActorOnMap":
				// Try to move around the other actor
				if (deltaX !== 0 && deltaY !== 0) {
					acted = this.moveBy(actor, 0, deltaY);
					if (!acted) {
						acted = this.moveBy(actor, deltaX, 0);
					}
				}
				break;

			default:
				acted = true;
				actor.positionAt(x, y);
				break;
			}
		}
		
		return acted;
	},

	getTileKindAt: function(x, y) {
		var t = this.map.tiles[x][y];
		if (t) {
			return t.base.kind;
		} else {
			return MapTileIcons.wall.kind;
		}
	},
	
	whatIsAt: function(x, y, justItems) {
		var key, position, tile = undefined;
		x = Math.min(Math.max(x, 0), MapLevel.kMapWidth-1);
		y = Math.min(Math.max(y, 0), MapLevel.kMapHeight-1);
		position = this.player.getPosition();

		if (!justItems) {
			if (position.x === x && position.y === y) {
				return this.player;
			}
			
			key = this._itemsKey(x, y);
			if (this.actors[key]) {
				return this.actors[key];
			}
			
			tile = this.map.tiles[x][y];
			if (tile && tile.base.obstructed) {
				return tile.base;
			}
		}
		
		return this.items[this._itemsKey(x, y)] || (tile && tile.base);
	},
	
	searchNearby: function(actor, distance) {
		var center, probability, x, y, xExtent, yExtent, tile;
		center = actor.getPosition();
		probability = actor.getSearchProbability();

		x = Math.max(1, center.x - distance);
		xExtent = center.x + distance + 1;
		yExtent = center.y + distance + 1;
		
		while(x < xExtent) {
			y = Math.max(1, center.y - distance);
			while(y < yExtent) {
				tile = this.map.tiles[x][y];
				if (tile && tile.base.hidden && Math.random() < probability) {
					actor.exerciseSkill("search");
					if (tile.base.kind === MapTileIcons.doorHidden.kind) {
						tile.base = MapTileIcons.doorClosed;
						this._renderMap(x, y, x+1, y+1, true);
						this.doStatusText($L("You found a hidden door!"));
					} else {
						//TODO: search for nearby traps
					}
					found = true;
					break;
				}
				++y;
			}
			++x;
		}
	},

	shootMissileOnPath: function(shooter, target, weapon, ammoItem) {
		var hit, startPos, endPos, ix, iy, deltaX, deltaY, absX, absY, realX, realY, diffX, diffY,
			maxRange, range, item, prevItem, extraBonus, obstructedWallItem, imgClass;
		hit = false;
		extraBonus = 0;
		startPos = shooter.getPosition();
		endPos = target.getPosition();
		deltaX = endPos.x - startPos.x;
		deltaY = endPos.y - startPos.y;
		absX = Math.abs(deltaX);
		absY = Math.abs(deltaY);
		maxRange = Math.max(absX, absY) + Math.ceil(Math.random()*5);
		maxRange = Math.min(maxRange, weapon.getRangedReach());
		
		//angle = Math.floor(Math.atan(deltaY / deltaX) * 180 / Math.PI);
		
		if (absX > absY) {
			deltaX = deltaX / absX; // either +1 or -1
			deltaY = deltaY / absX;
			imgClass = "horiz"+deltaX; // hacky: this is either "horiz1" or "horiz-1"
		} else {
			deltaX = deltaX / absY;
			deltaY = deltaY / absY; // either +1 or -1
			imgClass = "vert"+deltaY; // hacky: this is either "vert1" or "vert-1"
		}
		
		// want to start at the tile next to shooter
		for (range = 1; !hit && range <= maxRange; range++) {
			realX = startPos.x + (range * deltaX);
			realY = startPos.y + (range * deltaY);
			iy = Math.round(realY);
			ix = Math.round(realX);
			if (ix > 0 && ix < MapLevel.kMapWidth && iy > 0 && iy < MapLevel.kMapHeight) {
				item = this.whatIsAt(ix, iy);
				if (item) {
					if (item.kind === "ActorOnMap" || item.kind === "PlayerOnMap") {
						hit = shooter.useAttack(weapon, target, range, extraBonus);
					} else if (item.obstructed) {
						// The missile passed thru an obstructed tile. Check the adjoining tile on the side that the missile is closest 
						// to see if it really hit a blocking wall instead of a corner. 
						diffX = realX - ix;
						if (diffX > 0.05) {
							diffX = 1;
						} else if (diffX < -0.052) {
							diffX = -1;
						} else {
							diffX = 0;
						}

						diffY = realY - iy;
						if (diffY > 0.05) {
							diffY = 1;
						} else if (diffY < -0.052) {
							diffY = -1;
						} else {
							diffY = 0;
						}

						obstructedWallItem = this.whatIsAt(ix + diffX, iy + diffY);
						if (obstructedWallItem && obstructedWallItem.obstructed) {
							// Wall is blocked so break out
							break;
						}

						extraBonus -= 4; // target gets a defense bonus for partial cover behind an obstructing feature
					}
					prevItem = item;
				}
			} else {
				if (ix <= 0) {
					ix = 1;
				} else if (ix >= MapLevel.kMapWidth) {
					ix = MapLevel.kMapWidth - 1;
				}

				if (iy <= 0) {
					iy = 1;
				} else if (iy >= MapLevel.kMapHeight) {
					iy = MapLevel.kMapHeight - 1;
				}

				break;
			}
		}
		
		// Display a missile animation from start to ix,iy
		this.$.missile.setStyle("top:" + (startPos.y*MapLevel.kTileSize) + "px; left:" + (startPos.x*MapLevel.kTileSize) + "px;");
		this.$.missile.addClass("animate "+imgClass);

		//If the maxRange was in an obstructed tile, back up one tile
		if (item && item.obstructed) {
			if (prevItem && prevItem.obstructed) {
				range -= 2;
			} else {
				--range;
			}
			iy = startPos.y + Math.round(range * deltaY);
			ix = startPos.x + Math.round(range * deltaX);
		}

		// Delay to let the animate class take effect.
		var that = this;
		window.setTimeout(function() {
			that.$.missile.setStyle("top:" + (iy*MapLevel.kTileSize) + "px; left:" + (ix*MapLevel.kTileSize) + "px;");
			
			window.setTimeout(function() {
				var newItem;
				that.$.missile.removeClass("animate "+imgClass);
				if (!ammoItem.destroyedWhenUsed(hit)) {
					newItem = ammoItem.makeCopy();
					if (shooter.isPlayer()) {
						newItem.setAutoPickupFlag();
					}
					newItem.setEquipped(false);
					if (ammoItem.getCategory() === "ammo") {
						newItem.setRemainingUses(1);
					}
					that.addItem(newItem, ix, iy);
				}
			}, 150);
		}, 10);
		
		return hit;
	},

	hasLineOfSiteToPlayer: function(inActor) {
		var position, tile;
		position = inActor.getPosition();
		tile = this.map.tiles[position.x][position.y];
		return (tile && tile.visited === this.currentTime);
	},

	_itemsKey: function(x, y) {
		return "x"+x+"y"+y;
	},
	
	_epokotharDiedHandler: function(inActor) {
		this._monsterDiedHandler(inActor);
		this.doStatusText('<span style="color:lightgreen;">' + $L("Huzzah, you defeated Epokothar! The cloak is hidden nearby.") + '</span>');
		this.doQuestComplete();
	},
	
	_monsterDiedHandler: function(inActor) {
		var i, key, actor, inventory, position, corpse;
		// Let the map know that another monster was killed
		this.doMonsterDied(inActor.whatAreYou(false));
		position = inActor.getPosition();
		key = this._itemsKey(position.x, position.y);
		actor = this.actors[key];
		if (actor) {
			delete this.actors[key];
			// Get loot items from the monster and drop them on the map
			// TODO: maybe drop some money or random item
			inventory = actor.getInventoryList();

			corpse = actor.getCorpseItem();
			if (corpse) {
				this.addItem(corpse, position.x, position.y);
			}

			for (i = 0; i < inventory.length; i++) {
				// Don't always drop an inventory item (just to keep things a bit random)
				if (Math.random() < 0.65) {
					this.addItem(inventory[i], position.x, position.y);
				}
			}

			actor.destroy();
		}
	},
	
	_monsterClicked: function(inSender, inEvent) {
		this.doMonsterClicked(inSender); // passing up the actor that was clicked
		return true;
	},
	
	_generateRandomPosition: function(rooms) {
		if (!rooms) {
			rooms = this.map.rooms;
		}
		
		if (!rooms) {
			return null;
		} else {
			var room = rooms[Math.floor(Math.random() * rooms.length)];
			return {
				x: room.x + Math.floor(Math.random() * room.w),
				y: room.y + Math.floor(Math.random() * room.h)
			};
		}
	},
	
	_monsterPickedUpItemHandler: function(inSender, inData) {
		//TODO: implement this
	},
	
	_buildLevel: function() {
		var newMap, item, typeKeys, type, nourishment, value;
		if (this.level === 10) {
			this._buildBossLevel();
		} else {
			newMap = MapGeneratorBsp.generateMap(MapLevel.kMapWidth, MapLevel.kMapHeight);
			this.map = {
				tiles: newMap.tiles,
				rooms: newMap.rooms,
				stairsUp: newMap.up,
				stairsDown: newMap.down
			};

			this.createRandomMonster("neutral");
			this.createRandomMonster("neutral");
			value = 20 + this.level;
			while (--value > 0) {
				this.createRandomMonster("hostile");
			}
			this.$.actorsContainer.render();
			
			// First create some food items
			nourishment = 2000 + this.level * 25;
			typeKeys = Object.keys(kItemsData.food);
			while (nourishment > 0) {
				type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
				item = this.createItem("food", type);
				if (item) {
					nourishment -= item.getNourishment();
				} else {
					nourishment = -1;
				}
			}
			
			// Create a few random weapons, armor, ammo
			value = 40 * (this.level - 1); // no armor on level 1!
			value = this.createRandomItems("armor", value);
			value += 35 * this.level;
			this.createRandomItems("weapons", value);
			this.createRandomItems("ammo", 3.3 * this.level);
			this.createRandomItems("potions", 400 + Math.floor(Math.random() * 100 * this.level));
		}
	},
	
	_buildBossLevel: function() {
		var i, newMap, item, position;
		newMap = MapGeneratorBossLevel.generateMap(MapLevel.kMapWidth, MapLevel.kMapHeight);
		this.map = {
			tiles: newMap.tiles,
			rooms: newMap.rooms,
			stairsUp: newMap.up
		};
		
		this._addActor(new MonsterModel({
			race: "epokothar",
			level: this.level,
			attitude:"hostile"
		}), {x:newMap.throne.x, y:newMap.throne.y}, "_epokotharDiedHandler");

		// Add evil minions
		this._addActor(new MonsterModel({
			race: "humanknight",
			level: Math.ceil(this.level / 2),
			attitude:"hostile"
		}), {x:newMap.throne.x+1, y:newMap.throne.y-1}, "_monsterDiedHandler");
		this._addActor(new MonsterModel({
			race: "humanknight",
			level: Math.ceil(this.level / 2),
			attitude:"hostile"
		}), {x:newMap.throne.x+1, y:newMap.throne.y+1}, "_monsterDiedHandler");

		// And a few random hostiles
		i = 10;
		while (--i > 0) {
			this.createRandomMonster("hostile");
		}
		
		this.$.actorsContainer.render();
		
		item = new ItemModel("armor", "cloakehpeway");
		position = this._generateRandomPosition(newMap.loot);
		this.addItem(item, position.x, position.y);
		
		this.createRandomItems("armor", 300);
		this.createRandomItems("weapons", 500);
	},
	
	_addActor: function(monsterModel, position, diedHandler) {
		var key = this._itemsKey(position.x, position.y);
		if (!this.actors[key]) {
			this.actors[key] = this.createComponent({
				kind: "ActorOnMap",
				owner: this,
				parent: this.$.actorsContainer,				
				position: position,
				monsterModel: monsterModel,
				showing: false,
				onclick: "_monsterClicked",
				onDied: diedHandler || "_monsterDiedHandler",
				onStatusText: "doStatusText",
				onItemPickedUp: "_monsterPickedUpItemHandler"
			});
			return true;
		}
		return false;
	},
	
	_renderMap: function(initX, initY, extentX, extentY, forceRender) {
		var x, y, ctxIndex, adjX, adjY, columns, context, tile, tileType, key, tileObj, itemPile, tileDrawState;
		if (!this.ctx || !MapTileIcons.iconsLoaded) {
			return; // Not ready yet, so just return
		}

		initX = Math.max(0, initX);
		initY = Math.max(0, initY);
		columns = this.map.tiles[0];
		extentX = Math.min(this.map.tiles.length, extentX); /*MapLevel.kMapWidth*/
		extentY = Math.min(columns.length, extentY); /*MapLevel.kMapHeight*/

		tileDrawState = this.tileDrawState;
		for (x = initX; x < extentX; x++) {
			adjX = (x % this.canvasTileWidth) * MapLevel.kTileSize;
			columns = this.map.tiles[x];
			for (y = initY; y < extentY; y++) {
				adjY = (y % this.canvasTileHeight) * MapLevel.kTileSize;
				ctxIndex = Math.floor(MapLevel.kCanvasPartsCount * (x / MapLevel.kMapWidth + Math.floor(MapLevel.kCanvasPartsCount * y / MapLevel.kMapWidth)));
				context = this.ctx[ctxIndex];
				tile = columns[y];
				if (tile) {
					if (tile.visited) {
						tileType = tile.base.kind;
					} else {
						tileType = "unknown";
					}
				} else {
					tileType = "unknown";
				}
				
				if (MapTileIcons[tileType]) {
					tileObj = MapTileIcons[tileType];
					if (forceRender || tile.visited === this.currentTime && tileDrawState[x][y] !== MapLevel.kDrawStateVisible) {
						tileDrawState[x][y] = MapLevel.kDrawStateVisible;
						context.drawImage(MapTileIcons.imgs[tileObj.img], tileObj.offsetX, tileObj.offsetY, MapLevel.kTileSize, MapLevel.kTileSize, adjX, adjY, MapLevel.kTileSize, MapLevel.kTileSize);

						key = this._itemsKey(x, y);
						itemPile = this.items[key];
						if (itemPile) {
							// Aging the pile here because it is lazy (only done when the pile comes into view)
							if (itemPile.checkAge()) {
								delete this.items[key];
							} else {
								tileObj = itemPile.getTileImg();
								if (tileObj) {
									context.drawImage(MapTileIcons.imgs[tileObj.img], tileObj.offsetX, tileObj.offsetY, MapLevel.kTileSize, MapLevel.kTileSize, adjX, adjY, MapLevel.kTileSize, MapLevel.kTileSize);
									if (itemPile.count() > 1) {
										context.fillStyle = "yellow";
										context.font = "bold 24px sans-serif";
										context.textBaseline = "top";
										context.fillText("+", adjX, adjY);
									}
								}
							}
						}
					}
					
					// Add shading to tiles that are currently blocked from view
					if (tile.visited !== this.currentTime && (forceRender || tileDrawState[x][y] !== MapLevel.kDrawStateShadow)) {
						tileDrawState[x][y] = MapLevel.kDrawStateShadow;
						context.fillStyle = "rgba(0,0,0,0.4)";
						context.fillRect(adjX, adjY, MapLevel.kTileSize, MapLevel.kTileSize);
					}
				} else {
					if (forceRender || tileDrawState[x][y] !== MapLevel.kDrawStateBlack) {
						tileDrawState[x][y] = MapLevel.kDrawStateBlack;
						context.fillStyle = "black";
						context.fillRect(adjX, adjY, MapLevel.kTileSize, MapLevel.kTileSize);
					}
				}
			}
		}
	}
});
