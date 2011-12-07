/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

enyo.kind({
	name: "ActorOnMap",
	kind: "ItemOnMap",
	className: "on-map actor-styles",
	events: {
		onDied: "",
		onStatusText: "",
		onItemPickedUp: "",
		onAlertDialog: ""
	},
	chrome: [{
		name: "avatar",
		kind: enyo.Image
	}, {
		name: "torso",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "head",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "face",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "legs",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "weapon",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "shield",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "status",
		className: "actor-status"
	}],
	statics: {
		kAttackYouMissed: new enyo.g11n.Template($L("You missed the #{name}.")),
		kAttackYouHitIt: new enyo.g11n.Template($L("You hit the #{name} for #{damage} points.")),
		kAttackYouKilledIt: new enyo.g11n.Template($L("You killed the #{name}.")),
		kAttackItHitYou: new enyo.g11n.Template($L("You are hit for #{damage} points.")),
		kAttackItBlocked: new enyo.g11n.Template($L("The #{name} blocked your attack.")),
		kAttackItNotHurt: new enyo.g11n.Template($L("The #{name} is not hurt."))
	},
	
	create: function() {
		var m, faceGraphic;
		this.inherited(arguments);

		if (this.monsterModel) {
			m = this.monsterModel;
			this.$.avatar.setSrc(m.getGraphic());
			this.showEquippedItems();
			this.attitude = m.getAttitude();
			this.addClass(this.attitude);
			if (this.monsterModel.template.wpnTopOffset) {
				this.$.weapon.applyStyle("top", this.monsterModel.template.wpnTopOffset);
			}
			
			faceGraphic = this.monsterModel.getFaceGraphic();
			if (faceGraphic) {
				this.$.face.setSrc(faceGraphic);
			}
		} else {
			this.error("Actor created with no monsterModel!");
		}
	},
	
	saveToString: function() {
		var serialized = '{"position":' + JSON.stringify(this.getPosition()) + ',"monsterModel":' + this.monsterModel.saveToString() + '}';
		return serialized;
	},
	
	isPlayer: function() {
		return false;
	},
	
	showIfVisible: function(map) {
		this.setShowing(map.hasLineOfSiteToPlayer(this));
	},

	whatAreYou: function(showAttitude) {
		var text;
		if (showAttitude) {
			switch (this.attitude) {
			case "neutral":
				text = new enyo.g11n.Template($L("Indifferent #{name}")).evaluate({name:this.monsterModel.getDisplayName()});
				break;
			case "friendly":
				text = new enyo.g11n.Template($L("Friendly #{name}")).evaluate({name:this.monsterModel.getDisplayName()});
				break;
			default:
				text = new enyo.g11n.Template($L("Hostile #{name}")).evaluate({name:this.monsterModel.getDisplayName()});
				break;
			}
		} else {
			text = this.monsterModel.getDisplayName();
		}

		return text;
	},
	
	describeYourself: function() {
		//TODO: return something useful
		return this.monsterModel.getDisplayName();
	},

	showEquippedItems: function() {
		if (this.monsterModel.showEquippedItems()) {
			var i, arrayLen, slot, item, slotsArray;
			slotsArray = [ "weapon", "shield", "head", "torso", "legs" ];
			
			arrayLen = slotsArray.length;
			for (i = 0; i < arrayLen; i++) {
				slot = slotsArray[i];
				item = this.monsterModel.getEquippedItem(slot);
				if (item) {
					this.$[slot].setSrc(item.getImage());
				} else {
					this.$[slot].setSrc("$base-themes-default-theme/images/blank.gif");
				}
			}
		}
	},
	
	getIntelligence: function() {
		return this.monsterModel.int || 10;
	},
	
	getSearchProbability: function() {
		var total;
		total = this.getIntelligence() * this.monsterModel.getSkillLevel("search", true);
		return total / 25;
	},
	
	performTurn: function(map) {
		var player, position, firstAttack, meleeReach, rangeReach, hasLineOfSite, path,
		distanceX, distanceY, absDistanceX, absDistanceY, moveX, moveY, pointA, pointB;
		switch (this.attitude) {
		case "friendly":
			//TODO: not implemented for version 1
			break;

		case "neutral":
			// Move randomly
			map.moveBy(this, Math.round(Math.random()*2)-1, Math.round(Math.random()*2)-1);
			this.setShowing(map.hasLineOfSiteToPlayer(this));
			break;

		case "hostile":
			player = map.getPlayer().getPosition();
			position = this.getPosition();
			firstAttack = this.monsterModel.getEquippedItem("weapon");
			if (!firstAttack) {
				firstAttack = this.monsterModel.getIntrinsicAttacks()[0];
			}
			if (firstAttack) {
				meleeReach = firstAttack.getMeleeReach();
				rangeReach = firstAttack.getRangedReach();
			} else {
				meleeReach = -1;
				rangeReach = -1;
			}
			distanceX = player.x - position.x;
			distanceY = player.y - position.y;
			absDistanceX = Math.abs(distanceX);
			absDistanceY = Math.abs(distanceY);
			
			hasLineOfSite = map.hasLineOfSiteToPlayer(this);
			//TODO: handle spells and fleeing. Better AI.
			if (meleeReach && absDistanceX <= meleeReach && absDistanceY <= meleeReach) {
				// Attack if close enough
				this.attack(map.getPlayer());
			} else if (rangeReach && absDistanceX <= rangeReach && absDistanceY <= rangeReach && 
				hasLineOfSite && this._wantsToShoot(firstAttack)) {
				// TODO: implement attack if close enough
				this.log("Ranged ATTACK")
			} else if (this.pickUpItem(map)) {
				// just picket up an item
			} else if (absDistanceX <= 10 && absDistanceY <= 10) {
				// Move towards player
				if (hasLineOfSite) {
					if (distanceX < 0) {
						moveX = -1;
					} else if (distanceX > 0) {
						moveX = 1;
					} else {
						moveX = 0;
					}

					if (distanceY < 0) {
						moveY = -1;
					} else if (distanceY > 0) {
						moveY = 1;
					} else {
						moveY = 0;
					}
					map.moveBy(this, moveX, moveY);
				} else {
					path = PathFinder.find(map, position, player);
					if (path) {
						pointA = path.pop();
						pointB = path.pop();
						moveX = pointB.x - pointA.x;
						moveY = pointB.y - pointA.y;
						map.moveBy(this, moveX, moveY);
					}
				}
			}
			this.setShowing(map.hasLineOfSiteToPlayer(this));
			break;
		}
	},
	
	attack: function(defender) {
		var weapon = this.monsterModel.getEquippedItem("weapon");
		if (weapon) {
			this.useAttack(weapon, defender, 0, 0);
		}

		this.monsterModel.getIntrinsicAttacks().forEach(function(attack) {
			this.useAttack(attack, defender, 0, 0);
		}.bind(this));
	},

	takeDamage: function(damage, attacker) {
		var died;
		if (this.damageAnimationTimer) {
			window.clearTimeout(this.damageAnimationTimer);
			this.$.status.removeClass("animate");
		}

		died = this.monsterModel.takeDamage(damage);
		if (died) {
			this.doDied();
		} else {
			// Make sure the monster is hostile since it was just attacked
			if (this.attitude !== "hostile") {
				this.removeClass(this.attitude);
				this.monsterModel.setAttitude("hostile");				
				this.attitude = "hostile";
				this.addClass("hostile");
			}

			this.$.status.setContent(damage);
			
			var that = this;
			window.setTimeout(function() {
				that.$.status.addClass("animate");
			}, 10);
			
			this.damageAnimationTimer = window.setTimeout(function() {
				that.damageAnimationTimer = undefined;
				that.$.status.setContent("");
				that.$.status.removeClass("animate");
			}, 550);
		}
		
		return died;
	},
	
	equipItem: function(inventoryIndex) {
		var result = this.monsterModel.equipAnItem(inventoryIndex);
		if (!result) {
			this.doAlertDialog();
		} else {
			this.showEquippedItems();
			this._statsChanged();
		}
		return result;
	},
	
	unequipItem: function(inventoryIndex) {
		var result = this.monsterModel.unequipAnItem(inventoryIndex);
		this.showEquippedItems();
		this._statsChanged();
		return result;
	},
	
	pickUpItem: function(map) {
		var position, items, foundSomething = false;
		if (this.monsterModel.canUseItems()) {
			position = this.getPosition();
			items = map.whatIsAt(position.x, position.y, true);
			if (items && items.length > 0) {
				//TODO: implement picking up and equipping.
			}
		}		
		return foundSomething;
	},
	
	addItem: function(item) {
		var i, length, inventory, inventoryItem;
		inventory = this.monsterModel.inventory;
		// Try to consolidate this item if the same items are already in inventory
		if (item.canConsolidate()) {
			i = 0;
			length = inventory.length;
			while (i < length) {
				inventoryItem = inventory[i];
				if (inventoryItem.consolidate(item)) {
					break;
				} else {
					++i;
				}
			}
			
			// Wasn't consolidated so push it into the inventory list
			if (i === length) {
				inventory.push(item);
			}
		} else {
			inventory.push(item);
		}
	},
	
	getInventoryList: function() {
		return this.monsterModel.inventory || [];
	},
	
	getCorpseItem: function(turnCount) {
		var extras, corpse;
		corpse = this.monsterModel.getCorpse();
		if (corpse) {
			monsterName = this.monsterModel.getDisplayName(true);
			extras = {
				monsterName: this.monsterModel.getDisplayName(true),
				tileImg: this.monsterModel.getTileImg(),
				deathTurn: turnCount
			};
			return new ItemModel("corpse", corpse, extras);
		} else {
			return null;
		}
	},
	// range=0 means melee attack
	useAttack: function(weapon, defender, range, extraBonus) {
		var success=false, death=false, statusText="", tohit, defenses, damage, newLevel;

		tohit = (20 * Math.random()) + (weapon.getAccuracy(range) * this.monsterModel.getSkillLevel(weapon, true, range>0)) + extraBonus;
		defenses = defender.monsterModel.getDefense();

		if (tohit < defenses.dodge) {
			if (this.isPlayer()) {
				statusText = ActorOnMap.kAttackYouMissed.evaluate({name:defender.whatAreYou()});
			} else {
				statusText = $L("You dodged the attack");
				defender.exerciseSkill("dodge");
			}
		} else if (tohit < defenses.dodge + defenses.block) {
			if (this.isPlayer()) {
				statusText = ActorOnMap.kAttackItBlocked.evaluate({name:defender.whatAreYou()});
			} else {
				statusText = $L("You block the attack");
				defender.exerciseSkill("shield");
				defender.maybeIdentify("shield");
			}
		} else if (tohit < defenses.dodge + defenses.block + defenses.ac) {
			if (this.isPlayer()) {
				statusText = ActorOnMap.kAttackItNotHurt.evaluate({name:defender.whatAreYou()});
			} else {
				statusText = $L("Your armor deflects the attack");
				defender.exerciseSkill("armor");
				defender.maybeIdentify("armor");
			}
		} else {
			success = true;
			damage = weapon.calcDamage(this.monsterModel.getSkillLevel(weapon, false, range>0));
			death = defender.takeDamage(damage, this);
			
			if (this.isPlayer()) {
				if (death) {
					statusText = ActorOnMap.kAttackYouKilledIt.evaluate({name:defender.whatAreYou()});
					newLevel = this.monsterModel.addExperience(defender.monsterModel.getDeathXp());
					if (newLevel) {
						this._levelUp();
					} else {
						this._statsChanged();
					}
				} else {
					statusText = ActorOnMap.kAttackYouHitIt.evaluate({name:defender.whatAreYou(), damage:damage});
				}

				this.exerciseSkill(weapon.getSkillRequired(range>0));
				this.maybeIdentify("weapon");
				if (range > 0) {
					this.maybeIdentify("quiver");
				}
			} else {
				statusText = ActorOnMap.kAttackItHitYou.evaluate({damage:damage});
			}
		}
		
		if (statusText) {
			this.doStatusText(statusText);
		}
		
		return success;
	},
	
	exerciseSkill: function(skillName) {
		if (this.monsterModel.exerciseSkill(skillName)) {
			this._statsChanged();
		}
	},
	
	maybeIdentify: function(slot) {
		// +10 bonus if the item is in use and therefore the magic is noticeable.
		var statusText, item = this.monsterModel.maybeIdentify(slot, 10);
		if (item) {
			statusText = (new enyo.g11n.Template($L("You realize you have a #{name}"))).evaluate({name:item.getDisplayName()});
			this.doStatusText(statusText);
		}
	},
	
	_levelUp: function() {
		// base version of this function does nothing.
	},
	
	_statsChanged: function() {
		return ""; // base version of this function does nothing.
	},
	
	_wantsToShoot: function(weapon) {
		//TODO: implement this: check if weapon is sling or bow (and has ammo) or weapon is not the actor's last one.
		return false;
	}
});
