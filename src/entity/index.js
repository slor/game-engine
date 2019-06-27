class Entity{
	constructor(x, y, sprite){
		this.x = x;
		this.y = y;
		this.sprite = sprite;
	}

	update(){

	}

	draw(context){
		this.sprite.draw(this.x, this.y);
	}
}

module.exports = {
	"Entity": Entity
}