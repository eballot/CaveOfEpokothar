
var kMonstersAtLevel = [
	/*1*/ ["cockroach", "mite", "rat", "spider", "worm"], //~13 defense
	/*2*/ ["spider", "worm", "dog", "goblin", "skeleton"],  //~15 defense
	/*3*/ ["dog", "goblin", "dwarf", "human", "walkingmushroom"], //~18 defense
	/*4*/ ["dwarf", "human", "walkingmushroom", "centaur", "wormspiny"], //~20
	/*5*/ ["centaur", "wormspiny", "halfling", "hobgoblin"], //~25
	/*6*/ ["dogwar", "orc", "orcwarrior"],
	/*7*/ ["dogwar", "orc", "orcwarrior"],
	/*8*/ ["dogwar", "humanarcher", "humanwarrior"],
	/*9*/ ["humanarcher", "humanknight", "humanwarrior"],
];

var kMonsterData = {
	epokothar:{
		monsterName:$L("Lord Epokothar"), xp:3, hpMin:5, hpRnd:3, defenses:{dodge:15, block:1, ac:1}, dex:15, hands:0, attacks:[{type:"bitesmall"}],
		img:"tiles/dc-mon0/epokothar.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	centaur:{
		monsterName:$L("Centaur"), xp:3, hpMin:2, hpRnd:7, defenses:{dodge:6, block:3, ac:10}, dex:8, hands:2, showEquippedImg:false,
		inventory:[{type:"longsword", category:"weapons", extras:{equipped:true}}],
		img:"tiles/dc-mon0/centaur_warrior.gif", corpse:"equine", corpseImg:"deadEquine"
	},
	cockroach:{
		monsterName:$L("Giant Cockroach"), xp:1, hpMin:1, hpRnd:3, defenses:{dodge:2, block:2, ac:10}, hands:0, attacks:[{type:"bitesmall", extras:{bonus:-2}}],
		img:"tiles/dc-mon0/giant_cockroach.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	dog:{
		monsterName:$L("Large Dog"), xp:2, hpMin:2, hpRnd:4, defenses:{dodge:8, block:0, ac:6}, hands:0, attacks:[{type:"bitemedium"}],
		img:"tiles/dc-mon0/hound.gif", corpse:"animalsmall", corpseImg:"deadDog"
	},
	dogwar:{
		monsterName:$L("War Dog"), xp:2, hpMin:3, hpRnd:4, defenses:{dodge:8, block:0, ac:9}, hands:0, attacks:[{type:"bitelarge"}],
		img:"tiles/dc-mon0/war_dog.gif", corpse:"animalsmall", corpseImg:"deadDog"
	},
	dwarf:{
		monsterName:$L("Dwarf"), xp:2, hpMin:2, hpRnd:6, defenses:{dodge:6, block:3, ac:9}, dex:9, hands:2, showEquippedImg:true,
		inventory:[{type:"handaxe", category:"weapons", extras:{equipped:true}}],
		img:"tiles/player/base/dwarf_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsblack"), head:new ItemModel("armor", "hornedhelm")},
		faceImg:"tiles/player/beard/long_red.gif"
	},
	goblin:{
		monsterName:$L("Goblin"), xp:2, hpMin:2, hpRnd:5, defenses:{dodge:5, block:4, ac:9}, dex:8, hands:2, showEquippedImg:true, wpnTopOffset:"4px",
		inventory:[{type:"shortsword", category:"weapons", extras:{equipped:true}}],
		img:"tiles/dc-mon0/goblin0.gif", corpse:"humanoid", corpseImg:"deadGoblin"
	},
	halfling:{
		monsterName:$L("Halfling"), xp:3, hpMin:2, hpRnd:5, defenses:{dodge:8, block:0, ac:8}, dex:12, hands:2, showEquippedImg:true,
		inventory:[{type:"dagger", category:"weapons"}, {type:"sling", category:"weapons", extras:{equipped:true}}, {type:"slingstone", category:"ammo", extras:{equipped:true, count:10}}],
		img:"tiles/player/base/halfling_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsbrown"), torso:new ItemModel("armor", "shirtvest")}
	},
	hobgoblin:{
		monsterName:$L("Hobgoblin"), xp:3, hpMin:2, hpRnd:7, defenses:{dodge:5, block:0, ac:11}, dex:8, hands:2, showEquippedImg:true,
		inventory:[{type:"waraxe", category:"weapons", extras:{equipped:true}}, {type:"shield", category:"armor", extras:{equipped:true}}],
		img:"tiles/dc-mon0/hobgoblin0.gif", corpse:"humanoid", corpseImg:"deadGoblin"
	},
	human:{
		monsterName:$L("Human"), xp:2, hpMin:2, hpRnd:6, defenses:{dodge:8, block:0, ac:10}, dex:12, hands:2, showEquippedImg:true,
		inventory:[{type:"shortsword", category:"weapons", extras:{equipped:true}}],
		img:"tiles/player/base/human_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsblack"), torso:new ItemModel("armor", "shirtwhite")}
	},
	humanarcher:{
		monsterName:$L("Human Archer"), xp:3, hpMin:3, hpRnd:6, defenses:{dodge:12, block:0, ac:6}, dex:18, hands:2, showEquippedImg:true,
		inventory:[{type:"longbow", category:"weapons", extras:{equipped:true}}, {type:"arrow", category:"ammo", extras:{equipped:true, count:14}}],
		img:"tiles/player/base/human_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsblack"), torso:new ItemModel("armor", "studdedleather")}
	},
	humanknight:{
		monsterName:$L("Human Knight"), xp:3, hpMin:3, hpRnd:6, defenses:{dodge:8, block:0, ac:5}, dex:12, hands:2, showEquippedImg:true,
		inventory:[{type:"heavymace", category:"weapons", extras:{equipped:true}}, {type:"fieldplate", category:"armor", extras:{equipped:true}}],
		img:"tiles/player/base/human_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "legarmor"), head:new ItemModel("armor", "fullhelm")}
	},
	humanwarrior:{
		monsterName:$L("Human Warrior"), xp:3, hpMin:2, hpRnd:6, defenses:{dodge:8, block:0, ac:2}, dex:12, hands:2, showEquippedImg:true,
		inventory:[{type:"spear", category:"weapons", extras:{equipped:true}}, {type:"scalemail", category:"armor", extras:{equipped:true}}],
		img:"tiles/player/base/human_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsblack"), torso:new ItemModel("armor", "shirtwhite")}
	},
	mite:{
		monsterName:$L("Giant Mite"), xp:2, hpMin:3, hpRnd:4, defenses:{dodge:0, block:5, ac:11}, hands:0, attacks:[{type:"bitesmall", extras:{bonus:-3}}],
		img:"tiles/dc-mon0/giant_mite.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	orc:{
		monsterName:$L("Orc"), xp:2, hpMin:2, hpRnd:7, defenses:{dodge:8, block:4, ac:9}, dex:12, hands:2, showEquippedImg:true, wpnTopOffset:"1px",
		inventory:[{type:"club", category:"weapons", extras:{equipped:true}}],
		img:"tiles/dc-mon0/orc0.gif", corpse:"humanoid", corpseImg:"deadOrc"
	},
	orcwarrior:{
		monsterName:$L("Orc Warrior"), xp:2, hpMin:4, hpRnd:7, defenses:{dodge:8, block:4, ac:11}, dex:12, hands:2, showEquippedImg:true, wpnTopOffset:"1px",
		inventory:[{type:"greataxe", category:"weapons", extras:{equipped:true}}],
		img:"tiles/dc-mon0/orc_warrior0.gif", corpse:"humanoid", corpseImg:"deadOrc"
	},
	rat:{
		monsterName:$L("Giant Rat"), xp:2, hpMin:1, hpRnd:4, defenses:{dodge:8, block:0, ac:5}, hands:0, attacks:[{type:"bitemedium"}],
		img:"tiles/dc-mon0/rat.gif", corpse:"animalsmall", corpseImg:"deadRatGray"
	},
	skeleton:{
		monsterName:$L("Skeleton"), xp:2, hpMin:2, hpRnd:4, defenses:{dodge:2, block:5, ac:11}, hands:0, attacks:[{type:"longsword"}],
		img:"tiles/dc-mon0/skeletal_warrior.gif"
	},
	spider:{
		monsterName:$L("Redback Spider"), xp:2, hpMin:3, hpRnd:4, defenses:{dodge:8, block:3, ac:3}, hands:0, attacks:[{type:"bitesmall", extras:{special:"poison", bonus:-1}}],
		img:"tiles/dc-mon0/redback.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	walkingmushroom:{
		monsterName:$L("Walking Mushroom"), xp:1, hpMin:4, hpRnd:6, defenses:{dodge:1, block:9, ac:9}, hands:0, attacks:[{type:"bludgeonlarge", extras:{bonus:-3}}],
		img:"tiles/dc-mon0/wandering_mushroom.gif"
	},
	worm:{
		monsterName:$L("Killer Worm"), xp:2, hpMin:8, hpRnd:5, defenses:{dodge:0, block:6, ac:8}, hands:0, attacks:[{type:"bitesmall", extras:{bonus:-2}}],
		img:"tiles/dc-mon0/worm.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	wormspiny:{
		monsterName:$L("Spiny Worm"), xp:2, hpMin:6, hpRnd:5, defenses:{dodge:0, block:6, ac:10}, hands:0, attacks:[{type:"spear", extras:{bonus:-1}}],
		img:"tiles/dc-mon0/spiny_worm.gif", corpse:"insectoid", corpseImg:"deadInsect"
	}

};