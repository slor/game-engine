class Rgb{
	constructor(r, g, b){
		this.r = r;
		this.g = g;
		this.b = b;
	}

	compareAb(arrayBuffer){
		if(arrayBuffer[0] != this.r){
			return false;
		}
		if(arrayBuffer[1] != this.g){
			return false;
		}
		if(arrayBuffer[2] != this.b){
			return false;
		}

		return true;
	}
}

export { Rgb };