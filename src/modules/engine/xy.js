class XY{
	constructor(x, y){
		if(typeof(x) === 'object'){
			this.x = x[0];
			this.y = x[1];
		} else {
			this.x = x;
			this.y = y;
		}
	}

	serialize(){
		return JSON.stringify([this.x, this.y]);
	}
}

export { XY };