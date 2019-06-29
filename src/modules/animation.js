import { Sprite } from './sprite.js';



// A series of sprites played in sequence, optionally as a loop.
class Animation{
	constructor(spriteSheet, context, slices, frameSpeed, loop=false){
		this.time;
		this.x;
		this.y;

		this.sprites = [];
		slices.map(slice => {
			this.sprites.push(new Sprite(spriteSheet, context, ...slice));
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



export { Animation };
