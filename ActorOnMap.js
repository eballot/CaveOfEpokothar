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
		name: "cloak",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "avatar",
		kind: enyo.Image,
		className: "wearables"
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
		name: "shoes",
		kind: enyo.Image,
		className: "wearables"
	}, {
		name: "glove",
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

		this.__defineGetter__("attitude", this.getAttitude);
		this.__defineSetter__("attitude", this.setAttitude);
		if (this.monsterModel) {
			m = this.monsterModel;
			this.$.avatar.setSrc(m.getGraphic());
			this.showEquippedItems();
			this.attitude = m.getAttitude();
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
				text = new enyo.g11n.Template($L("#{name} (ignoring you)")).evaluate({name:this.monsterModel.getDisplayName()});
				break;
			case "friendly":
				text = new enyo.g11n.Template($L("#{name} (friendly)")).evaluate({name:this.monsterModel.getDisplayName()});
				break;
			default:
				text = new enyo.g11n.Template($L("#{name} (it looks hostile)")).evaluate({name:this.monsterModel.getDisplayName()});
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
			slotsArray = [ "weapon", "shield", "head", "torso", "legs", "shoes", "glove", "cloak" ];
			
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
		return total / 20;
	},
	
	performTurn: function(map) {
		this.ai.performTurn(map);
		this.setShowing(map.hasLineOfSiteToPlayer(this));
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

	rangedAttack: function(weapon, target, map) {
		var needsAmmo, ammoItem, remainingUses;
		needsAmmo = weapon.requiresAmmunition();
		if (needsAmmo) {
			ammoItem = this.monsterModel.getEquippedItem("quiver");
			if (!ammoItem) {
				remainingUses = 0;
				this.doStatusText($L('<span style="color:red">You need to select ammunition.</span>'));
			} else if (ammoItem.getSkillRequired(true) !== weapon.getSkillRequired(true)) {
				this.doStatusText($L('<span style="color:red">Wrong type of ammunition selected.</span>'));
				remainingUses = 0;
			} else {
				remainingUses = ammoItem.getRemainingUses();
			}
		} else {
			remainingUses = weapon.getRemainingUses();
		}
		
		if (remainingUses) {
			if (!ammoItem) {
				ammoItem = weapon;
			}
			
			if (ammoItem.useItOnce() === 0) {
				//statusText = (new enyo.g11n.Template($L('<span style="color:red">You used the last #{name} in your quiver.</span>'))).evaluate({name:ammoItem.getDisplayName()});
				//this.doStatusText(statusText);
				this.monsterModel.removeItemFromInventory(ammoItem);
				if (!needsAmmo) {
					// Thrown weapon so maybe no weapon is equipped
					this.showEquippedItems();
				}
			}

			map.shootMissileOnPath(this, target, weapon, ammoItem);

			this._statsChanged();
		}
	},
	
	isDead: function() {
		return this.monsterModel.isDead();
	},
	
	getDamageTaken: function() {
		return this.monsterModel.getDamageTaken();
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
				this.attitude = "hostile";
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
	
	dropItem: function(map, index) {
		var item, position;

		item = this.monsterModel.dropItemByIndex(index);
		position = this.getPosition();
		map.addItem(item, position.x, position.y);

		this.showEquippedItems();
		this._statsChanged();
	},
	
	addItem: function(item, autoEquip) {
		this.monsterModel.addItem(item, autoEquip);
		if (autoEquip) {
			this.showEquippedItems();
		}
		this._statsChanged();
	},
	
	equipBestWeapon: function(absDistanceX, absDistanceY, hasLineOfSite) {
		var equippedWeapon, ammoItem, meleeReach, inventory, i, length, item, skill;

		equippedWeapon = this.monsterModel.getEquippedItem("weapon");
		if (equippedWeapon) {
			meleeReach = equippedWeapon.getMeleeReach();
			// Be somewhat intelligent and switch to a melee weapon if in melee range or
			// ranged weapon if outside of melee range
			if (meleeReach === -1) {
				// Using a ranged weapon. Switch to a melee weapon if there's no more ammo or enemy is in the adjacent tile.
				// TODO: add logic to use non-ammo range weapons (darts and such)
				ammoItem = this.monsterModel.getEquippedItem("quiver");
				if (!ammoItem || ammoItem.getRemainingUses() === 0 || (absDistanceX < 2 && absDistanceY < 2)) {
					// Select most powerful melee weapon
					inventory = this.getInventoryList();
					length = inventory.length;
					for (i = 0; i < length; i++) {
						item = inventory[i];
						if (item.getMeleeReach() > 0) {
							//TODO: for now, just selecting the first melee weapon. Need to improve this once actors start picking up weapons 
							this.equipItem(i);
							equippedWeapon = item;
							break;
						}
					}
				}
			} else {
				// Using a melee weapon. Switch to a ranged weapon if the enemy is distant and have ammo.
				if (absDistanceX > meleeReach || absDistanceY > meleeReach) {
					ammoItem = this.monsterModel.getEquippedItem("quiver");
					if (ammoItem && ammoItem.getRemainingUses() > 0) {
						// Select ranged weapon that can fire the ammo
						skill = ammoItem.getSkillRequired(true);
						inventory = this.getInventoryList();
						length = inventory.length;
						for (i = 0; i < length; i++) {
							item = inventory[i];
							if (skill === item.getSkillRequired(true)) {
								//TODO: for now, just selecting the first appropriate ranged weapon. Need to improve this once actors start picking up weapons 
								this.equipItem(i);
								equippedWeapon = item;
								break;
							}
						}
					}
				}
			}
		}
		return equippedWeapon;
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
		var success=false, death=false, statusText="", tohit, defenses, damage, newLevel, ammoItem;

		tohit = Math.random() * 20;
		if (this.isPlayer() && tohit < 5) {
			this.exerciseSkill("fight");
		}
		tohit = (tohit * this.monsterModel.getSkillLevel("fight", true)) + (weapon.getAccuracy(range) * this.monsterModel.getSkillLevel(weapon, true, range>0)) + extraBonus;
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
			if (range > 0) {
				// Include the ammunition's damage, if any
				ammoItem = this.monsterModel.getEquippedItem("quiver");
				if (ammoItem) {
					damage += ammoItem.calcDamage(0);
				}
			}
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
			statusText = '<span style="color:lightgreen;">' + statusText + '</span>';
			this.doStatusText(statusText);
		}
	},

	getAttitude: function() {
		return this._attitude;
	},

	setAttitude: function(attitude) {
		if (this._attitude !== attitude) {
			if (this._attitude) {
				this.removeClass(this._attitude);
			}
			this.addClass(attitude);
			this.monsterModel.setAttitude(attitude);
			this._attitude = attitude;
			
			if (attitude === "neutral") {
				this.ai = new NeutralAI(this);
			} else {
				this.ai = new HostileAI(this);
			}
		}
	},

	wantsToShoot: function(weapon) {
		var ammoItem;
		
		// For now, wants to shoot until ammo is used up
		if (weapon.requiresAmmunition()) {
			ammoItem = this.monsterModel.getEquippedItem("quiver");
			if (ammoItem) {
				return (ammoItem.getRemainingUses() > 0);
			}
		}
		return false;
	},
	
	_levelUp: function() {
		// base version of this function does nothing.
	},
	
	_statsChanged: function() {
		return ""; // base version of this function does nothing.
	}
});
