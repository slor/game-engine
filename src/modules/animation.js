import { Sprite } from './sprite.js';



// A series of sprites played in sequence, optionally as a loop.
class Animation{
	constructor(spriteSheet, context, slices, loop=false){
		this.x;
		this.y;

		this.sprites = [];
		slices.map(slice => {
			this.sprites.push(new Sprite(spriteSheet, context, ...slice));
		});
		
		this.loop = loop;
		this.index = 0;
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

		return this;
	}

	// Advance to the next sprite in the animation.
	advance(){
		return; // disable animations

		// Advance to the next frame. But if we're at the end, then either 
		// loop back around or stay on the last frame.
		this.index++;

		if(this.loop === true){
			this.index = this.index % this.sprites.length;
		} else if(this.index === this.sprites.length) {
			this.index--;
		}
	}
}



export { Animation };
