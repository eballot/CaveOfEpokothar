enyo.kind({
	name: "AboutCore",
	kind: enyo.Control,
	components: [{
		kind: enyo.Control,
		className: "help-body-title",
		content: $L("Back Story")
	}, {
		kind: enyo.Control,
		className: "help-body-text",
		content: $L("The Council of the Open Hand has learned of a plot by the nefarious demon Epokothar. The demon found an artifact of great magical power, called the Cloak of Ehpeway. " +
				"With it, he plans to destroy the peaceful community of Osweb. The Council has chosen you to enter Epokothar's lair to retrieve the Cloak of Ehpeway and save the Oswebians. " +
				"Epokothar resides deep within Mount Essaipi. You must delve into the depths of his realm and retrieve the cloak. Defeat Epokothar, if you can.")
	}, {
		kind: enyo.Control,
		className: "help-body-title",
		content: $L("How To Play")
	}, {
		kind: enyo.Control,
		className: "help-body-text",
		allowHtml: true,
		content: $L("Cave of Epokothar is a <a target='_blank' href='http://en.wikipedia.org/wiki/rogue-like'>rogue-like</a> role-playing game. Move your alter-ego by tapping on the map in the direction " +
				"you want to go (he will move towards your finger). Some actions are automatic; bumping into a monster automatically attacks it and bumping into a door opens it. You can " +
				"pickup items by standing on them and going to your inventory. You can also equip and unequip items from the inventory view.<br/>" +
				"Adventuring builds up an appetite. Make sure to keep an eye on your hunger level and periodically eat something. Whenever you find food, you will automatically pick it up.<br/>" +
				"You automatically search for nearby traps and hidden doors, but may not find them on the first pass. You can use the \"search\" button to keep still and continue searching. " + 
				"You can also use this button to rest and regain hit points.")
	}]
});
	
