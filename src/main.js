const engine = require('./engine');
const sprite = require('./sprite');
const entity = require('./entity');


module.exports = {
	"Game": engine.Game,
	"Loader": sprite.Loader,
	"Entity": entity.Entity,
	"Animation": entity.Animation,
}

