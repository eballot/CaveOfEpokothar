var MapTileIcons = {
	tileSets: {
		dungeon: "tiles/dungeon_features.gif",
		items: "tiles/items.gif",
		corpses: "tiles/corpses.png"
	},
	imgs: {
	},

	// dungeon features
	doorClosed: { img: "dungeon", offsetX: 128, offsetY: 64 },
	doorOpen:   { img: "dungeon", offsetX: 160, offsetY: 64 },
	doorHidden: { img: "dungeon", offsetX: 0, offsetY: 32 },
	floor:      { img: "dungeon", offsetX: 64, offsetY: 0 },
	stairsDown: { img: "dungeon", offsetX: 0, offsetY: 64 },
	stairsUp:   { img: "dungeon", offsetX: 32, offsetY: 64 },
	wall:       { img: "dungeon", offsetX: 0, offsetY: 32 },
	
	//armor
	leather:    { img: "items", offsetX: 480, offsetY: 160 },
	studdedleather: { img: "items", offsetX: 512, offsetY: 160 },
	scalemail:  { img: "items", offsetX: 64, offsetY: 192 },
	chainmail:  { img: "items", offsetX: 576, offsetY: 160 },
	fieldplate: { img: "items", offsetX: 256, offsetY: 192 },
	
	//helmets
	leathercap: { img: "items", offsetX: 0, offsetY: 256 },
	ironhelm:   { img: "items", offsetX: 96, offsetY: 256 },
	fullhelm:   { img: "items", offsetX: 160, offsetY: 256 },
	hornedhelm: { img: "items", offsetX: 128, offsetY: 256 },
	
	//shields
	smallshield:{ img: "items", offsetX: 352, offsetY: 224 },
	shield:     { img: "items", offsetX: 320, offsetY: 224 },
	
	//gloves
	leatherglove:{img: "items", offsetX: 192, offsetY: 256 },
	mailglove:  { img: "items", offsetX: 256, offsetY: 256 },
	plateglove: { img: "items", offsetX: 288, offsetY: 256 },

	//shoes
	leathershoes:{img: "items", offsetX: 320, offsetY: 256 },
	leatherboots:{img: "items", offsetX: 352, offsetY: 256 },
	sandals:    { img: "items", offsetX: 384, offsetY: 256 },
	
	//weapons
	club:       { img: "items", offsetX: 480, offsetY: 0 },
	dagger:     { img: "items", offsetX: 320, offsetY: 32 },
	handaxe:    { img: "items", offsetX: 384, offsetY: 64 },
	longsword:  { img: "items", offsetX: 544, offsetY: 32 },
	shortsword: { img: "items", offsetX: 512, offsetY: 32 },
	spear:      { img: "items", offsetX: 192, offsetY: 96 },

	longbow:    { img: "items", offsetX: 608, offsetY: 64 },
	shortbow:   { img: "items", offsetX: 608, offsetY: 64 },

	arrow:       { img: "items", offsetX: 384, offsetY: 96 },

	//food
	meat:       { img: "items", offsetX: 192, offsetY: 288 },
	bread:      { img: "items", offsetX: 224, offsetY: 288 },
	pear:       { img: "items", offsetX: 256, offsetY: 288 },
	apple:      { img: "items", offsetX: 288, offsetY: 288 },
	cheese:     { img: "items", offsetX: 160, offsetY: 320 },
	sausage:    { img: "items", offsetX: 192, offsetY: 320 },
	
	//dead things
	bones:               { img: "items", offsetX: 256, offsetY: 320 },
	deadHumanoidBrown:   { img: "corpses", offsetX: 32, offsetY: 0 },
	deadHumanoidGray:    { img: "corpses", offsetX: 64, offsetY: 0 },
	deadHumanoidFlesh:   { img: "corpses", offsetX: 96, offsetY: 0 },
	deadInsect:          { img: "corpses", offsetX: 928, offsetY: 0 },
	deadEquine:          { img: "corpses", offsetX: 736, offsetY: 32 },
	deadGoblin:          { img: "corpses", offsetX: 64, offsetY: 64 },
	deadDog:             { img: "corpses", offsetX: 160, offsetY: 64 },
	deadRatGreen:        { img: "corpses", offsetX: 832, offsetY: 64 },
	deadRatGray:         { img: "corpses", offsetX: 864, offsetY: 64 },
	deadRatOrange:       { img: "corpses", offsetX: 896, offsetY: 64 },
	
	loadImages: function() {
		for (var key in MapTileIcons.tileSets) {
			MapTileIcons.imgs[key] = new Image();
			MapTileIcons.imgs[key].src = MapTileIcons.tileSets[key];
		}
	}
};