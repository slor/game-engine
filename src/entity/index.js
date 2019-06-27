class Entity{
	constructor(x, y, sprites){
		this.x = x;
		this.y = y;
		this.sprites = sprites;

		this.nextSpriteTime = null;
		this.nextSprite = null;
		this.speed = 1000 / 60 * 1;
		this.loop = 0;
	}

	update(time){
		if(this.nextSprite === null){
			this.nextSprite = 0;
			this.nextSpriteTime = time + this.speed;
			this.loop = 1;
			return
		}

		if(time > this.nextSpriteTime){
			// bounce back and forth through the sprites
			if(this.nextSprite + this.loop === this.sprites.length){
				this.loop = this.loop * -1;
			} else if (this.nextSprite + this.loop < 0){
				this.loop = this.loop * -1;
			}

			this.nextSprite = this.nextSprite + this.loop;
			this.nextSpriteTime = this.nextSpriteTime + this.speed;
		}
	}

	draw(){
		// Pick what to draw and draw here
		this.sprites[this.nextSprite].draw(this.x, this.y, 10);
	}
}

module.exports = {
	"Entity": Entity
}