/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

enyo.kind({
	name: "GameMain",
	kind: enyo.SlidingPane,
	multiView: false,
	flex: 1,
	events: {
		onNeedNewPlayer: ""
	},
	components: [{
		name: "mainSlidingView",
		kind: enyo.SlidingView,
		fixedWidth: true,
		components: [{
			name: "game",
			kind: enyo.VFlexBox,
			style: "background-color: black;",
			flex: 1,
			components: [{
				kind: enyo.HFlexBox,
				style: "position: relative;", //don't want position:static since it screws up html's automatic layout
				flex: 1,
				components: [{
					name: "mapScroller",
					kind: enyo.Control,
					className: "map-scroller",
					components: [{
						name: "map",
						kind: "MapLevel",
						className: "map-styles",
						onStatusText: "_showStatusText",
						onMonsterDied: "_updateKillList"
					}, {
						name: "me",
						kind: "PlayerOnMap",
						onActed: "gameLoop",
						onDied: "playerDeath",
						onStatsChanged: "playerStatsChanged",
						onStatusText: "_showStatusText",
						onShowInventory: "showInventory",
						onAlertDialog: "_showNoHandsAlert"
					}]
				}, {
					//name: "shadow",
					className: "enyo-sliding-view-shadow stats-box-shadow"
				}, {
					kind: enyo.VFlexBox,
					className: "player-stats-box",
					components: [{
						name: "playerStats",
						content: "",
						allowHtml: true,
						style: "margin:2px 6px 4px 6px;"
					}, {
						className: "player-stats-box-horiz-divider"
					}, {
						name: "consoleScroller",
						kind: enyo.Scroller,
						autoHorizontal: false,
						horizontal: false,
						flex: 1,
						style: "margin:2px 6px 4px 6px",
						components: [{
							name: "statusConsole",
							kind: enyo.Control,
							allowHtml: true
						}]
					}]
				}]
			}, {
				kind: enyo.HFlexBox, //Toolbar,
				className: "gamemain-toolbar",
				components: [{
					kind: enyo.ToolButton,
					caption: $L("Inventory"),
					onclick: "showInventory"
				}, {
					kind: enyo.ToolButton,
					caption: $L("Search"),
					onclick: "searchNearby"
				}, {
					name: "stairsUp",
					kind: enyo.ToolButton,
					caption: $L("Go Up"),
					showing: false,
					onclick: "useStairs"
				}, {
					name: "stairsDown",
					kind: enyo.ToolButton,
					caption: $L("Go Down"),
					showing: false,
					onclick: "useStairs"
				}, {
					kind: enyo.ToolButton,
					caption: $L("Save"),
					onclick: "saveGame"
				}]
			}]
		}]
	}, {
		name: "inventorySlidingView",
		kind: enyo.SlidingView,
		dismissible: true,
		showing: false,
		components: [{
			name: "inventory",
			kind: "Inventory",
			onDismiss: "hideInventory"
		}]
	}, {
		name: "nohandsAlert",
		kind: enyo.Popup,
		scrim: true,
		components: [{
			content: "You don't have enough free hands to hold that."
		}, {
			kind: enyo.Button,
			caption: enyo._$L("OK"),
			onclick: "_closeNoHandsAlert"
		}]
	}, {
		name: "gameOverDialog",
		kind: enyo.Popup,
		modal: true,
		dismissWithClick: false,
		dismissWithEscape: false,
		scrim: true,
		components: [{
			name: "deathOverview",
			allowHtml: true,
			content: ""
		}, {
			kind: enyo.Button,
			caption: enyo._$L("OK"),
			onclick: "_restartGame"
		}]
	}, {
		kind: enyo.ApplicationEvents,
		onKeyup: "_handleKeypress"
	}],
	
	create: function() {
		this.inherited(arguments);
		
		this.statusText = [];
		this.killList = {};
		this._showStatusText(this, $L("Welcome adventurer!"));		
		this.$.map.setPlayer(this.$.me);
		
		if (this.restoreGame()) {
			this._updateToobarButtons();
		} else {
			// Assuming new game
			this.startNewGame();
		}
	},
	
	startNewGame: function() {
		//TODO: init environment info: turns, identified items, etc
		this.turnCount = 0;
		this.statusText = [];
		this.killList = {};
		this.$.map.newGame();
		
		// send the NeedNewPlayer event asynchronously in case the app is still creating the DOM
		window.setTimeout(function() {
			this.doNeedNewPlayer();
		}.bind(this), 10);
	},
	
	saveGame: function(inSender) {
		//TODO: save environment info: turns, identified items, etc
		var gameEnvironment = '{"v":1,"turns":' + this.turnCount + ',"mapLevel":' + this.$.map.getLevel() + '}';
		localStorage.setItem("environment", gameEnvironment);
		localStorage.setItem("kills", JSON.stringify(this.killList));

		this.$.me.save();
		this.$.map.save();
	},
	
	restoreGame: function() {
		var data, killList, gameEnvironment;
		gameEnvironment = localStorage.getItem("environment");
		if (gameEnvironment) {
			data = JSON.parse(gameEnvironment);
			if (data.v !== 1) {
				return false;
			}
			this.turnCount = data.turns;
			killList = localStorage.getItem("kills");
			this.killList = killList ? JSON.parse(killList) : {};
			
			this.$.me.restore();
			this.$.map.setLevel(data.mapLevel);
		}

		return !!gameEnvironment;
	},
	
	createNewCharacter: function(details, initialClass) {
		this.$.me.createNewCharacter(details);
		this._showStatusText(this, (new enyo.g11n.Template($L("You are playing as a #{name}"))).evaluate({name:initialClass}));
		this.scrollMapToPlayer();
	},
	
	useStairs: function(inSender) {
		var position = this.$.me.getPosition();
		this.$.map.useStairsAt(position.x, position.y);
		this.scrollMapToPlayer();
		this._updateToobarButtons();
	},
	
	searchNearby: function(inSender) {
		this.$.map.searchNearby(this.$.me.getPosition(), 2);
		this.$.me.rest(this.turnCount);
	},
	
	showInventory: function(inSender, inPlayer) {
		this.$.inventorySlidingView.setShowing(true);
		this.$.inventory.setPlayer(this.$.me);
		this.$.inventory.setMap(this.$.map);
	},

	hideInventory: function() {
		// Ensure the hide is asynchronous since enyo panes apparently need this
		window.setTimeout(function() {
			this.$.inventorySlidingView.setShowing(false);
		}.bind(this), 10);
	},
	
	rendered: function() {
		this.inherited(arguments);

		// Slight delay to allow layout to complete so bounds are correct
//		window.setTimeout(function() {
		//Hack needed because the main enyo slidingview is fixed size and for some reason it is really wide on first launch
		this.$.game.applyStyle("width", window.innerWidth+"px");
		this._setMapScrollingBounds();
		//Even more hackery. Something in enyo is setting this width when I set game's width. So forcing it back to 0
		this.$.mainSlidingView.applyStyle("width", "0");
		this.$.map.showFieldOfView(this.$.me, true);
//		}.bind(this), 10);
	},
	
	playerStatsChanged: function(inSender, inStatsText) {
		this.$.playerStats.setContent(inStatsText);
	},
	
	playerDeath: function(inSender, inDeathReason) {
		var obj = {}, gameOverview, deadThings = [];
		// TODO: show your inventory? 
		obj.reason = inDeathReason;

		localStorage.removeItem("player");
		localStorage.removeItem("environment");
		obj.maxLevel = this.$.map.purgeMaps();

		obj.turns = this.turnCount;
		for (var monsterName in this.killList) {
			deadThings.push(monsterName + ": " + this.killList[monsterName]);
		}
		obj.killList = deadThings.sort().join("<br/>");
		
		gameOverview = (new enyo.g11n.Template($L("#{reason}<br/>You explored #{maxLevel} levels in #{turns} turns.<br/>You killed the following:<br/>#{killList}"))).evaluate(obj);
		
		this.$.gameOverDialog.openAtCenter();
		this.$.deathOverview.setContent(gameOverview);
	},
	
	gameLoop: function(inSender, inHungerString) {
		++this.turnCount;
		this.$.map.showFieldOfView(this.$.me, false);
		this.$.map.everyoneTakeATurn(this.turnCount);
		this.scrollMapToPlayer();
	},
	
	clickHandler: function(inSender, inEvent) {
		var tileX, tileY, position;
		if (inSender.kind === "MapLevel") {
			tileX = Math.floor(inEvent.offsetX / MapLevel.kTileSize);
			tileY = Math.floor(inEvent.offsetY / MapLevel.kTileSize);
			this.$.me.interactWithMap(this.$.map, tileX, tileY, this.turnCount);
			this._updateToobarButtons();
			return true;
		} else if (inSender.kind === "ItemOnMap" || inSender.kind === "ActorOnMap" || inSender.kind === "PlayerOnMap") {
			position = inSender.getPosition();
			this.$.me.interactWithMap(this.$.map, position.x, position.y, this.turnCount);
			return true;
		} else if (inSender.parent) {
			this.clickHandler(inSender.parent, inEvent);
		}
	},
	
	resizeHandler: function() {
		this.inherited(arguments);
		//Hack needed because the main enyo slidingview is fixed size so it doesnt update on window resize
		this.$.game.applyStyle("width", window.innerWidth+"px");
		this._setMapScrollingBounds();
		//Even more hackery. Something in enyo is setting this width when I set game's width. So forcing it back to 0
		this.$.mainSlidingView.applyStyle("width", "0");
	},

	scrollMapToPlayer: function() {
		var newX, newY, playerPosition = this.$.me.getPosition();
		
		newX = this.mapMidpointX - playerPosition.x;
		if (newX > 0) {
			this.$.mapScroller.applyStyle("left", "0px");
		} else if (newX < this.mapMaxXScroll) {
			this.$.mapScroller.applyStyle("left", (this.mapMaxXScroll * MapLevel.kTileSize) + "px");
		} else {
			this.$.mapScroller.applyStyle("left", (newX * MapLevel.kTileSize) + "px");
		}
		
		newY = this.mapMidpointY - playerPosition.y;
		if (newY > 0) {
			this.$.mapScroller.applyStyle("top", "0px");
		} else if (newY < this.mapMaxYScroll) {
			this.$.mapScroller.applyStyle("top", (this.mapMaxYScroll * MapLevel.kTileSize) + "px");
		} else {
			this.$.mapScroller.applyStyle("top", (newY * MapLevel.kTileSize) + "px");
		}
	},
	
	/*
	 * Private functions go below here
	 */
	_handleKeypress: function(inSender, inDetails) {
		if (inDetails.type === "keyup") {
			var position = this.$.me.getPosition();
			
			switch (inDetails.keyIdentifier) {
			case "Up":
				this.$.me.interactWithMap(this.$.map, position.x, position.y-1, this.turnCount);
				break;
			case "Down":
				this.$.me.interactWithMap(this.$.map, position.x, position.y+1, this.turnCount);
				break;
			case "Left":
				this.$.me.interactWithMap(this.$.map, position.x-1, position.y, this.turnCount);
				break;
			case "Right":
				this.$.me.interactWithMap(this.$.map, position.x+1, position.y, this.turnCount);
				break;
			case "Home":
				this.$.me.interactWithMap(this.$.map, position.x-1, position.y-1, this.turnCount);
				break;
			case "PageUp":
				this.$.me.interactWithMap(this.$.map, position.x+1, position.y-1, this.turnCount);
				break;
			case "End":
				this.$.me.interactWithMap(this.$.map, position.x-1, position.y+1, this.turnCount);
				break;
			case "PageDown":
				this.$.me.interactWithMap(this.$.map, position.x+1, position.y+1, this.turnCount);
				break;
			}
			
			this._updateToobarButtons();
		}
	},

	_updateToobarButtons: function() {
		var tileKind, position = this.$.me.getPosition();
		tileKind = this.$.map.getTileKindAt(position.x, position.y);
		if (tileKind === MapTile.stairsDown.kind) {
			this.$.stairsUp.setShowing(false);
			this.$.stairsDown.setShowing(true);
		} else if (tileKind === MapTile.stairsUp.kind) {
			this.$.stairsUp.setShowing(true);
			this.$.stairsDown.setShowing(false);
		} else {
			this.$.stairsUp.setShowing(false);
			this.$.stairsDown.setShowing(false);
		}
	},

	_setMapScrollingBounds: function() {
		var innerTileWidth, innerTileHeight, bounds;
		bounds = this.$.mapScroller.getBounds();
		// For some reason, when the app is first launched after installation, the width is 2240px.
		// Until I can figure out why, I'm simulating the correct width by setting it to 75% of window.innerWidth
this.log(bounds); //TODO: remove this once the "initial size" bug is found
		if (bounds.width > 1024) {
			bounds.width = window.innerWidth * 0.75;
		}
		innerTileWidth = Math.floor(bounds.width / MapLevel.kTileSize);
		innerTileHeight = Math.floor(bounds.height / MapLevel.kTileSize);
		this.mapMaxXScroll = innerTileWidth - MapLevel.kMapWidth;
		this.mapMaxYScroll = innerTileHeight - MapLevel.kMapHeight;
		this.mapMidpointX = innerTileWidth / 2;
		this.mapMidpointY = innerTileHeight / 2;
		this.scrollMapToPlayer();
	},
	
	_showStatusText: function(inSender, inText) {
		if (inText) {
			this.statusText.unshift(inText);
			if (this.statusText.length > 100) {
				this.statusText.length = 100;
			}
			this.$.statusConsole.setContent(this.statusText.join("<br/>"));
		}
	},
	
	_showNoHandsAlert: function(inSender) {
		this.$.nohandsAlert.openAtCenter();
	},
	
	_closeNoHandsAlert: function() {
		this.$.nohandsAlert.close();
	},

	_restartGame: function() {
		this.$.gameOverDialog.close();
		this.startNewGame();
	},

	_updateKillList: function(inSender, inMonster) {
		if (this.killList[inMonster]) {
			this.killList[inMonster] += 1;
		} else {
			this.killList[inMonster] = 1;
		}
	}
});