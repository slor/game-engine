class Loader {
	// Load a sprite sheet once.
	constructor(src, loadedCallback){
		this.sheet = new Image();
		this.sheet.addEventListener('load', loadedCallback, false);
		this.sheet.src = src;
	}
}


class Sprite {
	// slice a sprite from a sheet
	constructor(sheet, ctx, sx, sy, sw, sh){
		this.sheet = sheet;
		this.sx = sx;
		this.sy = sy;
		this.sw = sw;
		this.sh = sh;
		this.x = 0;
		this.y = 0;
		this.ctx = ctx;
	}

	draw(){
		this.ctx.drawImage(this.sheet, this.sx, this.sy, this.sw, this.sh, 
					  this.x, this.y, this.sw, this.sh);
	}
}

module.exports = {
	"Loader": Loader,
	"Sprite": Sprite
};