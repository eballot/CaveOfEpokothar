/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

var kPlayerClasses = [{
	className: $L("human warrior"), description: $L("A human warrior trained to fight with a shield and various types of melee weapons."),
	race: "human", focus: "warrior"
}, {
	className: $L("dwarven warrior"), description: $L("A dwarven warrior, well versed with axe and armor."),
	race: "dwarf", focus: "warrior"
}, {
	className: $L("human ranger"), description: $L("A human ranger who is skilled with a bow and a sword, but not heavy armor."),
	race: "human", focus: "ranger"
}, {
	className: $L("halfling slinger"), description: $L("A halfling slinger. Slight of stature, but inately skilled at using slings and daggers."),
	race: "halfling", focus: "ranger"
//}, {
//	className: $L("rogue"), description: $L("A rogue who prefers to sneak up and ambush foes or kill them from a distance"),
//	player: {
//		race: "human",
//		level: 1,
//		dex: 15,
//		str: 10,
//		int: 5,
//		inventory: [
//			new ItemModel("weapons", "dagger"),
//			new ItemModel("weapons", "shortbow", {equipped:true}),
//			new ItemModel("ammo", "arrow", {count:15, equipped:true}),
//			new ItemModel("armor", "leather", {equipped:true}),
//			new ItemModel("armor", "pantsblue", {equipped:true}),
//			new ItemModel("food", "bread")
//		],
//		skills: {
//			dagger: {lvl:1, xp:0},
//			bow: {lvl:1, xp:0},
//			dodge: {lvl:1, xp:0},
//			stealth: {lvl:1, xp:0}
//		}
//	}
}];

enyo.kind({
	name: "CharacterCreator",
	kind: enyo.Popup,
	width: "100%",
	modal: true,
	dismissWithClick: false,
//	style: "background-color:#717171; color:white;",
	openClassName: "help-container",
	published: {
		player: null
	},
	events: {
		onSelect: ""
	},
	components: [{
		kind: "AboutCore"
	}, {
		kind: enyo.Control,
		className: "help-body-title",
		content: $L("Choose Character")
	}, {
		kind: enyo.Control,
		className: "help-body-text",
		allowHTML: true,
		content: $L("Chose the type of character you would like to play.")
	}, {
		className: "enyo-group enyo-roundy",
		style: "margin:0",
		components: [{
			name: "characterList",
			kind: enyo.VirtualRepeater,
			flex: 1,
			style: "margin-top:-8px;",
			onSetupRow: "_setupRow",
			components: [{
				name: "playerClassItem",
				kind: enyo.Item,
				tapHighlight: true,
				onclick: "_playerClassClick",
				components: [{
					kind: enyo.HFlexBox,
					components: [{
						name: "classDescription",
						kind: enyo.Control,
						flex: 1
					}]
				}]
			}]
		}]
	}, {
		name: "difficulty",
		kind: enyo.PopupSelect,
		onSelect: "_difficultySelected",
		modal: true,
		dismissWithClick: false,
		dismissWithEscape: false,
		scrim: true,
		items: [{
			caption: $L("Easy"), difficulty:3
		}, {
			caption: $L("Moderate"), difficulty:2
		}, {
			caption: $L("Difficult"), difficulty:1
		}]
	}],
	
	_setupRow: function(inSender, inIndex) {
		var playerClass = kPlayerClasses[inIndex];
		if (playerClass) {
			if (inIndex === 0) {
				this.$.playerClassItem.addClass("enyo-first");
			} else if (inIndex === kPlayerClasses.length - 1) {
				this.$.playerClassItem.addClass("enyo-last");
			}
			
			this.$.classDescription.setContent(playerClass.description);
		}
		
		return !!playerClass;
	},

	_playerClassClick: function(inSender, inEvent) {
		this.playerClass = kPlayerClasses[inEvent.rowIndex];
		if (this.playerClass) {
			this.$.difficulty.openAtCenter();
		}
	},
	
	_difficultySelected: function(inSender, inItem) {
		var player = {
			level: 1,
			inventory: [],
			skills: {}
		};
		player.race = this.playerClass.race;
		player.difficulty = inItem.difficulty || 1;
		
		// Fill in the details for the player
		this[this.playerClass.focus](player);
		this.playerClass.player = player;
		
		this.doSelect(this.playerClass);
		this.close();
	},
	
	warrior: function(player) {
		if (player.race === "dwarf") {
			player.dex = 9;
			player.str = 18;
			player.int = 5;
			player.inventory = [
				new ItemModel("weapons", "handaxe", {equipped:true}),
				new ItemModel("weapons", "handaxe"),
				new ItemModel("weapons", "handaxe"),
				new ItemModel("armor", "studdedleather", {equipped:true}),
				new ItemModel("armor", "hornedhelm", {equipped:true}),
				new ItemModel("armor", "pantsbrown", {equipped:true}),
				new ItemModel("food", "bread"),
			];
			player.skills = {
				fight: {lvl:player.difficulty, xp:0},
				axe: {lvl:player.difficulty, xp:0},
				thrown: {lvl:player.difficulty, xp:0},
				armor: {lvl:player.difficulty, xp:0},
				shield: {lvl:player.difficulty, xp:0}
			};
		} else {
			// Default is human
			player.dex = 10;
			player.str = 15;
			player.int = 5;
			player.inventory = [
				new ItemModel("weapons", "spear"),
				new ItemModel("weapons", "shortsword", {equipped:true}),
				new ItemModel("armor", "studdedleather", {equipped:true}),
				new ItemModel("armor", "smallshield", {equipped:true}),
				new ItemModel("armor", "pantsblue", {equipped:true}),
				new ItemModel("food", "bread"),
			];
			player.skills = {
				fight: {lvl:player.difficulty, xp:0},
				sword: {lvl:player.difficulty, xp:0},
				spear: {lvl:player.difficulty, xp:0},
				armor: {lvl:player.difficulty, xp:0},
				shield: {lvl:player.difficulty, xp:0}
			};
		}
	},
	
	ranger: function(player) {
		if (player.race === "halfling") {
			player.dex = 16;
			player.str = 8;
			player.int = 7;
			player.inventory = [
				new ItemModel("weapons", "dagger"),
				new ItemModel("weapons", "sling", {equipped:true}),
				new ItemModel("ammo", "slingbullet", {count:12, equipped:true}),
				new ItemModel("armor", "smallshield", {equipped:true}),
				new ItemModel("armor", "pantsbrown", {equipped:true}),
				new ItemModel("food", "bread")
			];
			player.skills = {
				fight: {lvl:player.difficulty, xp:0},
				sling: {lvl:player.difficulty, xp:0},
				dagger: {lvl:player.difficulty, xp:0},
				shield: {lvl:player.difficulty, xp:0},
				dodge: {lvl:player.difficulty, xp:0}
			};
		} else {
			// Default is human
			player.dex = 15;
			player.str = 10;
			player.int = 5;
			player.inventory = [
				new ItemModel("weapons", "shortsword"),
				new ItemModel("weapons", "shortbow", {equipped:true}),
				new ItemModel("ammo", "arrow", {count:20, equipped:true}),
				new ItemModel("armor", "leather", {equipped:true}),
				new ItemModel("armor", "pantsblue", {equipped:true}),
				new ItemModel("food", "bread")
			];
			player.skills = {
				fight: {lvl:player.difficulty, xp:0},
				sword: {lvl:player.difficulty, xp:0},
				bow: {lvl:player.difficulty, xp:0},
				dagger: {lvl:player.difficulty, xp:0},
				dodge: {lvl:player.difficulty, xp:0}
			};
		}
	}
});
