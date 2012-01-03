//TODO: add drain, might, stone skin
kItemsData.potions = {
	dexterity: {
		displayName: $L("Potion of Agility"),
		type:"dexterity", category:"potions", weight:0.15, nourishment:25, value:200,/*gp*/
		attribute:"dex", attrAmount:4, duration:45, durationRand:10, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
	strength: {
		displayName: $L("Potion of Strength"),
		type:"strength", category:"potions", weight:0.15, nourishment:25, value:200,/*gp*/
		attribute:"str", attrAmount:4, duration:45, durationRand:10, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
	intelligence: {
		displayName: $L("Potion of Insight"),
		type:"intelligence", category:"potions", weight:0.15, nourishment:25, value:200,/*gp*/
		attribute:"int", attrAmount:4, duration:45, durationRand:10, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
	alcohol: {
		displayName: $L("Bottle of Alcohol"),
		type:"alcohol", category:"potions", weight:0.15, nourishment:75, value:10,/*gp*/
		effect:"inebriated", amount:100, duration:75, durationRand:25, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
	healing: {
		displayName: $L("Potion of Healing"),
		type:"healing", category:"potions", weight:0.15, nourishment:75, value:250,/*gp*/
		effect:"heal", amount:10, duration:0, amountRand:5, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
	health: {
		displayName: $L("Potion of Health"),
		type:"health", category:"potions", weight:0.15, nourishment:250, value:400,/*gp*/
		effect:"health", amount:20, duration:0, amountRand:10, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
	poison: {
		displayName: $L("Bottle of Poison"),
		type:"poison", category:"potions", weight:0.15, nourishment:5, value:50,/*gp*/
		effect:"poison", amount:50, duration:40, durationRand:10, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
	poisonAntidote: {
		displayName: $L("Poison Antidote"),
		type:"poisonAntidote", category:"potions", weight:0.15, nourishment:25, value:100,/*gp*/
		effect:"poisonAntidote", amount:2, duration:0, amountRand:1, canConsolidate: true,
		description: $L("A potion is a liquid with magical properties that you can drink. The effect of these properties may be positive or negative.")
	},
};
