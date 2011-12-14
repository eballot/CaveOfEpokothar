var NeutralAI = function(actor) {
	this.actor = actor;
};

NeutralAI.prototype.performTurn = function(map) {
	// TODO: maybe pick up stuff if the actor has hands
	map.moveBy(this.actor, Math.round(Math.random()*2)-1, Math.round(Math.random()*2)-1);
	return true;
};
