kItemsData.weapons = {
	// Melee weapons (may also be thrown)
	club: {
		displayName: $L("Club"),
		type: "club", category:"weapons", slot:"weapon", skill: "club", attackActions: "blunt", weight:3, value:0.1,/*gp*/
		hands:1, accuracy:10, damageMin:1, damageRnd:5, meleeReach:1, rangeReach:8, rangeAccuracy:2,
		img: "tiles/player/hand1/club_slant.gif",
		description: $L("A piece of wood.")
	},
	dagger: {
		displayName: $L("Dagger"),
		type: "dagger", category:"weapons", slot:"weapon", skill: "dagger", attackActions: "dagger", weight:1, value:2,/*gp*/
		hands:1, accuracy:10, damageMin:1, damageRnd:3, meleeReach:1, rangeReach:8, rangeAccuracy:2,
		img: "tiles/player/hand1/dagger.gif",
		description: $L("A fighting knife with a sharp point for thrusting or stabbing.")
	},
	handaxe: {
		displayName: $L("Handaxe"),
		type: "handaxe", category:"weapons", slot:"weapon", skill: "axe", attackActions: "axe", weight:3, value:6,/*gp*/
		hands:1, accuracy:10, damageMin:1, damageRnd:5, meleeReach:1, rangeReach:8, rangeAccuracy:2,
		img: "tiles/player/hand1/hand_axe.gif",
		description: $L("A small axe used for chopping wood or foes.")
	},	
	longsword: {
		displayName: $L("Longsword"),
		type: "longsword", category:"weapons", slot:"weapon", skill: "sword", attackActions: "sword", weight:4, value:15,/*gp*/
		hands:1, accuracy:10, damageMin:1, damageRnd:7, meleeReach:1, rangeReach:6, rangeAccuracy:1,
		img: "tiles/player/hand1/long_sword.gif",
		description: $L("A double-edged sword about 3 feet long.")
	},
	shortsword: {
		displayName: $L("Short sword"),
		type: "shortsword", category:"weapons", slot:"weapon", skill: "sword", attackActions: "sword", weight:2, value:8,/*gp*/
		hands:1, accuracy:10, damageMin:1, damageRnd:5, meleeReach:1, rangeReach:6, rangeAccuracy:1,
		img: "tiles/player/hand1/short_sword.gif",
		description: $L("A pointed and edged sword 2 feet long.")
	},
	spear: {
		displayName: $L("Spear"),
		type: "spear", category:"weapons", slot:"weapon", skill: "spear", attackActions: "pierce", weight:6, value:0.1,/*gp*/
		hands:2, accuracy:10, damageMin:1, damageRnd:7, meleeReach:2, rangeReach:16, rangeAccuracy:4,
		img: "tiles/player/hand1/spear1.gif",
		description: $L("A pole weapon consisting of a wood shaft with a pointed head. A spear can be thrown.")
	},
	
	// Ranged weapons
	longbow: {
		displayName: $L("Longbow"),
		type: "longbow", category:"weapons", slot:"weapon", skill: "bow", ammo: "arrow", attackActions: "pierce", weight:3, value:75,/*gp*/
		hands:2, accuracy:10, damageMin:1, damageRnd:7, meleeReach:-1, rangeReach:20, rangeAccuracy:10,
		img: "tiles/player/hand1/bow3.gif",
		description: $L("A bow for shooting arrows.")
	},
	shortbow: {
		displayName: $L("Shortbow"),
		type: "shortbow", category:"weapons", slot:"weapon", skill: "bow", ammo: "arrow", attackActions: "pierce", weight:2, value:30,/*gp*/
		hands:2, accuracy:10, damageMin:1, damageRnd:5, meleeReach:-1, rangeReach:16, rangeAccuracy:8,
		img: "tiles/player/hand1/bow_short.gif",
		description: $L("A bow for shooting arrows.")
	}
};

//Intrinisic attacks
//The following are intrinsic weapons so they must not be enumerable
Object.defineProperty(kItemsData.weapons, 
	"fist", {
	enumerable: false,
	value: {
		displayName: $L("Fist"),
		type: "fist", category:"weapons", slot:"weapon", attackActions: "hand", weight:0, 
		hands:0, accuracy:10, damageMin:1, damageRnd:2, meleeReach:1
	}
});

Object.defineProperty(kItemsData.weapons, 
	"foot", {
	enumerable: false,
	value: {
		displayName: $L("Foot"),
		type: "foot", category:"weapons", slot:"weapon", attackActions: "foot", weight:0, 
		hands:0, accuracy:10, damageMin:1, damageRnd:3, meleeReach:1
	}
});

Object.defineProperty(kItemsData.weapons, 
	"bitesmall", {
	enumerable: false,
	value: {
		displayName: $L("Bite"),
		type: "bitesmall", category:"weapons", slot:"weapon", attackActions: "bite", weight:0, 
		hands:0, accuracy:10, damageMin:1, damageRnd:2, meleeReach:1
	}
});

Object.defineProperty(kItemsData.weapons, 
	"bitemedium", {
	enumerable: false,
	value: {
		displayName: $L("Bite"),
		type: "bitemedium", category:"weapons", slot:"weapon", attackActions: "bite", weight:0, 
		hands:0, accuracy:10, damageMin:1, damageRnd:3, meleeReach:1
	}
});

Object.defineProperty(kItemsData.weapons, 
	"bitelarge", {
	enumerable: false,
	value: {
		displayName: $L("Bite"),
		type: "bitelarge", category:"weapons", slot:"weapon", attackActions: "bite", weight:0, 
		hands:0, accuracy:10, damageMin:1, damageRnd:5, meleeReach:1
	}
});

Object.defineProperty(kItemsData.weapons, 
		"bludgeonlarge", {
		enumerable: false,
		value: {
			displayName: $L("Bludgeon"),
			type: "bludgeonlarge", category:"weapons", slot:"weapon", attackActions: "blunt", weight:0, 
			hands:0, accuracy:10, damageMin:2, damageRnd:9, meleeReach:1
		}
	});
