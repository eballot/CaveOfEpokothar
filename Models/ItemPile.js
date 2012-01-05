

var ItemPile = function(itemModel) {
	if (itemModel instanceof Array) {
		this.items = itemModel;
	} else {
		this.items = [itemModel];
	}
};

ItemPile.prototype.kind = "PileOfItems";

ItemPile.prototype.isEmpty = function() {
	return this.items.length === 0;
};

ItemPile.prototype.count = function() {
	return this.items.length;
};

ItemPile.prototype.getTileImg = function() {
	var item, tileImg;
	if (this.items.length > 0) {
		item = this.items[this.items.length-1];
		tileImg = item.getTileImg();
	}
	
	return tileImg;
};

ItemPile.prototype.addItem = function(itemModel) {
	var i, length, pileItem;
	
	// Try to consolidate this item if the same items are already in this pile
	if (itemModel.canConsolidate()) {
		i = 0;
		length = this.items.length;
		while (i < length) {
			pileItem = this.items[i];
			if (pileItem.consolidate(itemModel)) {
				break;
			} else {
				++i;
			}
		}
		
		// Wasn't consolidated so add it to the pile
		if (i === length) {
			this.items.push(itemModel);
		}
	} else {
		this.items.push(itemModel);
	}
};

ItemPile.prototype.listItemNames = function() {
	var i, arrayLength, itemNames, item;

	itemNames = [];
	arrayLength = this.items.length;
	for (i = 0; i < arrayLength; i++) {
		item = this.items[i];
		itemNames.push(item.getDisplayName(true));
	}
	return itemNames;
};

ItemPile.prototype.peekItem = function(index) {
	return this.items[index];
};

ItemPile.prototype.removeItem = function(index) {
	var items = this.items.splice(index, 1);
	return items[0];
};

ItemPile.prototype.autoPickupItems = function() {
	var i, arrayLength, pickedUpItems, item;

	pickedUpItems = [];
	arrayLength = this.items.length - 1;
	for (i = arrayLength; i >= 0; i--) {
		item = this.items[i];
		if (item.autoPickup()) {
			// don't want to keep this flag while in the player's inventory since it is set
			// in cases such when a missiles is fired (so player can easily pick it up)
			item.removeAutoPickupFlag();
			pickedUpItems.push(item);
			this.items.splice(i, 1);
		}
	}
	return pickedUpItems;
};

//returns true if the pile is empty and should be removed
ItemPile.prototype.checkAge = function() {
	var i, arrayLength;

	arrayLength = this.items.length - 1;
	for (i = arrayLength; i >= 0; i--) {
		if (this.items[i].checkAge()) {
			this.items.splice(i, 1);
		}
	}
	
	return (this.items.length === 0);
};

ItemPile.prototype.toString = function() {
	return this.items.toString();
};
