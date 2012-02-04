var HostileAI = function(actor) {
	this.actor = actor;
	// Flag to indicate that the actor is aware of the player
	//TODO: for now, they're always aware. Need to implement noise/stealth
	this.awareOfPlayer = true;
};

HostileAI.prototype.performTurn = function(map) {
	var i, length, acted, player, position, inventory, attacks, equippedWeapon, hasLineOfSite, path,
	distanceX, distanceY, absDistanceX, absDistanceY, moveX, moveY, pointA, pointB, something;

	if (!this.awareOfPlayer) {
		//TODO: Check if the player is seen or heard
	} else {
		player = map.getPlayer().getPosition();
		position = this.actor.getPosition();
		
		//TODO: check if there's anything worth picking up and using.
		
		distanceX = player.x - position.x;
		distanceY = player.y - position.y;
		absDistanceX = Math.abs(distanceX);
		absDistanceY = Math.abs(distanceY);
		hasLineOfSite = map.hasLineOfSiteToPlayer(this.actor);
		if (hasLineOfSite) {
			// First see if we're within range for intrinsic attacks
			attacks = this.actor.monsterModel.getIntrinsicAttacks();
			length = attacks.length;
			for (i = 0; i < length; i++) {
				if (this._attackWith(attacks[i], map, absDistanceX, absDistanceY, hasLineOfSite)) {
					acted = true;
				}
			}

			inventory = this.actor.getInventoryList();
			if (inventory && inventory.length > 0) {
				// Now try to use a good weapon for the circumstances
				equippedWeapon = this.actor.equipBestWeapon(absDistanceX, absDistanceY, hasLineOfSite);
				if (equippedWeapon) {
					acted = this._attackWith(equippedWeapon, map, absDistanceX, absDistanceY, hasLineOfSite);
				}
			}
		}

		if (!acted) {
			//TODO: handle spells and fleeing. Better AI.
			if (this.actor.pickUpItem(map)) {
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
					something = map.whatIsAt(position.x + moveX, position.y + moveY);
					// check to see if I need to step around other actors
					if (something && something.obstructed) {
						path = PathFinder.find(map, position, player);
						if (path) {
							pointA = path.pop();
							pointB = path.pop();
							moveX = pointB.x - pointA.x;
							moveY = pointB.y - pointA.y;
						}
					}
					map.moveBy(this.actor, moveX, moveY);
				} else {
					path = PathFinder.find(map, position, player);
					if (path) {
						pointA = path.pop();
						pointB = path.pop();
						moveX = pointB.x - pointA.x;
						moveY = pointB.y - pointA.y;
						map.moveBy(this.actor, moveX, moveY);
					}
				}
			}
		}
	}
	
	return true;
};

HostileAI.prototype._attackWith = function(weapon, map, absDistanceX, absDistanceY, hasLineOfSite) {
	var attacked = false, meleeReach, rangeReach;

	meleeReach = weapon.getMeleeReach();
	rangeReach = weapon.getRangedReach();
	if (absDistanceX <= meleeReach && absDistanceY <= meleeReach) {
		// Attack if close enough
		this.actor.attack(map.getPlayer());
		attacked = true;
	} else if (hasLineOfSite && absDistanceX <= rangeReach && absDistanceY <= rangeReach && weapon.requiresAmmunition() && this.actor.wantsToShoot(weapon)) {
		this.actor.rangedAttack(weapon, map.getPlayer(), map);
		attacked = true;
	}
	return attacked;
};
