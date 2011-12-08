/*jslint white: false, undef: true, eqeqeq: true */ 
/*global window, enyo, $L, JSON */

enyo.kind({
	name: "PlayerOnMap",
	kind: "ActorOnMap",
	className: "on-map actor-styles player",
	events: {
		onActed: "",
		onShowInventory: "",
		onStatsChanged: ""
	},
	components: [{
		name: "interactionChoicePopup",
		kind: enyo.PopupSelect,
		onSelect: "_handleInteractionChoice"
	}],
	statics: {
		kRangedAttackShoot: new enyo.g11n.Template($L("Shoot with #{weaponName}")),
		kRangedAttackThrow: new enyo.g11n.Template($L("Throw #{weaponName}"))
	},
	
	createNewCharacter: function(details) {
		var faceGraphic;
		if (!details || !details.race) {
			this.error("Bad details "+JSON.stringify(details));
		}
		details.isPlayer = true;
		this.monsterModel = new MonsterModel(details);

		this.$.avatar.setSrc(this.monsterModel.getGraphic());
		faceGraphic = this.monsterModel.getFaceGraphic();
		if (faceGraphic) {
			this.$.face.setSrc(faceGraphic);
		}
		this.showEquippedItems();
		this._statsChanged();
	},

	save: function() {
		var serialized = this.saveToString();
		localStorage.setItem("player", serialized);
	},
	
	restore: function() {
		var serialized, data;
		serialized = localStorage.getItem("player");
		if (serialized) {
			data = JSON.parse(serialized);
			this.positionAt(data.position.x, data.position.y);
			this.monsterModel = MonsterModel.loadFromObject(data.monsterModel);
			this.$.avatar.setSrc(this.monsterModel.getGraphic());
			this.showEquippedItems();
			this._statsChanged();
		}
		
		return !!serialized;
	},

	isPlayer: function() {
		return true;
	},
	
	updateWeightCarried: function(weight) {
		return this.monsterModel.updateWeightCarried(weight);
	},
	
	getDefenses: function() {
		return this.monsterModel.getDefense();
	},

	interactWithMap: function(map, x, y, turnCount) {
		var done, i, inventory, currentPosition, rad, distanceX, distanceY, absDistanceX, absDistanceY, nearX, nearY,
		    something, firstAttack, meleeReach, rangeReach, changedCallback, options, text;
		done = false;
		currentPosition = this.getPosition();
		distanceX = x - currentPosition.x;
		distanceY = y - currentPosition.y;
		absDistanceX = Math.abs(distanceX);
		absDistanceY = Math.abs(distanceY);
		
		// First the simple case: player tapped on the player
		if (distanceX === 0 && distanceY === 0) {
			this.doShowInventory();
		} else {
			// Next deal with anything in my path
			rad = absDistanceX / absDistanceY;
			if (rad < 0.4 || distanceX === 0) {
				nearX = currentPosition.x;
				distanceX = 0;
			} else {
				if (distanceX > 0) {
					nearX = currentPosition.x + 1;
					distanceX = 1;
				} else {
					nearX = currentPosition.x - 1;
					distanceX = -1;
				}
			}

			if (rad > 4 || distanceY === 0) {
				nearY = currentPosition.y;
				distanceY = 0;
			} else {
				if (distanceY > 0) {
					nearY = currentPosition.y + 1;
					distanceY = 1;
				} else {
					nearY = currentPosition.y - 1;
					distanceY = -1;
				}
			}
			
			something = map.whatIsAt(nearX, nearY, false);
			if (something) {
				if (something.kind === "ActorOnMap") {
					firstAttack = this.monsterModel.getEquippedItem("weapon");
					meleeReach = firstAttack ? firstAttack.getMeleeReach() : 1;
					if (meleeReach > 0) {
						done = true;
						this.attack(something);
						this._finishMyTurn(MonsterModel.hunger.fight);
					}
				} else if (something.kind === MapTile.closedDoor.kind) {
					done = true;
					map.openDoorAt(nearX, nearY);
					this._autoHeal(turnCount);
					this._finishMyTurn(MonsterModel.hunger.walkNormal);
				}
			}
			
			if (!done) {
				// Is there something where the player tapped?
				something = map.whatIsAt(x,y, false);
				if (!something) {
					this.move(map, distanceX, distanceY);
					this._autoHeal(turnCount);
				} else {
					//TODO: handle all attacks
					firstAttack = this.monsterModel.getEquippedItem("weapon");
					if (!firstAttack) {
						firstAttack = this.monsterModel.getIntrinsicAttacks()[0];
					}
					meleeReach = firstAttack ? firstAttack.getMeleeReach() : 1;
					rangeReach = firstAttack ? firstAttack.getRangedReach() : 0;

					if (something.kind === "ActorOnMap") {
						if (absDistanceX <= meleeReach && absDistanceY <= meleeReach) {
							this.attack(something);
							this._finishMyTurn(MonsterModel.hunger.fight);
						} else {
							options = [
								{ caption:something.whatAreYou(true), action:something.describeYourself.bind(something) }, //TODO: display the description
								{ caption:$L("Move"), action:this.move.bind(this, map, distanceX, distanceY) }
							];
							
							if (rangeReach > 0 && absDistanceX <= rangeReach && absDistanceY <= rangeReach && map.hasLineOfSiteToPlayer(something)) {
								if (firstAttack.requiresAmmunition()) {
									text = PlayerOnMap.kRangedAttackShoot.evaluate({weaponName:firstAttack.getDisplayName(true)});
								} else {
									text = PlayerOnMap.kRangedAttackThrow.evaluate({weaponName:firstAttack.getDisplayName(true)});
								}
								options.push({
									caption:text,
									action:this.rangedAttack.bind(this, firstAttack, something, map,
											{range:Math.max(absDistanceX, absDistanceY), x:x, y:y})
								});
							}
							
							this.$.interactionChoicePopup.setItems(options);
							this.$.interactionChoicePopup.openAtControl(something);
						}
					} else if (something.kind === "PlayerOnMap") {
						this.doShowInventory();
					// If you tapped on an open door and it is next to the player and it isn't block by items, then allow it to be closed
					} else if (something.kind === MapTile.openDoor.kind && (absDistanceX < 2 && absDistanceY < 2) && !map.getItemPileAt({x:x, y:y})) {
						options = [
							{ caption:$L("Close Door"), action:this.closeDoorAt.bind(this, map, x, y) },
							{ caption:$L("Move"), action:this.move.bind(this, map, distanceX, distanceY) }
						];
						
						this.$.interactionChoicePopup.setItems(options);
						this.$.interactionChoicePopup.openAtCenter();
					} else {
						this.move(map, distanceX, distanceY);
						this._autoHeal(turnCount);
					}
				}
			}

			// Check the player's inventory to see if anything has changed
			inventory = this.getInventoryList();
			var that = this;
			changedCallback = function(state) {
				if (state === "rotten") {
					that.doStatusText($L("Something smells rotten"));
				} else if (state === "delete") {
					that.doStatusText($L("Your pack feels lighter"));
				}
			};
			for (i = inventory.length - 1; i >= 0; i--) {
				if (inventory[i].checkAge(turnCount, changedCallback)) {
					inventory.splice(i, 1);
				}
			}
		}
	},
	
	rest: function(turnCount) {
		this._autoHeal(turnCount);
		this._finishMyTurn(MonsterModel.hunger.rest);
	},
	
	closeDoorAt: function(map, x, y) {
		map.closeDoorAt(x, y);
		this._finishMyTurn(MonsterModel.hunger.walkNormal);
	},
	
	move: function(map, distanceX, distanceY) {
		var moveX, moveY, encumberance, position, itemPile, pickedUpItems, itemNames, item, i, statusTemplate, statusText;
		moveX = (distanceX > 0) ? 1 : (distanceX < 0) ? -1 : 0;
		moveY = (distanceY > 0) ? 1 : (distanceY < 0) ? -1 : 0;

		encumberance = this.monsterModel.getEncumberance();
		if (encumberance > 100) {
			this.doStatusText($L("You're carrying so much stuff that you can't move."));
		} else {
			map.moveBy(this, moveX, moveY);
	
			// Check if there's items to automatically pickup
			position = this.getPosition();
			itemPile = map.getItemPileAt(position);
			if (itemPile) {
				// Try to avoid going over 100% encumberance
				if (encumberance < 95) {
					pickedUpItems = itemPile.autoPickupItems();
					if (pickedUpItems.length > 0) {
						statusTemplate = new enyo.g11n.Template($L("You pick up: #{name}."));
						for (i = 0; i < pickedUpItems.length; i++) {
							item = pickedUpItems[i];
							this.addItem(item);
							statusText = statusTemplate.evaluate({name:item.getDisplayName()});
							this.doStatusText(statusText);
						}
						this._statsChanged();
						
						map.itemPileChanged(position);
					}
				}
				
				itemNames = itemPile.listItemNames();
				if (itemNames.length > 0) {
					if (itemNames.length === 1) {
						statusText = new enyo.g11n.Template($L("You see: #{name}.")).evaluate({name:itemNames[0]});
					} else if (itemNames.length > 5) {
						statusText = $L("There are many items here.");
					} else {
						statusText = new enyo.g11n.Template($L("You see: #{names}.")).evaluate({names:itemNames.sort().join(", ")});
					}
					this.doStatusText(statusText);
				}
			}
			
			// Perform auto-search of adjacent tiles
			map.searchNearby(this, 1);
		}

		this._finishMyTurn(MonsterModel.hunger.walkNormal);
	},

	rangedAttack: function(weapon, target, map, distance) {
		var needsAmmo, ammoItem, remainingUses = 1;
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
		this._finishMyTurn(MonsterModel.hunger.fight);
	},
	
	takeDamage: function(damage, attacker) {
		var died;
		if (this.damageAnimationTimer) {
			window.clearTimeout(this.damageAnimationTimer);
			this.$.status.removeClass("animate");
		}

		died = this.monsterModel.takeDamage(damage);
		if (died) {
			this.$.status.setContent("dead");
			this.doDied(new enyo.g11n.Template($L("You were killed by a #{name}.")).evaluate({name:attacker.whatAreYou(false)}));
		} else {
			this.$.status.setContent(damage);
		}
		
		var that = this;
		window.setTimeout(function() {
			that.$.status.addClass("animate");
		}, 10);
		
		this.damageAnimationTimer = window.setTimeout(function() {
			that.damageAnimationTimer = undefined;
			that.$.status.setContent("");
			that.$.status.removeClass("animate");
		}, 500);

		this._statsChanged();
		
		return died;
	},
	
	eatItem: function(index) {
		var result = null, prehunger, posthunger;
		prehunger = this.monsterModel.getHunger(false);
		result = this.monsterModel.eatItemByIndex(index);
		// null result means ok. if the hunger level changed, update the stats bar
		if (!result && prehunger !== this.monsterModel.getHunger(false)) {
			this._statsChanged();
		}

		return result;
	},
	
	_finishMyTurn: function(hungerChange) {
		var hungerDescription = this.monsterModel.updateHunger(hungerChange);
		if (hungerDescription) {
			if (this.hungerDescription !== hungerDescription) {
				this.hungerDescription = hungerDescription;
				this._statsChanged();
			}
			this.doActed(hungerDescription);
		} else {
			this.doDied($L("You starved to death."));
		}
	},
	
	_autoHeal: function(turnCount) {
		var damageTaken = this.monsterModel.getDamageTaken();
		if (damageTaken > 0 && turnCount % 15 === 0) {
			// negative damage heals 
			this.monsterModel.takeDamage(-1);
			this.monsterModel.updateHunger(MonsterModel.hunger.autoHeal);
			this._statsChanged();
		}
	},
	
	_handleInteractionChoice: function(inSender, inData) {
		if (inData && inData.action) {
			inData.action();
		}
	},
	
	_levelUp: function() {
		//TODO: Level-up code (+hp and attrs)
		this.doStatusText($L('<span style="color:lightgreen;">You gained a level!</span>'));
		this._statsChanged();
	},
	
	_statsChanged: function() {
		var i, content = [], text, hp, damageTaken, defenses, weapon, hpColor, knownSkills, skill, skillLevel, ammoItem;
		hp = this.monsterModel.hp;
		damageTaken = this.monsterModel.getDamageTaken();
		defenses = this.getDefenses();
		weapon = this.monsterModel.getEquippedItem("weapon");
		hpColor = (damageTaken / hp > 0.75) ? '<span style="color:red;">' : "<span>";

		content.push("HP: " + hpColor + (hp - damageTaken) + "</span>/" + hp);
		content.push("Str: " + this.monsterModel.str);
		content.push("Dex: " + this.monsterModel.dex);
		content.push("Int: " + this.monsterModel.int);
		content.push("AC: " + Math.floor(defenses.ac) + ", Block: " + Math.floor(defenses.block) + ", Dodge: " + Math.floor(defenses.dodge));
		content.push("Level: " + this.monsterModel.getLevel() + " (" + this.monsterModel.getExpToNextLevel() + ")");
		if (weapon) {
			text = "Wielding: " + weapon.getDisplayName(true);
			if (weapon.requiresAmmunition()) {
				ammoItem = this.monsterModel.getEquippedItem("quiver");
				if (ammoItem && ammoItem.getSkillRequired(true) === weapon.getSkillRequired(true)) {
					text += " (" + ammoItem.getRemainingUses() + ")";
				} else {
					text += ' (<span style="color:red">empty</span>)';
				}
			}
			content.push(text);
		}
		content.push(this.monsterModel.getHunger(true));
		
		knownSkills = this.monsterModel.getKnownSkills();
		if (knownSkills) {
			content.push("Known Skills");
			for (i = 0; i < knownSkills.length; i++) {
				skill = knownSkills[i];
				skillLevel = this.monsterModel.getSkillLevel(skill, false);
				if (skillLevel > 0) {
					content.push("<li>" + kSkills.getDisplayname(skill) + ": " + skillLevel + " (" + this.monsterModel.getSkillXpLevel(skill) + "%)");
				}
			}
		}
		
		this.doStatsChanged(content.join("<br/>"));
	}
});
