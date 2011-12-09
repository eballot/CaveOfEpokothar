
var kMonstersAtLevel = [
	/*1*/ ["cockroach", "dog", "mite", "rat", "skeleton", "spider", "worm"],
	/*2*/ ["dog", "dwarf", "goblin", "halfling", "rat", "skeleton", "spider", "worm", "walkingmushroom"],
	/*3*/ ["walkingmushroom", "dwarf", "goblin", "halfling", "human"],
	/*4*/ ["walkingmushroom", "centaur"]
];

var kMonsterData = {
	centaur:{
		monsterName:$L("Centaur"), xp:3, hpMin:2, hpRnd:7, defenses:{dodge:8, block:5, ac:10}, dex:8, hands:2, showEquippedImg:false,
		inventory:[{type:"longsword", category:"weapons", extras:{equipped:true}}],
		img:"tiles/dc-mon0/centaur_warrior.gif", corpse:"equine", corpseImg:"deadEquine"
	},
	cockroach:{
		monsterName:$L("Giant Cockroach"), xp:1, hpMin:1, hpRnd:3, defenses:{dodge:1, block:1, ac:10}, hands:0, attacks:[{type:"bitesmall", extras:{bonus:-2}}],
		img:"tiles/dc-mon0/giant_cockroach.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	dog:{
		monsterName:$L("Large Dog"), xp:2, hpMin:3, hpRnd:4, defenses:{dodge:10, block:0, ac:5}, hands:0, attacks:[{type:"bitemedium"}],
		img:"tiles/dc-mon0/hound.gif", corpse:"animalsmall", corpseImg:"deadDog"
	},
	dwarf:{
		monsterName:$L("Dwarf"), xp:2, hpMin:2, hpRnd:6, defenses:{dodge:10, block:3, ac:8}, dex:10, hands:2, showEquippedImg:true,
		inventory:[{type:"handaxe", category:"weapons", extras:{equipped:true}}],
		img:"tiles/player/base/dwarf_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsblack"), head:new ItemModel("armor", "hornedhelm")},
		faceImg:"tiles/player/beard/long_red.gif"
	},
	goblin:{
		monsterName:$L("Goblin"), xp:2, hpMin:2, hpRnd:5, defenses:{dodge:8, block:3, ac:8}, dex:8, hands:2, showEquippedImg:true, wpnTopOffset:"4px",
		inventory:[{type:"shortsword", category:"weapons", extras:{equipped:true}}],
		img:"tiles/dc-mon0/goblin0.gif", corpse:"humanoid", corpseImg:"deadGoblin"
	},
	halfling:{
		monsterName:$L("Halfling"), xp:2, hpMin:2, hpRnd:5, defenses:{dodge:13, block:0, ac:8}, dex:13, hands:2, showEquippedImg:true,
		inventory:[{type:"dagger", category:"weapons"}, {type:"sling", category:"weapons", extras:{equipped:true}}, {type:"slingstone", category:"ammo", extras:{equipped:true, count:10}}],
		img:"tiles/player/base/halfling_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsbrown"), torso:new ItemModel("armor", "shirtvest")}
	},
	human:{
		monsterName:$L("Human"), xp:2, hpMin:2, hpRnd:6, defenses:{dodge:12, block:0, ac:8}, dex:12, hands:2, showEquippedImg:true,
		inventory:[{type:"shortsword", category:"weapons", extras:{equipped:true}}],
		img:"tiles/player/base/human_m.gif", corpse:"humanoid", corpseImg:"deadHumanoidFlesh",
		defaultEquipped:{legs:new ItemModel("armor", "pantsblack")}
	},
	mite:{
		monsterName:$L("Giant Mite"), xp:2, hpMin:3, hpRnd:4, defenses:{dodge:4, block:5, ac:10}, hands:0, attacks:[{type:"bitesmall", extras:{bonus:-2}}],
		img:"tiles/dc-mon0/giant_mite.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	rat:{
		monsterName:$L("Giant Rat"), xp:2, hpMin:2, hpRnd:4, defenses:{dodge:10, block:0, ac:5}, hands:0, attacks:[{type:"bitemedium"}],
		img:"tiles/dc-mon0/rat.gif", corpse:"animalsmall", corpseImg:"deadRatGray"
	},
	skeleton:{
		monsterName:$L("Skeleton"), xp:1, hpMin:2, hpRnd:4, defenses:{dodge:1, block:5, ac:10}, hands:0, attacks:[{type:"longsword"}],
		img:"tiles/dc-mon0/skeletal_warrior.gif"
	},
	spider:{
		monsterName:$L("Redback Spider"), xp:1, hpMin:3, hpRnd:4, defenses:{dodge:7, block:0, ac:5}, hands:0, attacks:[{type:"bitesmall", extras:{special:"poison", bonus:-1}}],
		img:"tiles/dc-mon0/redback.gif", corpse:"insectoid", corpseImg:"deadInsect"
	},
	walkingmushroom:{
		monsterName:$L("Walking Nushroom"), xp:1, hpMin:4, hpRnd:6, defenses:{dodge:1, block:9, ac:10}, hands:0, attacks:[{type:"bludgeonlarge", extras:{bonus:-3}}],
		img:"tiles/dc-mon0/wandering_mushroom.gif"
	},
	worm:{
		monsterName:$L("Killer Worm"), xp:2, hpMin:8, hpRnd:5, defenses:{dodge:0, block:6, ac:5}, hands:0, attacks:[{type:"bitesmall", extras:{bonus:-2}}],
		img:"tiles/dc-mon0/worm.gif", corpse:"insectoid", corpseImg:"deadInsect"
	}
};