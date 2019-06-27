class Entity{
	constructor(x, y){
		this.x = x;
		this.y = y;

		this.state = null;
		this.animations = {};
		this.time = null;
	}

	registerAnimation(state, sprites, frameSpeed){
		this.animations[state] = new Animation(sprites, frameSpeed);
	}

	update(time, keys){
		this.time = time;

		if(keys['ArrowDown'] === true){
            this.state = 'DUCK';
        } else {
        	this.state = 'IDLE';
        }
        
	}

	draw(){
		this.animations[this.state].sprite(this.time).draw(this.x, this.y, 10);
	}
}

class Animation{
	constructor(sprites, frameSpeed, loop=0){
		this.sprites = sprites;
		this.frameSpeed = frameSpeed;
		this.nextSpriteTime = null;
		this.nextSprite = null;
		this.loop = loop;
	}

	sprite(time){
		if(this.nextSprite === null){
			this.nextSprite = 0;
			this.nextSpriteTime = time + this.frameSpeed;
		}

		if(time > this.nextSpriteTime){
			// bounce back and forth through the sprites
			if(this.nextSprite + this.loop === this.sprites.length){
				this.loop = this.loop * -1;
			} else if (this.nextSprite + this.loop < 0){
				this.loop = this.loop * -1;
			}

			this.nextSprite = this.nextSprite + this.loop;
			this.nextSpriteTime = this.nextSpriteTime + this.frameSpeed;
		}

		return this.sprites[this.nextSprite];
	}
}


module.exports = {
	"Entity": Entity
}