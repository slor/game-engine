// A "thing" in the game world. 
//
// Can update its own state and draw itself.
class Entity{
	constructor(x, y){
		this.x = x;
		this.y = y;

		this.state;
		this.defaultState;
		this.stateHandlers = {};
		this.animations = {};
		this.animation;
		this.time;
	}

	// Register an animation to play when the entity is in a certain state.
	registerAnimation(state, sprites, frameSpeed, loop=false){
		this.animations[state] = new Animation(sprites, frameSpeed, loop);

		return this;
	}

	// Register a handler to call when the entity is in a certain
	// state.
	registerState(state, handler, defaultState=false){
		this.stateHandlers[state] = handler;

		if(defaultState === true){
			this.defaultState = state;
		}

		return this;
	}

	// Handle the current state based on the entity and the game world.
	// Drive the animation based on the state, which are 1:1 for now.
	update(world){
		// If this is the first update, then we must rewind the animation
		// later
		this.time = world.time;
		this.state = this.state || this.defaultState;

		let stateChanged = this.stateHandlers[this.state](this, world);

		this.animation = this.animations[this.state];
		this.animation.x = this.x;
		this.animation.y = this.y;
		if(stateChanged){
			this.animation.rewind(this.time);
		}
		this.animation.advance(this.time);
	}

	draw(){
		this.animation.draw();
	}
}

// A series of sprites played in sequence, optionally as a loop.
class Animation{
	constructor(sprites, frameSpeed, loop){
		this.sprites = sprites;
		this.index = 0;
		this.nextSpriteTime;
		this.loop = loop;

		// I think this is wrong...
		this.frameSpeed = frameSpeed;

		this.time;
		this.x;
		this.y;
	}

	get sprite(){
		return this.sprites[this.index];
	}

	draw(){
		let sprite = this.sprite;
		sprite.draw(this.x, this.y, 10);
	}

	// Reset to the first sprite in the animation.
	rewind(time){
		this.index = 0;
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
	"Entity": Entity
}