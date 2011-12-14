/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

enyo.kind({
	name: "ItemOnMap",
	kind: enyo.Control,
	className: "on-map",
	
	create: function() {
		this.inherited(arguments);
		
		//TODO: kinda hokey way to determine whether this is an item v actor (or player)
		if (this.itemModel) {
			this.addClass("item-type");
			this.addClass(this.itemModel.getType());
		}
		
		if (!this.position) {
			this.position = {x:0, y:0};
		}
		this.applyStyle("height", MapLevel.kTileSize+"px");
		this.applyStyle("width", MapLevel.kTileSize+"px");
		
		this._updatePosition();
	},

	getPosition: function() {
		return this.position;
	},

	positionAt: function(x, y) {
		if (x && this.position.x !== x) {
			this.position.x = x;
		}
		if (y && this.position.y !== y) {
			this.position.y = y;
		}
		this._updatePosition();
	},

	getcategory:function(x, y) {
		return (this.itemModel && this.itemModel.getCategory()) || "misc";
	},

	/*
	 * Private/protected functions go below here 
	 */
	_updatePosition: function() {
		this.applyStyle("top",  (this.position.y * MapLevel.kTileSize)+"px");
		this.applyStyle("left", (this.position.x * MapLevel.kTileSize)+"px");
	}
});
