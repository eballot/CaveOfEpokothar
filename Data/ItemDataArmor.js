kItemsData.armor = {
	/** Clothing **/
	pantsblack: {
		displayName: $L("Black pants"),
		type:"pantsblack", category:"armor", slot:"legs", easy:true, defense:1, flexibility:1, dexpenalty:0, weight:1, value:1,/*gp*/
		img: "tiles/player/leg/pants_black.gif",
		description: $L("Just your standard durable pants.")
	},
	pantsblue: {
		displayName: $L("Blue pants"),
		type:"pantsblue", category:"armor", slot:"legs", easy:true, defense:1, flexibility:1, dexpenalty:0, weight:1, value:1,/*gp*/
		img: "tiles/player/leg/pants_blue.gif",
		description: $L("Just your standard durable pants.")
	},
	pantsbrown: {
		displayName: $L("Brown pants"),
		type:"pantsbrown", category:"armor", slot:"legs", easy:true, defense:1, flexibility:1, dexpenalty:0, weight:1, value:1,/*gp*/
		img: "tiles/player/leg/pants_brown.gif",
		description: $L("Just your standard durable pants.")
	},
		
	/** Body armor **/
	leather: {
		displayName: $L("Leather"),
		type:"leather", category:"armor", skill:"armor", slot:"torso", easy:true, defense:4, flexibility:1, dexpenalty:0, weight:15, value:10,/*gp*/
		img: "tiles/player/body/leather_armour.gif",
		description: $L("This armor is made of stiffened leather. Armor skill is not required to effectively use leather armor.")
	},
	studdedleather: {
		displayName: $L("Studded Leather"),
		type:"studdedleather", category:"armor", skill:"armor", slot:"torso", defense:6, flexibility:0.9, dexpenalty:-1, weight:20, value:25,/*gp*/
		img: "tiles/player/body/leather_stud.gif",
		description: $L("This armor has hundreds of small metal rivets attached to soft leather.")
	},
	scalemail: {
		displayName: $L("Scale Mail"),
		type:"scalemail", category:"armor", skill:"armor", slot:"torso", defense:8, flexibility:0.6, dexpenalty:-4, weight:30, value:50,/*gp*/
		img: "tiles/player/body/scalemail2.gif",
		description: $L("This is coat of soft leather covered with overlapping pieces of metal.")
	},
	chainmail: {
		displayName: $L("Chain mail"),
		type:"chainmail", category:"armor", skill:"armor", slot:"torso", defense:10, flexibility:0.5, dexpenalty:-5, weight:40, value:150,/*gp*/
		img: "tiles/player/body/chainmail2.gif",
		description: $L("This armor is made of interlocking metal rings worn over soft leather.")
	},
	fieldplate: {
		displayName: $L("Field plate mail"),
		type:"fieldplate", category:"armor", skill:"armor", slot:"torso", defense:14, flexibility:0.3, dexpenalty:-7, weight:50, value:600,/*gp*/
		img: "tiles/player/body/plate_and_cloth2.gif",
		description: $L("Field plate mail consists of chain mail armor plus interlocking metal plates protecting the torso and shoulders.")
	},

	/** Shields **/
//	buckler: {
//		displayName: $L("Buckler"),
//		type:"buckler", category:"armor", skill:"shield", weight:5, value:15,/*gp*/
//		hands:0, slot:"shield", defense:1, block:1, dexpenalty:0,
//		img: "tiles/player/hand2/bullseye.gif",
//		description: $L("This small metal shield is worn strapped to your forearm, but leaving the hand free.")
//	},
	smallshield: {
		displayName: $L("Small shield"),
		type:"smallshield", category:"armor", skill:"shield", weight:6, value:9,/*gp*/
		hands:1, slot:"shield", defense:0, block:3, dexpenalty:0,
		img: "tiles/player/hand2/shield_round_small.gif",
		description: $L("A small metal shield strapped to the forearm and gripped with the hand.")
	},
	shield: {
		displayName: $L("Shield"),
		type:"shield", category:"armor", skill:"shield", weight:15, value:25,/*gp*/
		hands:1, slot:"shield", defense:0, block:6, dexpenalty:0,
		img: "tiles/player/hand2/shield_knight_blue.gif",
		description: $L("A large metal shield strapped to the forearm and gripped with the hand.")
	},
	
	/** Helmets **/
	leathercap: {
		displayName: $L("Leather cap"),
		type:"leathercap", category:"armor", slot:"head", easy:true, defense:1, flexibility:1, dexpenalty:0, weight:2, value:10,/*gp*/
		img: "tiles/player/head/taiso_red.gif",
		description: $L("A cap made of stiffened leather that provides a small amount of protection.")
	},
//	chaincoif: {
//		displayName: $L("Chain coif"),
//		type:"chaincoif", category:"armor", slot:"head", easy:true, defense:1, flexibility:1, dexpenalty:0, weight:2, value:10,/*gp*/
//		img: "tiles/player/head/hood_gray.gif",
//		description: $L("A coif covers the head and neck.")
//	},
	ironhelm: {
		displayName: $L("Iron helmet"),
		type:"ironhelm", category:"armor", slot:"head", easy:true, defense:2, flexibility:1, dexpenalty:0, weight:5, value:30,/*gp*/
		img: "tiles/player/head/iron1.gif",
		description: $L("This is a simple helmet made of iron.")
	},
	fullhelm: {
		displayName: $L("Full iron helmet"),
		type:"fullhelm", category:"armor", slot:"head", defense:4, flexibility:0.9, dexpenalty:0, weight:10, value:30,/*gp*/
		img: "tiles/player/head/iron3.gif",
		description: $L("A full iron helmet protects the entire head and face, but limits visibility.")
	},
	hornedhelm: {
		displayName: $L("Horned helmet"),
		type:"hornedhelm", category:"armor", slot:"head", easy:true, defense:1, flexibility:1, dexpenalty:0, weight:8, value:10,/*gp*/
		img: "tiles/player/head/horned.gif",
		description: $L("A helmet with large horns attached.")
	}
};