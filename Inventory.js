/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

enyo.kind({
	name: "Inventory",
	kind: enyo.VFlexBox,
	flex: 1,
	style: "background-color:#717171; color:white;",
	published: {
		player: null,
		map: null
	},
	events: {
		onDismiss: ""
	},
	statics: {
		kItemOptions: {
			kDrink:   { caption:$L("Drink"), action:"drink" },
			kDrop:    { caption:$L("Drop"), action:"drop" },
			kEat:     { caption:$L("Eat"), action:"eat" },
			kEquip:   { caption:$L("Wield"), action:"equip" },
			kInspect: { caption:$L("Inspect"), action:"inspect" },
			kRead:    { caption:$L("Read"), action:"read" },
			kRemove:  { caption:$L("Remove"), action:"unequip" },
			kSelect:  { caption:$L("Select"), action:"equip" },
			kUnequip: { caption:$L("Unequip"), action:"unequip" },
			kWear:    { caption:$L("Wear"), action:"equip" }
		},
		kCategoryOrdering: {
			weapons: {i:1, displayName: $L("Weapons")},
			armor:   {i:2, displayName: $L("Armor")},
			ammo:    {i:3, displayName: $L("Ammunition")},
			jewelry: {i:4, displayName: $L("Jewelry")},
			food:    {i:5, displayName: $L("Food")},
			potions: {i:6, displayName: $L("Potions")},
			scrolls: {i:7, displayName: $L("Scrolls")},
			corpse:  {i:8, displayName: $L("Corpses")}
		},
		kEncumberance: new enyo.g11n.Template($L("Carrying #{totalWeight} lbs, #{encumberance} (#{percent}%)"))
	},
	components: [{
		kind: enyo.HFlexBox,
		flex: 1,
		components: [{
			kind: enyo.VFlexBox,
			flex: 1,
			className: "enyo-group enyo-roundy labeled",
			style: "margin-right: 0;",
			components: [{
				content: $L("Inventory"),
				className: "enyo-group-label"
			}, {
				name: "equipmentList",
				kind: enyo.VirtualList,
				flex: 1,
				onSetupRow: "_equipmentListSetupRow",
				style: "margin-left:-10px; margin-right:-10px; background:url(images/horiz-shadow.png) repeat-x bottom;",
				components: [{
					name: "divider",
					kind: enyo.Divider
				}, {
					name: "equipmentItem",
					kind: enyo.Item,
					tapHighlight: true,
					onclick: "_equipmentListItemClick",
					components: [{
						kind: enyo.HFlexBox,
						components: [{
							name: "equipmentItemName",
							kind: enyo.Control,
							flex: 1
						}, {
							name: "equipmentItemWeight",
							kind: enyo.Control
						}]
					}]
				}]
			}, {
				name: "totalWeight",
				style: "margin-top:5px;"
			}]
		}, {
			kind: enyo.VFlexBox,
			flex: 1,
			components: [{
				kind: enyo.VFlexBox,
				flex: 1,
				className: "enyo-group enyo-roundy labeled",
				style: "margin-left: 0; margin-bottom: -5px;",
				components: [{
					content: $L("Ground"),
					className: "enyo-group-label"
				}, {
					name: "groundList",
					kind: enyo.VirtualList,
					flex: 1,
					onSetupRow: "_groundListSetupRow",
					style: "margin-left: -10px; margin-right: -10px;",
					components: [{
						name: "groundItem",
						kind: enyo.Item,
						tapHighlight: true,
						onclick: "_groundListItemClick",
						components: [{
							name: "groundItemName",
							kind: enyo.Control
						}]
					}]
				}]
			}, {
				kind: enyo.VFlexBox,
				className: "enyo-group enyo-roundy labeled",
				style: "margin-left: 0;",
				components: [{
					content: $L("Item Description"),
					className: "enyo-group-label"
				}, {
					name: "itemDescription",
					allowHtml: true,
					content: "&nbsp;"
				}]
			}]
		}]
	}, {
		name: "inventoryActionsPopup",
		kind: enyo.PopupSelect,
		onSelect: "_handleInventoryActionsChoice"
	}, {
		kind: enyo.Toolbar,
		components: [{
            kind: enyo.Button,
            caption: $L("Back"),
            className: "back-button",
			onclick: "doDismiss"
		}]
	}, {
		name: "notHungryDialog",
		kind: enyo.Popup,
		scrim: true,
		components: [{
			name: "notHungryText",
			content: ""
		}, {
			kind: enyo.Button,
			caption: enyo._$L("OK"),
			onclick: "_closeNotHungryDialog"
		}]
	}],
	
	playerChanged: function(oldPlayer) {
		this._updateInventoryList();
	},
	
	mapChanged: function(oldMap) {
		this._updateGroundList();
	},
	
	_equipmentListSetupRow: function(inSender, inIndex) {
		var inventoryItem, itemName, weight, previousCategory;
		if (!this.inventory) {
			return false;
		}
		
		inventoryItem = this.inventory[inIndex];
		if (inventoryItem) {
			// Whether to display divider
			if (inIndex === 0) {
				this.$.divider.setCaption(Inventory.kCategoryOrdering[inventoryItem.getCategory()].displayName);
				this.$.divider.canGenerate = true;
				this.$.equipmentItem.addClass("enyo-first");
			} else {
				previousCategory = this.inventory[inIndex-1].getCategory();
				if (inventoryItem.getCategory() !== previousCategory) {
					this.$.divider.setCaption(Inventory.kCategoryOrdering[inventoryItem.getCategory()].displayName);
					this.$.divider.canGenerate = true;
					this.$.equipmentItem.addClass("enyo-first");
				} else {
					this.$.divider.canGenerate = false;
					this.$.equipmentItem.removeClass("enyo-first");
				}
			}
			
			// Display name
			itemName = inventoryItem.getDisplayName();
			if (inventoryItem.isEquipped()) {
				itemName += " (equipped)";
			}
			this.$.equipmentItemName.setContent(itemName);
			weight = inventoryItem.getWeight();
			if (inventoryItem.canConsolidate()) {
				weight = weight.toFixed(2);
			}
			this.$.equipmentItemWeight.setContent(weight);
			
			return true;
		}
		
		return false;
	},

	_equipmentListItemClick: function(inSender, inEvent) {
		var options, inventoryItem = this.inventory[inEvent.rowIndex];
		if (inventoryItem) {
			switch (inventoryItem.getCategory()) {
			case "armor":
			case "jewelry":
				if (inventoryItem.isEquipped()) {
					options = [ Inventory.kItemOptions.kInspect, Inventory.kItemOptions.kRemove ];
				} else {
					options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect, Inventory.kItemOptions.kWear ];
				}
				break;
				
			case "food":
				options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kEat, Inventory.kItemOptions.kInspect ];
				break;
				
			case "potions":
				options = [ Inventory.kItemOptions.kDrink, Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect ];
				break;
				
			case "scrolls":
				options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect, Inventory.kItemOptions.kRead ];
				break;
				
			case "weapons":
				if (inventoryItem.isEquipped()) {
					options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect, Inventory.kItemOptions.kUnequip ];
				} else {
					options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect, Inventory.kItemOptions.kEquip ];
				}
				break;
				
			case "ammo":
				if (inventoryItem.isEquipped()) {
					options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect ];
				} else {
					options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect, Inventory.kItemOptions.kSelect ];
				}
				break;
				
			case "corpse":
				// TODO "butcher"
				options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kEat, Inventory.kItemOptions.kInspect ];
				break;
				
			default:
				console.log("Warning: unrecognized category "+inventoryItem.getCategory());
				options = [ Inventory.kItemOptions.kDrop, Inventory.kItemOptions.kInspect ];
			}
			
			this.$.inventoryActionsPopup.setItems(options);
			this.$.inventoryActionsPopup.inventoryItemIndex = inEvent.rowIndex;
			this.$.inventoryActionsPopup.openAtEvent(inEvent);
		}
	},

	_groundListSetupRow: function(inSender, inIndex) {
		var item;
		if (this.itemPile) {
			if (this.itemPile.isEmpty()) {
				if (inIndex === 0) {
					this.$.groundItemName.setContent($L("<<< empty >>>"));
					this.$.groundItem.addClass("enyo-single");
					return true;
				}
			} else {
				item = this.itemPile.peekItem(inIndex);
				if (item) {
					this.$.groundItemName.setContent(item.getDisplayName());
					this.$.groundItem.addRemoveClass("enyo-first", inIndex===0);
					return true;
				}
			}
		}
		
		return false;
	},
	
	_groundListItemClick: function(inSender, inEvent) {
		if (this.itemPile && !this.itemPile.isEmpty()) {
			// The only option is to pick up the item, so just do it. 
			var item = this.itemPile.removeItem(inEvent.rowIndex);
			if (item) {
				item.setEquipped(false); // ensure a dropped item isn't marked as equipped
				item.setSortList();
				this.player.addItem(item);
				this.map.itemPileChanged(this.player.getPosition());
			}
			
			// redraw both lists
			this._updateInventoryList();
			this.$.groundList.punt();
		}
	},
	
	_handleInventoryActionsChoice: function(inSender, inData) {
		var index, item, result;
		if (inData) {
			index = this.$.inventoryActionsPopup.inventoryItemIndex;
			if (index < this.inventory.length) {
				switch (inData.action) {
				case Inventory.kItemOptions.kDrop.action:
					this.player.dropItem(this.map, index);
					// redraw both lists
					this._updateInventoryList();
					this._updateGroundList();
					break;
					
				case Inventory.kItemOptions.kEat.action:
					result = this.player.eatItem(index);
					if (result) {
						this.$.notHungryDialog.openAtCenter();
						this.$.notHungryText.setContent(result);
					}
					this._updateInventoryList();
					break;
					
				case Inventory.kItemOptions.kEquip.action:
					this.player.equipItem(index);
					this._updateInventoryList();
					break;
					
				case Inventory.kItemOptions.kUnequip.action:
					this.player.unequipItem(index);
					this._updateInventoryList();
					break;
					
				case Inventory.kItemOptions.kInspect.action:
					item = this.inventory[index];
					item.identifyMagic(this.player.getIntelligence(), false);
					this.$.itemDescription.setContent(item.getDescription());
					break;
				//TODO: handle other actions
				}
			}
		}
	},
	
	_updateInventoryList: function() {
		var i, length, obj = {}, totalWeight;
		this.inventory = this.player.getInventoryList();
		function sortCallback(a,b) {
			var  acat, bcat;
			acat = a.getCategory();
			bcat = b.getCategory();
			if (acat === bcat) {
				return a.orderNum - b.orderNum;
			} else {
				return Inventory.kCategoryOrdering[acat].i - Inventory.kCategoryOrdering[bcat].i;
			}
		}
		this.inventory.sort(sortCallback);
		totalWeight = 0;
		if (this.inventory) {
			length = this.inventory.length;
			for (i = 0; i < length; i++) {
				totalWeight += this.inventory[i].getWeight();
			}

			obj.percent = this.player.updateWeightCarried(totalWeight);
			if (obj.percent > 100) {
				obj.encumberance = $L("crushing load");
			} else if (obj.percent > 67) {
				obj.encumberance = $L("heavily loaded");
			} else if (obj.percent > 33) {
				obj.encumberance = $L("medium load");
			} else {
				obj.encumberance = $L("lightly loaded");
			}
			obj.percent = Math.round(obj.percent);
			obj.totalWeight = totalWeight.toFixed(1);
			this.$.totalWeight.setContent(Inventory.kEncumberance.evaluate(obj));
		}
		this.$.equipmentList.punt();
	},
	
	_updateGroundList: function() {
		if (this.player) {
			this.itemPile = this.map.getItemPileAt(this.player.getPosition());
			this.$.groundList.punt();
		}
	},

	_closeNotHungryDialog: function() {
		this.$.notHungryDialog.close();
	}
});
