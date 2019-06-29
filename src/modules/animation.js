import { Sprite } from './sprite.js';



// A series of sprites played in sequence, optionally as a loop.
class Animation{
	constructor(spriteSheet, context, slices, debugName='animation', loop=false){
		this.x;
		this.y;
		this.debugName = debugName;

		this.sprites = [];
		slices.map(slice => {
			this.sprites.push(new Sprite(spriteSheet, context, ...slice));
		});
		
		this.loop = loop;
		this.index = -1;
	}

	get sprite(){
		return this.sprites[this.index];
	}

	draw(){
		let sprite = this.sprite;

		if(this.debugName === 'duck' && this.index === 0){
			// debugger;
		}
		sprite.draw(this.x, this.y, 10);
	}

	// Reset to the first sprite in the animation.
	rewind(){
		this.index = -1;

		return this;
	}

	// Advance to the next sprite in the animation.
	advance(){
		this.index++;

		// Advance to the next frame. But if we're at the end, then either 
		// loop back around or stay on the last frame.
		if(this.loop === true && this.index === this.sprites.length){
			this.index = 0;
		} else if(this.index === this.sprites.length) {
			this.index--;
		}
	}
}



export { Animation };
