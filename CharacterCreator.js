/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

var kPlayerClasses = [{
	className: $L("human warrior"), description: $L("A human warrior trained to fight with a shield and various types of melee weapons"),
	race: "human", focus: "warrior"
}, {
	className: $L("dwarven warrior"), description: $L("A dwarven warrior, well versed with axe and armor."),
	race: "dwarf", focus: "warrior"
}, {
	className: $L("ranger"), description: $L("A ranger who is skilled with a bow and a sword, but not heavy armor"),
	race: "human", focus: "ranger"
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
//			sneakAttack: {lvl:1, xp:0}
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
				onclick: "_equipmentListItemClick",
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

	_equipmentListItemClick: function(inSender, inEvent) {
		var playerClass = kPlayerClasses[inEvent.rowIndex];
		if (playerClass) {
			var player = {
				level: 1,
				inventory: [],
				skills: {}
			};
			player.race = playerClass.race;
			
			// Fill in the details for the player
			this[playerClass.focus](player);
			playerClass.player = player;
			this.doSelect(playerClass);
			this.close();
		}
	},
	
	warrior: function(player) {
		if (player.race === "dwarf") {
			player.dex = 8;
			player.str = 18;
			player.int = 5;
			player.inventory = [
				new ItemModel("weapons", "handaxe", {equipped:true}),
				new ItemModel("weapons", "handaxe"),
				new ItemModel("armor", "studdedleather", {equipped:true}),
				new ItemModel("armor", "leathercap", {equipped:true}),
				new ItemModel("armor", "pantsbrown", {equipped:true}),
				new ItemModel("food", "bread"),
			];
			player.skills = {
				axe: {lvl:1, xp:0},
				thrown: {lvl:1, xp:0},
				armor: {lvl:1, xp:0},
				shield: {lvl:1, xp:0}
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
				sword: {lvl:1, xp:0},
				spear: {lvl:1, xp:0},
				armor: {lvl:1, xp:0},
				shield: {lvl:1, xp:0}
			};
		}
	},
	
	ranger: function(player) {
		if (player.race === "elf") {
			player.dex = 18;
			player.str = 8;
			player.int = 5;
			player.inventory = [
				new ItemModel("weapons", "shortsword"),
				new ItemModel("weapons", "shortbow", {equipped:true}),
				new ItemModel("ammo", "arrow", {count:20, equipped:true}),
				new ItemModel("armor", "leather", {equipped:true}),
				new ItemModel("armor", "pantsbrown", {equipped:true}),
				new ItemModel("food", "bread")
			];
			player.skills = {
				sword: {lvl:1, xp:0},
				bow: {lvl:1, xp:0},
				dagger: {lvl:1, xp:0},
				dodge: {lvl:1, xp:0}
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
				sword: {lvl:1, xp:0},
				bow: {lvl:1, xp:0},
				dagger: {lvl:1, xp:0},
				dodge: {lvl:1, xp:0}
			};
		}
	}
});
