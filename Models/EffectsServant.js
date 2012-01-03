/*
 * This helper class encapsulates code for managing effects on the MonsterModel
 */
var EffectsServant = function(monsterModel) {
	this.monsterModel = monsterModel;
};

// Static function to create a disease effect
EffectsServant.prototype.addDiseaseEffect = function(amount) {
	this.addEffect({
		effect: "disease",
		duration: 100 + amount
	});
};

EffectsServant.prototype.addEffect = function(effect) {
	// Duration of -1 means permanent (until dispelled) and >0 will expire.
	// But 0 means instantaneous and permanent.
	if (effect.duration) {
		this._trackEffect(effect);
	}
	
	// Special case: disease reduces your strength by a percent. Apply this here
	if (effect.effect === "disease") {
		effect.attribute = "str";
		effect.attrAmount = -Math.floor(this.monsterModel.str / 3);
	}
	
	this._applyEffect(effect, false);
};

EffectsServant.prototype.undoEffect = function(effect) {
	this._applyEffect(effect, true);
};

EffectsServant.prototype.expireEffects = function() {
	var effects, i, e, expired = false;
	effects = this.monsterModel.effects;
	if (effects) {
		for (i = effects.length - 1; i >= 0; i--) {
			e = effects[i];
			if (e.endTurn < GameMain.turnCount) {
				effects.pop();
				this._applyEffect(e, true);
				expired = true;
			} else {
				//No more expired effects, so break from the loop
				break;
			}
		}
	}
	
	return expired;
};

EffectsServant.prototype._applyEffect = function(effectObj, undo) {
	var amount, attrAmount, monster, effect;
	
	monster = this.monsterModel;
	amount = effectObj.amount || 1;
	attrAmount = effectObj.attrAmount || 1;
	if (undo) {
		amount = -amount;
		attrAmount = -attrAmount;
	}
	
	if (effectObj.attribute) {
		monster[effectObj.attribute] += attrAmount;
		if (monster.effectChangedCallback) {
			monster.effectChangedCallback(effectObj.attribute, monster[effectObj.attribute], attrAmount);
		}
	}

	if (effectObj.effect) {
		effect = effectObj.effect;
		switch (effect) {
		case "inebriated":
		case "poison":
			// Build up resistance to these effects
			if (amount > 0) {
				if (!monster.resistances) {
					monster.resistances = {};
				}
				if (!monster.resistances[effect]) {
					monster.resistances[effect] = 1;
				} else {
					monster.resistances[effect] += 1;
				}
				amount = Math.max(0, amount - monster.resistances[effect]);
				effectObj.amount = amount;
			}
			//intentionally falling thru
		case "disease":
			if (monster[effect]) {
				monster[effect] = Math.max(0, monster[effect] + amount);
			} else {
				monster[effect] = amount;
			}

			if (monster.effectChangedCallback) {
				monster.effectChangedCallback(effect, monster[effect], amount);
			}
			
			break;

		case "heal":
			monster.takeDamage(-amount);
			break;

		case "health":
			monster.takeDamage(-amount);
			this._cancelEffect("disease", 2);
			break;

		case "poisonAntidote":
			this._cancelEffect("poison", amount);
			break;
		}
	}
};

EffectsServant.prototype._trackEffect = function(effect) {
	var effects, i, e;
	if (effect.duration > 0) {
		effect.endTurn = GameMain.turnCount + effect.duration;
	}
	
	if (!this.monsterModel.effects) {
		this.monsterModel.effects = [effect];
	} else {
		// Keep the list sorted by endTurn (those that don't end at the front of the list)
		effects = this.monsterModel.effects;
		if (!effect.endTurn) {
			effects.unshift(effect);
		} else {
			for (i = effects.length - 1; i >= 0; i--) {
				e = effects[i];
				if (!e.endTurn || effect.endTurn <= e.endTurn) {
					effects.splice(i+1, 0, effect);
					break;
				}
			}
			
			if (i < 0) {
				effects.unshift(effect);
			}
		}
	}
};

EffectsServant.prototype._cancelEffect = function(effectType, amount) {
	var effects, i, e;
	effects = this.monsterModel.effects;
	if (effects) {
		for (i = effects.length - 1; amount > 0 && i >= 0; i--) {
			e = effects[i];
			if (e.effect === effectType) {
				this._applyEffect(e, true);
				effects.splice(i, 1);
				--amount;
			}
		}
	}
};

