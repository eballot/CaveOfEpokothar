//define kItemsData.corpse that is not enumerable since corpses are only created when something dies
Object.defineProperty(kItemsData, 
	"corpse", {
	enumerable: false,
	value: {
		bones: {  // this is represents the rotting remains of a long-dead corpse
			displayName: $L("TBD"),
			type:"bones", category:"corpse", canSpoil:true, weight:15, nourishment:0, value:0,/*gp*/
			description: $L("The bones and bits of rotting flesh of a long-dead creature.")
		},
		animalsmall: {
			displayName: $L("TBD"),
			type:"animalsmall", category:"corpse", canSpoil:true, disease:33, weight:25, nourishment:250, value:0,/*gp*/
			description: $L("Carrion can be eaten if you're really hungry.")
		},
		equine: {
			displayName: $L("TBD"),
			type:"equine", category:"corpse", canSpoil:true, disease:33, weight:250, nourishment:1000, value:0,/*gp*/
			description: $L("Carrion can be eaten if you're really hungry.")
		},
		humanoid: {
			displayName: $L("TBD"),
			type:"humanoid", category:"corpse", canSpoil:true, disease:33, weight:125, nourishment:500, value:0,/*gp*/
			description: $L("Carrion can be eaten if you're really hungry.")
		},
		insectoid: {
			displayName: $L("TBD"),
			type:"insectoid", category:"corpse", canSpoil:true, disease:33, weight:30, nourishment:550, value:0,/*gp*/
			description: $L("Carrion can be eaten if you're really hungry.")
		}
	}
});