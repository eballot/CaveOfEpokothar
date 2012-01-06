/*jslint white: false, undef: true, eqeqeq: true */ 
/*global enyo, $L */


enyo.kind({
	name: "AboutPopup",
	kind: enyo.Popup,
	modal: true,
	width: "100%",
	openClassName: "help-container",
	components: [{
		kind: enyo.HFlexBox,
		components: [{
			kind: enyo.Image,
			height: "32px",
			width: "32px",
			src: "icon64.png"
		}, {
			content: $L("About"),
			style: "margin-left:7px; margin-top:3px;"
		}]
	}, {
		name: "appName",
		kind: enyo.Control,
		className: "help-body-title"
	}, {
		name: "appVersion",
		kind: enyo.Control,
		className: "help-body-text"
	}, {
		kind: enyo.Control,
		className: "help-body-text",
		allowHtml: true,
		content: $L("<br/><a href='http://www.facebook.com/CaveOfEpokothar'>Follow Cave of Epokothar</a> on Facebook.<br/>Send questions and comments to <a href='mailto:groovycats@rocketmail.com?subject=Cave%20of%20Epokothar'>groovycats@rocketmail.com</a>")
	}, {
		kind: "AboutCore"
	}],
	
	open: function() {
		this.inherited(arguments);
		
		var info = enyo.fetchConfigFile("appinfo.json");
		this.$.appName.setContent(info.title);
		var version = (new enyo.g11n.Template($L("#{version} by #{vendor}"))).evaluate(info);
		this.$.appVersion.setContent(version);
	}
});
