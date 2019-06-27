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
		this.ctx = ctx;
	}

	draw(x, y, scale=1){
		this.ctx.drawImage(this.sheet, this.sx, this.sy, this.sw, this.sh, x, y, scale * this.sw, scale * this.sh, );
	}
}


module.exports = {
	"Loader": Loader,
	"Sprite": Sprite
};
