kItemsData.ammo = {
	// Melee weapons (may also be thrown)
	arrow: {
		displayName: $L("Arrow"),
		type: "arrow", category:"ammo", slot:"quiver", skill: "bow", attackActions:"pierce", weight:0.15, value:0.1,/*gp*/
		damageMin:0, damageRnd:0, canConsolidate: true, destroyedWhenUsed: 0.25,
		description: $L("Arrows are shot from a bow.")
	},
	crossbowbolt: {
		displayName: $L("Bolt"),
		type: "crossbowbolt", category:"ammo", slot:"quiver", skill: "crossbow", attackActions:"pierce", weight:0.15, value:0.1,/*gp*/
		damageMin:0, damageRnd:0, canConsolidate: true, destroyedWhenUsed: 0.25,
		description: $L("A bolt is fired from a crossbow.")
	},
	slingstone: {
		displayName: $L("Sling stone"),
		type: "slingstone", category:"ammo", slot:"quiver", skill: "sling", attackActions:"bludgeon", weight:0.15, value:0,/*gp*/
		damageMin:0, damageRnd:0, canConsolidate: true, destroyedWhenUsed: 0.2,
		description: $L("Stones that can be flung using a sling.")
	},
	slingbullet: {
		displayName: $L("Sling bullet"),
		type: "slingbullet", category:"ammo", slot:"quiver", skill: "sling", attackActions:"bludgeon", weight:0.25, value:0.5,/*gp*/
		damageMin:1, damageRnd:0, canConsolidate: true, destroyedWhenUsed: 0.1,
		description: $L("Heavy lead bullets that can be flung using a sling.")
	}
};
