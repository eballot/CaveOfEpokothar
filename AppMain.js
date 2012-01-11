/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

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
			caption: enyo._$L("Help"),
			onclick: "_showAbout"
		}]
	}],
	
	create: function() {
		this.inherited(arguments);
		this.phonegapOnMenuKeyDownBound = this._phonegapOnMenuKeyDown.bind(this);
		document.addEventListener("menubutton", this.phonegapOnMenuKeyDownBound, false);
	},
	
	destroy: function() {
		document.removeEventListener("menubutton", this.phonegapOnMenuKeyDownBound);
		this.inherited(arguments);
	},

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
	},
	
	_phonegapOnMenuKeyDown: function() {
		//this.$.appMenu.openAppMenu();
		this.$.aboutPopup.open();
	}	
});
