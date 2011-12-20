
var kSkills = {
	getDisplayname: function(skill) {
		var skillObj = kSkills[skill];
		if (skillObj) {
			return skillObj.displayName;
		} else {
			return skill;
		}
	},

	search:   { displayName: $L("Search") },
	stealth:  { displayName: $L("Stealth") },

	armor:    { displayName: $L("Armor") },
	dodge:    { displayName: $L("Dodge") },
	shield:   { displayName: $L("Shield") },
	
	fight:    { displayName: $L("Fight") },
	axe:      { displayName: $L("Axe") },
	club:     { displayName: $L("Club") },
	dagger:   { displayName: $L("Dagger") },
	mace:     { displayName: $L("Mace") },
	polearm:  { displayName: $L("Polearm") },
	spear:    { displayName: $L("Spear") },
	staff:    { displayName: $L("Staff") },
	sword:    { displayName: $L("Sword") },
	
	bow:      { displayName: $L("Bow") },
	crossbow: { displayName: $L("Crossbow") },
	dart:     { displayName: $L("Dart") },
	sling:    { displayName: $L("Sling") },
	thrown:   { displayName: $L("Throwing") },

	spells:      { displayName: $L("Spells") },
	airspells:   { displayName: $L("Air Spells") },
	earthspells: { displayName: $L("Earth Spells") },
	firespells:  { displayName: $L("Fire Spells") },
	waterspells: { displayName: $L("Water Spells") }
};
