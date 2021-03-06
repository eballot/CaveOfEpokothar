/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

// Setup all the tile icons globally so they're loaded asap. 
MapTileIcons.loadImages();


enyo.kind({
	name: "AppMain",
	kind: enyo.VFlexBox,
	components: [{
		kind: "gameMain",
		kind: "GameMain",
		onNeedNewPlayer: "_createNewPlayer",
		flex: 1
	}, {
		name: "createCharacter",
		kind: "CharacterCreator",
		onSelect: "_newPlayer"
//		lazy: true
	}, {
		name: "aboutPopup",
		kind: "AboutPopup"
	}, {
		name: "appMenu",
		kind: enyo.AppMenu,
		components: [{
			caption: $L("About"),
			onclick: "_showAbout"
		}]
	}],
	
	// GameMain sends this when a new player needs to be created
	_createNewPlayer: function() {
		this.$.createCharacter.openAtCenter();
	},
	
	// Send the newly created character to GameMain
	_newPlayer: function(inSender, inPlayerDetails) {
		this.$.gameMain.createNewCharacter(inPlayerDetails.player, inPlayerDetails.className);
	},
	
	/*
	 * Private functions go below here
	 */
	_showAbout: function() {
		this.$.aboutPopup.open();
	}
});
