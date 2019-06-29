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
	update(world){
		// If this is the first update, then we must rewind the animation
		// later
		this.stateHandler(this, world);
		
		if(this.nextAnimation[this.nextAnimation.length - 1]){
			this.animation = this.nextAnimation.pop().rewind();
		}
		this.animation.advance();
		this.animation.x = this.x;
		this.animation.y = this.y;
	}

	draw(){
		this.animation.draw();
	}
}


export { Entity };
