

var MonsterModel = function(details) {
	var i, arrayLen, inventoryIndex, inventoryLen, slot, item, itemExtras, t;
	t = kMonsterData[details.race || "human"];
	this.template = t;
	
	this.effectsServant = new EffectsServant(this);
	
	this.damageTaken = 0;
	this.hunger = MonsterModel.hunger.satiatedLevel; // start out at the high end of hungry
	this.experience = 0;
	this.difficulty = details.difficulty || 1;
	
	this.equippedItems = {
			cloak: undefined,
			glove: undefined,
			head: undefined,
			legs: undefined,
			quiver: undefined,
			rings: [undefined, undefined],
			shield: undefined, //hand2
			shoes: undefined,
			torso: undefined,
			weapon: undefined //hand1
	};
	
	// These could override the above properties if restored from file
	if (details) {
		for (var key in details) {
			if (details.hasOwnProperty(key)) {
				this[key] = details[key];
			}
		}
	}

	this.learnSkillChance = 0.3 + 0.2 * this.difficulty;
	
	// hp will be restored if loading from db, otherwise need to generate it now
	// that other attributes have been set
	if (!this.hp) {
		if (this.level) {
			this.hp = 0;
			for (i = 0; i < this.level; i++) {
				this.hp += this._generateHP();
			}
		} else {
			this.hp = this._generateHP();
		}
	}

	if (!this.inventory && t.inventory) {
		this.inventory = [];
		arrayLen = t.inventory.length;
		for (i = 0; i < arrayLen; i++) {
			item = t.inventory[i];
			if (item.extras) {
				// make a copy of extras since the template needs to remain unchanged
				itemExtras = {};
				for (var key in item.extras) {
					itemExtras[key] = item.extras[key];
				}
			} else {
				itemExtras = undefined;
			}
			this.inventory.push(new ItemModel(item.category, item.type, itemExtras));
		}
	}
	
	this.intrinsicAttacks = [];
	if (t.attacks) {
		arrayLen = t.attacks.length;
		for (i = 0; i < arrayLen; i++) {
			this.intrinsicAttacks.push(new ItemModel("weapons", t.attacks[i].type, t.attacks[i].extras));
		}
	}
	
	this.weight = 0;
	if (this.inventory) {
		inventoryLen = this.inventory.length;
		for (inventoryIndex = 0; inventoryIndex < inventoryLen; inventoryIndex++) {
			item = this.inventory[inventoryIndex];
			this.weight += item.getWeight();
			if (item && item.isEquipped()) {
				slot = item.getEquippedSlot();
				this.equippedItems[slot] = item;
			}
		}
		
		this._calculateDefenses();
	}
};


MonsterModel.hunger = {
	maxLevel: 5000,
	satiatedLevel: 5000,
	fullLevel: 4000,
	hungryLevel: 3000,
	ravenousLevel: 2000,
	starvingLevel: 1000,
	
	rest: -1,
	walkNormal: -2,
	autoHeal: -2,
	walkEncumbered: -3,
	fight: -5,
	castSpell: -5
};

MonsterModel.hungerStrings = {
	starving: $L("Starving"),
	ravenous: $L("Ravenous"),
	hungry: $L("Hungry"),
	full: $L("Full"),
	satiated: $L("Satiated")
};

var kModelKeyTypes = {
	raw: 0, //number or boolean
	string: 1,
	array: 2,
	object: 3
};

MonsterModel.expLevels = [
	-1, // level 0 doesn't really exist
	0,      //1
	15,     //2
	40,     //3
	75,     //4
	140,    //5
	270,    //6
	520,    //7
	1010,   //8
	1980,   //9
	3910,   //10
	7760,   //11
	15450,  //12
	29000,  //13
	48500,  //14
	74000,  //15
	105500, //16
	143000, //17
	186500, //18
	236000, //19
	291500, //20
	353000, //21
	420500, //22
	494000, //23
	573500, //24
	659000, //25
	750500, //26
	848000, //27
	948000  //29
];

MonsterModel.expNeeded = function(targetLevel) {
	// if each level>29, requires additional 100,000 exp.
	if (targetLevel > 29) {
		return 948000 + (targetLevel - 29) * 100000;
	} else {
		return MonsterModel.expLevels[targetLevel];
	}
};


MonsterModel.propertiesToSave = [
	{ key:"attitude",    type:kModelKeyTypes.string },
	{ key:"damageTaken", type:kModelKeyTypes.raw },
	{ key:"defenses",    type:kModelKeyTypes.object },
	{ key:"dex",         type:kModelKeyTypes.raw },
	{ key:"difficulty",  type:kModelKeyTypes.raw },
	{ key:"disease",     type:kModelKeyTypes.raw },
	{ key:"inebriated",  type:kModelKeyTypes.raw },
	{ key:"experience",  type:kModelKeyTypes.raw },
	{ key:"hp",          type:kModelKeyTypes.raw },
	{ key:"hunger",      type:kModelKeyTypes.raw },
	{ key:"int",         type:kModelKeyTypes.raw },
	{ key:"inventory",   type:kModelKeyTypes.array },
	{ key:"isPlayer",    type:kModelKeyTypes.raw },
	{ key:"level",       type:kModelKeyTypes.raw },
	{ key:"poison",      type:kModelKeyTypes.raw },
	{ key:"race",        type:kModelKeyTypes.string },
	{ key:"resistances", type:kModelKeyTypes.object },
	{ key:"skills",      type:kModelKeyTypes.object },
	{ key:"effects",     type:kModelKeyTypes.object },
	{ key:"str",         type:kModelKeyTypes.raw },
];


MonsterModel.prototype.saveToString = function() {
	// TODO: Save name, etc.
	// Manually generating the JSON string since not all object properties should be saved
	var index, ptosave, propList = [], property;
	for (index in MonsterModel.propertiesToSave) {
		ptosave = MonsterModel.propertiesToSave[index];
		property = this[ptosave.key];
		if (property) {
			switch (ptosave.type) {
			case kModelKeyTypes.raw:
				propList.push('"'+ptosave.key+'":'+property);
				break;
			case kModelKeyTypes.array:
				propList.push('"'+ptosave.key+'":['+property.toString()+']');
				break;
			case kModelKeyTypes.object:
				propList.push('"'+ptosave.key+'":'+JSON.stringify(property));
				break;
			default:
			case kModelKeyTypes.string:
				propList.push('"'+ptosave.key+'":"'+property+'"');
				break;
			}
		}
	}
	return "{" + propList.toString() + "}";
};

MonsterModel.loadFromString = function(s) {
	var data, model = null;
	if (s) {
		try {
			data = JSON.parse(s);
			model = MonsterModel.loadFromObject(data);
		} catch(e) {
			console.error("MonsterModel load failure: "+e.toString());
		}
	}
	
	return model;
};

MonsterModel.loadFromObject = function(o) {
	var i, arrayLen, item;
	if (o.inventory) {
		arrayLen = o.inventory.length;
		for (i = 0; i < arrayLen; i++) {
			item = o.inventory[i];
			o.inventory[i] = new ItemModel(item.category, item.type, item.extras);
		}
	}
	return new MonsterModel(o);
};

MonsterModel.prototype.setEffectChangedCallback = function(callback) {
	this.effectChangedCallback = callback;
};

MonsterModel.prototype.getGraphic = function() {
	return this.template.img;
};

MonsterModel.prototype.getFaceGraphic = function() {
	return this.template.faceImg || "$base-themes-default-theme/images/blank.gif";
};

MonsterModel.prototype.getDisplayName = function(short) {
	//TODO: for now just display the name, but later, need this to include
	//equipment and attitude if short!==true
	return this.template.monsterName;
};

MonsterModel.prototype.getCorpse = function() {
	if (this.template.corpse && this.damageTaken < (this.hp * 2) && Math.random() < 0.4) {
		return this.template.corpse;
	} else {
		return null;
	}
};

MonsterModel.prototype.getCorpseItem = function() {
	var extras, corpse;
	corpse = this.getCorpse();
	if (corpse) {
		monsterName = this.getDisplayName(true);
		extras = {
			monsterName: this.getDisplayName(true),
			tileImg: this.getTileImg(),
			deathTurn: GameMain.turnCount
		};
		
		if (this.template.disease) {
			extras.disease = this.template.disease;
		}
		
		return new ItemModel("corpse", corpse, extras);
	} else {
		return null;
	}
};

MonsterModel.prototype.getTileImg = function() {
	return this.template.corpseImg;
};

MonsterModel.prototype.getDeathXp = function() {
	return (this.level * this.template.xp) || 1;
};

MonsterModel.prototype.getExperience = function(xp) {
	return this.experience;
};

MonsterModel.prototype.getExpToNextLevel = function(asPercentage) {
	var current, next = MonsterModel.expNeeded(this.getLevel() + 1);
	if (asPercentage) {
		current = MonsterModel.expNeeded(this.getLevel());
		return Math.floor(100 * (this.experience - current) / (next - current));
	} else {
		return next - this.experience;
	}
};

MonsterModel.prototype.getLevel = function() {
	return this.level || 0;
};

MonsterModel.prototype.addExperience = function(xp) {
	var level, neededXp, levelChanged = false;
	this.experience += xp;
	
	level = this.level || 1;
	do {
		neededXp = MonsterModel.expNeeded(++level);
		if (neededXp <= this.experience) {
			this.level = level;
			// Leveling up includes more HP
			this.hp += this._generateHP();
			levelChanged = true;
		}
	} while (neededXp < this.experience);
	
	return levelChanged;
};

MonsterModel.prototype.getAttitude = function() {
	return this.attitude || "hostile";
};

MonsterModel.prototype.setAttitude = function(attitude) {
	if (attitude !== "hostile" && attitude !== "neutral" && attitude !== "friendly") {
		console.error("Don't know "+attitude+" so assuming 'hostile'");
		this.attitude = "hostile";
	} else {
		this.attitude = attitude;
	}
};

MonsterModel.prototype.canUseItems = function() {
	if (this.hands !== undefined) {
		return this.hands > 0;
	} else {
		return this.template.hands > 0;
	}
};

MonsterModel.prototype.numHands = function() {
	return this.hands || this.template.hands;
};

MonsterModel.prototype.equipAnItem = function(inventoryIndex) {
	var success = true, item, slot;
	if (this.inventory && inventoryIndex < this.inventory.length) {
		item = this.inventory[inventoryIndex];
		slot = item.getEquippedSlot();

		if ((slot === "shield" || slot === "weapon") && !this._hasFreeHandsToEquip(item, slot)) {
			success = false; // "not enough hands"
		} else {
			if (this.equippedItems[slot]) {
				this.equippedItems[slot].setEquipped(false);
			}
			this.equippedItems[slot] = item;
			item.setEquipped(true);

			this._calculateDefenses();
		}
	}
	
	return success;
};

MonsterModel.prototype.unequipAnItem = function(inventoryIndex) {
	var item, slot, needToRecalcDefenses = false;
	if (this.inventory && inventoryIndex < this.inventory.length) {
		item = this.inventory[inventoryIndex];
		slot = item.getEquippedSlot();
		if (item === this.equippedItems[slot]) {
			needToRecalcDefenses = true;
			this.equippedItems[slot] = undefined;
		}
		item.setEquipped(false);
		if (needToRecalcDefenses) {
			this._calculateDefenses();
		}
	}
};

MonsterModel.prototype.maybeIdentify = function(slot, bonus) {
	var i, item, slots;
	if (slot === "armor") {
		// identify one of the armor slots
		slots = ["torso", "head", "glove", "shoes", "cloak"];
	} else {
		slots = [slot];
	}

	for (i = 0; i < slots.length; i++) {
		item = this.equippedItems[slots[i]];
		if (item && item.magicUnidentified()) {
			if (item.identifyMagic(this.int + bonus, true)) {
				return item;
			}
		}
	}
	return null;
};

MonsterModel.prototype.addItem = function(item, autoEquip) {
	var i, length, inventory, inventoryItem;
	inventory = this.inventory;
	// Try to consolidate this item if the same items are already in inventory
	if (item.canConsolidate()) {
		i = 0;
		length = inventory.length;
		while (i < length) {
			inventoryItem = inventory[i];
			if (inventoryItem.consolidate(item)) {
				break;
			} else {
				++i;
			}
		}
		
		// Wasn't consolidated so push it into the inventory list
		if (i === length) {
			inventory.push(item);
		}
	} else {
		inventory.push(item);
		// If not currently wielding a weapon and this could be weilded (eg, it was auto-pickup), do so
		if (autoEquip && !this.equippedItems.weapon && item.getCategory() === "weapons") {
			this.equipAnItem(inventory.length - 1);
		}
	}

	this.updateWeightCarried();
	// recalc in case encumberance changed
	this._calculateDefenses();
};

MonsterModel.prototype.dropItemByIndex = function(index) {
	this.unequipAnItem(index);
	item = this.inventory.splice(index, 1);
	this.updateWeightCarried();
	// recalc in case armor was unequipped or encumberance changed
	this._calculateDefenses();
	return item[0];
};

MonsterModel.prototype.removeItemFromInventory = function(item) {
	if (this.inventory) {
		var i, inventoryLength, slot;
		inventoryLength = this.inventory.length;
		i = 0;
		while (i < inventoryLength) {
			if (item === this.inventory[i]) {
				this.inventory.splice(i, 1);
				slot = item.getEquippedSlot();
				if (item === this.equippedItems[slot]) {
					this.equippedItems[slot] = undefined;
					item.setEquipped(false);
					this._calculateDefenses();
				}				
				break;
			}
			++i;
		}
	}
};

// Calculated conversts the skill to the range 0.5 - 2
MonsterModel.prototype.getSkillLevel = function(item, calculated, ranged) {
	var skillVal = 0;
	if (this.skills && item) {
		// Assuming it's a string or an ItemModel object (with function getSkillRequired())
		if (item.getSkillRequired) {
			skillVal = this.skills[item.getSkillRequired(ranged)];
			if (skillVal) {
				skillVal = skillVal.lvl;
			} else if(item.canUseUnskilled && item.canUseUnskilled()) {
				// Some equipment is easy to use so being unskilled is same as skill level 1
				skillVal = 1;
			}
		} else {
			skillVal = this.skills[item];
			if (skillVal) {
				skillVal = skillVal.lvl;
			}
		}
	} else if (!this.isPlayer) {
		skillVal = this.level; // monsters know everything :)
	}
	
	if (calculated) {
		// A "calculated" skill is used as a multiplier for some ability (say defense value of a piece of armor).
		// Since it essentially defines an inverse curve, you get diminishing returns as the skill level increases.
		// At level 1, the multiplier is 1 (i.e., normal usage). At level 2 it is 1.2 (3 is 1.33, 4 is 1.43,
		// 5 is 1.5,  6 is 1.56, 7 is 1.6,  8 is 1.64, 9 is 1.67, 10 is 1.69, etc.).
		if (skillVal > 0) {
			skillVal = 2 - 4 / (3 + skillVal);
		} else {
			skillVal = 0.5;
		}
	}
	return skillVal || 0;
};

MonsterModel.prototype.getKnownSkills = function() {
	if (this.skills) {
		return Object.keys(this.skills).sort();
	} else {
		return null;
	}
};

MonsterModel.prototype.getSkillXpLevel = function(skillName) {
	var xpPercent, skillObj = this.skills[skillName];
	if (skillObj) {
		xpPercent = Math.floor(skillObj.xp * 10 / (skillObj.lvl + 1));
	} else {
		xpPercent = 0;
	}
	return xpPercent;
};

MonsterModel.prototype.exerciseSkill = function(skillName) {
	var skillObj, item, skillIncreased = false;
	// Special case for armor skill. Only exercise if wearing armor on the torso slot and it requires skill.
	// For example, a rogue doesn't gain skill if he's wearing a helmet and leather armor. 
	if (skillName === "armor" && this.equippedItems.torso && this.equippedItems.torso.canUseUnskilled()) {
		return false;
	// If no shield is equipped, must be using a defensive weapon, like quarterstaff
	} else if (skillName === "shield" && !this.equippedItems[skillName]) {
		item = this.getEquippedItem("weapon");
		if (item && item.getBlock()) {
			skillName = item.getSkillRequired();
		}
	}
	
	if (Math.random() < this.learnSkillChance) {
		skillObj = this.skills[skillName];
		if (!skillObj) {
			// new, unpracticed skill
			this.skills[skillName] = {lvl:0, xp:1};
		} else {
			++skillObj.xp;
			// Special case for lvl 0 since you're still learning the basics...
			if ((skillObj.lvl === 0 && skillObj.xp > 25) || skillObj.xp >= (skillObj.lvl + 1) * 10) {
				skillObj.xp = 0;
				++skillObj.lvl;
				// More skill may change defenses.
				this._calculateDefenses();
			}
			skillIncreased = true;
		}
	}
	return skillIncreased;
};

MonsterModel.prototype.increaseAttribute = function(attr) {
	this[attr] += 1;
	if (this.effectChangedCallback) {
		this.effectChangedCallback(attr, this[attr], 1);
	}
};

MonsterModel.prototype.getDefense = function() {
	return this.defenses || this.template.defenses;
};

MonsterModel.prototype.getDamageTaken = function() {
	return this.damageTaken;
};

MonsterModel.prototype.takeDamage = function(damage) {
	this.damageTaken += damage;
	if (this.damageTaken < 0) {
		this.damageTaken = 0;
	}
	return (this.damageTaken > this.hp);
};

MonsterModel.prototype.isDead = function() {
	return (this.damageTaken > this.hp);
};

MonsterModel.prototype.showEquippedItems = function() {
	return this.template.showEquippedImg;
};

MonsterModel.prototype.getIntrinsicAttacks = function() {
	return this.intrinsicAttacks;
};

MonsterModel.prototype.getEquippedItem = function(slot) {
	var item = this.equippedItems[slot];
	if (!item && this.template.defaultEquipped) {
		item = this.template.defaultEquipped[slot];
	}
	return item;
};

MonsterModel.prototype.updateWeightCarried = function(weight) {
	var i, length;
	if (weight) {
		this.weight = weight;
	} else {
		weight = 0;
		length = this.inventory.length;
		for (i = 0; i < length; i++) {
			weight += this.inventory[i].getWeight();
		}
		this.weight = weight;
	}
	return this.getEncumberance(weight);
};

MonsterModel.prototype.getInebriationLevel = function() {
	return this.inebriated || 0;
};

MonsterModel.prototype.getPoisonLevel = function() {
	return this.poison || 0;
};

MonsterModel.prototype.getDiseased = function() {
	return this.disease;
};

MonsterModel.prototype.getEncumberance = function(weight) {
	if (!weight) {
		weight = this.weight;
	}
	return 10 * weight / this.str; //0-100% (can carry 10 lbs per 1 point of strength)
};

MonsterModel.prototype.getAccuracy = function() {
	return this.template.accuracy;
};

MonsterModel.prototype.expireEffects = function() {
	return this.effectsServant.expireEffects();
};

MonsterModel.prototype.drinkPotion = function(item) {
	var effect = null;
	
	if (item) {
		this.updateHunger(item.getNourishment());
		effect = item.getEffect();
		if (effect && this.effectsServant.addEffect(effect)) {
			//TODO maybe identify the potion
		}

		if (item.useItOnce() === 0) {
			this.removeItemFromInventory(item);
		}
	}
};

MonsterModel.prototype.eatItemByIndex = function(index) {
	var result = null, item, nourishment, diseaseAmount, category;
	
	item = this.inventory[index];
	if (item) {
		category = item.getCategory();
		if (category === "corpse" && this.hunger > MonsterModel.hunger.ravenousLevel) {
			result = $L("You aren't hungry enough to eat carrion.");
		} else {
			// Don't eat it if you're too full
			nourishment = item.getNourishment();
			if (this.hunger + nourishment > MonsterModel.hunger.maxLevel) {
				result = $L("You are too full to eat that.");
			} else {
				// Eating a corpse could make you sick or could add intrinsic abilities
				this.updateHunger(nourishment);
				this.inventory.splice(index, 1);
				diseaseAmount = item.getDiseasedAmount();
				if (diseaseAmount > 0) {
					this.effectsServant.addDiseaseEffect(diseaseAmount);
				}
			}
		}
	}
	
	return result;
};

MonsterModel.prototype.updateHunger = function(hungerDelta) {
	this.hunger += hungerDelta;
	if (this.hunger > MonsterModel.hunger.maxLevel) {
		this.hunger = MonsterModel.hunger.maxLevel;
	}
	
	return this.getHunger(false);
};

MonsterModel.prototype.getHunger = function(includeColor) {
	var hunger = this.hunger;
	if (hunger <= 0) {
		return null; //$L("Starved to death");
	} else if (hunger < MonsterModel.hunger.starvingLevel) {
		if (includeColor) {
			return $L('<span id="hunger" style="color:red;">' + MonsterModel.hungerStrings.starving + '</span>');
		} else {
			return MonsterModel.hungerStrings.starving;
		}
	} else if (hunger < MonsterModel.hunger.ravenousLevel) {
		if (includeColor) {
			// light orange
			return $L('<span id="hunger" style="color:#FF9933;">' + MonsterModel.hungerStrings.ravenous + '</span>');
		} else {
			return MonsterModel.hungerStrings.ravenous;
		}
	} else if (hunger < MonsterModel.hunger.hungryLevel) {
		if (includeColor) {
			// light yellow
			return $L('<span id="hunger" style="color:#FFFF66;">' + MonsterModel.hungerStrings.hungry + '</span>');
		} else {
			return MonsterModel.hungerStrings.hungry;
		}
	} else if (hunger < MonsterModel.hunger.fullLevel) {
		return MonsterModel.hungerStrings.full;
	} else {
		return MonsterModel.hungerStrings.satiated;
	}
};

MonsterModel.prototype._hasFreeHandsToEquip = function(item, slot) {
	var availableHands = this.numHands();
	if (slot === "shield" && this.equippedItems.weapon) {
		availableHands -= this.equippedItems.weapon.getHandsRequired();
	} else if (slot === "weapon" && this.equippedItems.shield) {
		availableHands -= this.equippedItems.shield.getHandsRequired();
	}
	
	return (item.getHandsRequired() <= availableHands);
};

MonsterModel.prototype._generateHP = function() {
	var hpBonus;
	if (this.str) {
		hpBonus = (this.str - 5) / 5;
	} else {
		hpBonus = 0;
	}
	return Math.max(1, this.template.hpMin + Math.floor(hpBonus + Math.random() * this.template.hpRnd));
};

MonsterModel.prototype._calculateDefenses = function() {
	var item, skill, flexibility, def, block, dexterity, defenses;

	// Most monsters don't have inventory so do the simple case and use the template
	if (!this.inventory) {
		return;
	}

	item = this.equippedItems.torso;
	flexibility = 1;
	if (this.isPlayer) {
		defenses = { dodge: 0, block: 0, ac: 0 };
	} else {
		skill = this.getSkillLevel("fight", true); // monsters defense need to "level" so they're not too easy.
		defenses = {
			dodge: skill * this.template.defenses.dodge,
			block: skill * this.template.defenses.block,
			ac: skill * this.template.defenses.ac
		};
	}

	for (var key in this.equippedItems) {
		if (key === "rings") {
			//TODO: for now ignoring rings of protect and evasion
		} else {
			item = this.equippedItems[key];
			if (item) {
				skill = this.getSkillLevel(item, true);
				def = item.getDefense();
				block = item.getBlock();
				if (def) {
					defenses.ac += def * skill;
				}
				
				if (block) {
					defenses.block += block * skill;
				}
				
				flexibility *= item.getFlexibility();				
			}
		}
	}

	dexterity = this.dex || this.template.dex || 10;
	if (this.getEncumberance() > 67) {
		flexibility *= 0.75;
	}
	defenses.dodge = flexibility * this.getSkillLevel("dodge", true) * (2 * dexterity / 3);
	
	this.defenses = defenses;
};

