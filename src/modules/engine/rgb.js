class Rgb{
	static indexFromXY(imageData, x, y){
		return (y * imageData.width + x) * 4;
	}

	static fromImageData(imageData, index){
		const data = imageData.data.slice(index, index + 3);
		return new Rgb(...data);
	}

	constructor(r, g, b){
		this.r = r;
		this.g = g;
		this.b = b;
	}

	compare(rgb){
		if(this.r !== rgb.r){
			return false;
		}
		if(this.g !== rgb.g){
			return false;
		}
		if(this.b !== rgb.b){
			return false;
		}
		return true;
	}
}

export { Rgb };