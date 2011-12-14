var kItemsData = {
		getItemTemplate: function(category, type) {
			var itemTemplate = kItemsData[category][type];
			if (!itemTemplate) {
				console.error("no template for "+category+" "+type);
				return;
			}
			return itemTemplate;
		}
};

var kAttackActions = {
	blunt: ["bludgeon", "bash", "smash"],
	claw: ["scratch", "rip"],
	bite: ["bite", "chomp"],
	foot: ["kick"],
	hand: ["punch", "slug"],
	dagger: ["stab", "slash", "poke"],
	pierce: ["skewer", "impale"],
	sword: ["stab", "slash", "skewer"]
};

