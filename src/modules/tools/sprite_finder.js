// The idea here is: mask the sprites. 
// When the user clicks inside a sprite, use flood fill 
// to calculate the x, y, width and height of the sprite.
//
// Each sprite will get a number, and the code for the 
// sprite's position is printed on screen next to the
// number. Just copy and paste the code into the game
// config.
//
// Saves a lot of time when createing new animations.

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

class Canvas{
	constructor(canvas){
		this.canvas = canvas;
		this.white = new Rgb(255, 255, 255);
		this.black = new Rgb(0, 0, 0);
		this.red = new Rgb(255, 0, 0);
		this.blue = new Rgb(0, 0, 255);

		// Flood fill
		this.ffVisited;
		this.ffStack;
		this.ffTargetColor;
		this.ffFillColor;
	}

	getEventCoordinates(e){
		const rect = this.canvas.getBoundingClientRect();
		return [e.clientX - rect.left, e.clientY - rect.top];
	}

	get ctx(){
		return this.canvas.getContext('2d');
	}

	getImageData(x=null, y=null, width=null, height=null){
		return this.ctx.getImageData(x || 0, y || 0, width || this.canvas.width, height || this.canvas.height);	
	}

	setImageData(imageData, x=null, y=null, resize=false){
		if(resize === true){
			this.canvas.width = imageData.width;
			this.canvas.height = imageData.height;
		}

		this.ctx.putImageData(imageData, x || 0, y || 0);
	}

	drawImage(dataURL){
		this.canvas.width = dataURL.width;
		this.canvas.height = dataURL.height;
		this.ctx.drawImage(dataURL, 0, 0);
	}

	// Returns a mask ImageData of the canvas.
	mask(red, green, blue){
		let imageData = this.getImageData();
		let data = imageData.data;

		const target = new Rgb(red, green, blue);
		
		for (let i = 0; i < data.length; i += 4) {
			// set to black if target color, else set white.
			const test = data.slice(i, i + 3);
			if(target.compareAb(test)){
				data[i + 0] = this.black.r;
				data[i + 1] = this.black.g;
		  		data[i + 2] = this.black.b;
			} else {
				data[i + 0] = this.white.r;
				data[i + 1] = this.white.g;
		  		data[i + 2] = this.white.b;
			}		 	
		}
		
		return imageData;
	}

	ffValidNeighbors(x, y){
		const neighbors = [
			[x - 1, y - 1], // NW
			[x - 1, y    ], // W
			[x - 1, y + 1], // SW
			[x    , y - 1], // N
			[x    , y + 1], // S
			[x + 1, y - 1], // NE
			[x + 1, y    ], // E
			[x + 1, y + 1]  // SE
		];

		return neighbors.reduce((acc, neighbor) => {
			const xy = new XY(neighbor);

			const maybe = this.getImageData(xy.x, xy.y, 1, 1).data;
			if(this.ffTargetColor.compareAb(maybe)){
				acc.push(xy.serialize());
			}

			return acc;
		}, []);
	}

	ffWorkOn(x, y){
		let iData = this.getImageData(x, y, 1, 1);
		const xy = new XY(x, y).serialize();

		if(this.ffVisited.includes(xy)){
			return;
		}

		if(!this.ffTargetColor.compareAb(iData.data)){
			return;
		}

		const validNeighbors = this.ffValidNeighbors(x, y);
		this.ffStack.push(...validNeighbors);

		iData.data[0] = this.ffFillColor.r;
		iData.data[1] = this.ffFillColor.g;
		iData.data[2] = this.ffFillColor.b;
		this.setImageData(iData, x, y);
		this.ffVisited.push(xy);
	}

	floodFill(x, y, targetColor, fillColor){
		this.ffTargetColor = targetColor;
		this.ffFillColor = fillColor;
		this.ffStack = [];
		this.ffVisited = [];

		this.ffWorkOn(x, y);
		while(this.ffStack.length > 0){
			const xy = this.ffStack.pop();
			this.ffWorkOn(...JSON.parse(xy));
		}
	}
}


document.querySelector("#filePicker").addEventListener('change', function () {
	let img = document.createElement('img');
	img.file = this.files[0];

	const canvas = new Canvas(document.querySelector('#display'));

	const fr = new FileReader();
	fr.onload = (e) => {
		img.onload = (e) => {
			const dataURL = e.target
			canvas.drawImage(dataURL);
		}
		const fileURL = e.target.result;
		img.src = fileURL;
	};

    fr.readAsDataURL(img.file);
});

document.querySelector("#mask").addEventListener('click', function () {
	const red = document.querySelector("#red").value;
	const green = document.querySelector("#green").value;
	const blue = document.querySelector("#blue").value;
	console.debug(`Will mask out rgba(${red}, ${green}, ${blue}, 1.0)`);

	const canvas = new Canvas(document.querySelector('#display'));
	const maskCanvas = new Canvas(document.querySelector('#masked'));
	const mask = canvas.mask(parseInt(red), parseInt(green), parseInt(blue));
	maskCanvas.setImageData(mask, 0, 0, true);
});

document.querySelector("#masked").addEventListener('click', function(e) {
	const canvas = new Canvas(this);
	const coords = canvas.getEventCoordinates(e);

	console.debug(`Flood filling at (${coords[0]}, ${coords[1]})`);

	canvas.floodFill(coords[0], coords[1], canvas.white, canvas.red);
});

document.querySelector("#display").addEventListener('click', function(e) {
	const canvas = new Canvas(this);
	const coords = canvas.getEventCoordinates(e);
	const iData = canvas.getImageData(coords[0], coords[1], 1, 1);
	
	document.querySelector("#red").value = iData.data[0];
	document.querySelector("#green").value = iData.data[1];
	document.querySelector("#blue").value = iData.data[2];
});
