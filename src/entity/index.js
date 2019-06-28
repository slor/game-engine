class Entity{
	constructor(x, y){
		this.x = x;
		this.y = y;

		this.state;
		this.animations = {};
		this.animation;
		this.time;
	}

	registerAnimation(state, sprites, frameSpeed, loop=false){
		this.animations[state] = new Animation(sprites, frameSpeed, loop);

		return this;
	}

	update(world){
		this.time = world.time;

		let stateChange = false;

		switch(this.state){
			case 'IDLE':
				if(world.keysPressed['ArrowDown'] === true){
					this.state = 'DUCK';
					stateChange = true;
				}
				break;
			case 'DUCK':
				if(world.keysPressed['ArrowDown'] !== true){
					this.state = 'IDLE';
					stateChange = true;
				}
				break;
			default:
				this.state = 'IDLE';
				stateChange = true;
		}

		this.animation = this.animations[this.state];
		this.animation.x = this.x;
		this.animation.y = this.y;
		if(stateChange === true){
			this.animation.rewind(this.time);
		} else {
			this.animation.advance(this.time);
		}
	}

	draw(){
		this.animation.draw();
	}
}

class Animation{
	constructor(sprites, frameSpeed, loop){
		this.sprites = sprites;
		this.index = 0;
		this.nextSpriteTime;
		this.loop = loop;

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

	rewind(time){
		this.time = time;
		this.index = 0;
		this.nextSpriteTime = this.time + this.frameSpeed;
	}

	advance(time){
		this.time = time;

		if(this.time > this.nextSpriteTime){
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