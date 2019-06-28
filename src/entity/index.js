const sprite = require('../sprite');

// A "thing" in the game world. 
//
// Can update its own state and draw itself.
class Entity{
	constructor(x, y){
		this.x = x;
		this.y = y;

		this.state;
		this.stateHandlers = {};
		this.animation;
		this.nextAnimation = [];
		this.time;
	}

	// Register a handler to call when the entity is in a certain
	// state.
	registerState(state, handler, defaultState=false){
		this.stateHandlers[state] = handler;

		if(defaultState === true){
			this.state = state;
		}

		return this;
	}

	get stateHandler(){
		return this.stateHandlers[this.state];
	}

	// Handle the current state based on the entity and the game world.
	// Drive the animation based on the state, which are 1:1 for now.
	update(world){
		// If this is the first update, then we must rewind the animation
		// later
		this.time = world.time;
		this.stateHandler(this, world);

		this.animation.x = this.x;
		this.animation.y = this.y;
		if(this.nextAnimation[this.nextAnimation.length - 1]){
			this.animation = this.nextAnimation.pop().rewind();
		}
		this.animation.advance(this.time);
	}

	draw(){
		this.animation.draw();
	}
}

// A series of sprites played in sequence, optionally as a loop.
class Animation{
	constructor(spriteSheet, context, slices, frameSpeed, loop=false){
		this.time;
		this.x;
		this.y;

		this.sprites = [];
		slices.map(slice => {
			this.sprites.push(new sprite.Sprite(spriteSheet, context, ...slice));
		});
		
		this.loop = loop;
		this.index = 0;
		this.nextSpriteTime;
		
		// I think this is wrong...
		this.frameSpeed = frameSpeed;
	}

	get sprite(){
		return this.sprites[this.index];
	}

	draw(){
		let sprite = this.sprite;
		sprite.draw(this.x, this.y, 10);
	}

	// Reset to the first sprite in the animation.
	rewind(){
		this.index = 0;
		this.nextSpriteTime = null;

		return this;
	}

	// Advance to the next sprite in the animation if enough time
	// has passed.
	advance(time){
		this.time = time;

		// If this is the first advance, initialize to one frameSpeed from now.
		this.nextSpriteTime = this.nextSpriteTime || time + this.frameSpeed;

		if(this.time > this.nextSpriteTime){
			// Advance to the next frame. But if we're at the end, then either 
			// loop back around or stay on the last frame.
			this.index++;

			if(this.loop === true){
				this.index = this.index % this.sprites.length;
			} else if(this.index === this.sprites.length) {
				this.index--;
			}

			this.nextSpriteTime = this.nextSpriteTime + this.frameSpeed;
		}
	}
}


module.exports = {
	"Entity": Entity,
	"Animation": Animation
}