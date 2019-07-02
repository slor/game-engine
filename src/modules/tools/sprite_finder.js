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
	constructor(querySelector){
		this.canvas = document.querySelector(querySelector);
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
			this.getImageData(x    , y - 1, 1 , 1), // N
			this.getImageData(x + 1, y - 1, 1 , 1), // NE
			this.getImageData(x + 1, y    , 1 , 1),     // E
			this.getImageData(x + 1, y + 1, 1 , 1), // SE
			this.getImageData(x    , y + 1, 1 , 1), // S
			this.getImageData(x - 1, y + 1, 1 , 1), // SW
			this.getImageData(x - 1, y    , 1 , 1),     // W
			this.getImageData(x - 1, y - 1, 1 , 1), // NW
		];

		return neighbors.filter((neighbor) => {
			return this.ffTargetColor.compareAb(neighbor);
		});
	}

	ffWorkOn(x, y){
		let iData = this.getImageData(x, y, 1, 1);

		if(this.ffVisited.includes(iData)){
			return;
		}

		if(!this.targetColor.compareAb(iData.data)){
			return;
		}

		const validNeighbors = this.ffVisitLater(x, y);
		this.ffStack.push(...validNeighbors);
		this.ffVisited.push(iData);

		arb.data[0] = this.ffFillColor.r;
		arb.data[1] = this.ffFillColor.g;
		arb.data[2] = this.ffFillColor.b;
		this.setImageData(arb, x, y);
	}

	floodFill(x, y, targetColor, fillColor){
		this.ffTargetColor = targetColor;
		this.ffFillColor = fillColor;
		this.stack = [];
		this.visited = [];

		ffWorkOn(x, y);
		while(this.ffStack.length > 0){
			ffWorkOn(stack.pop());
		}
	}
}


document.querySelector("#filePicker").addEventListener('change', function () {
	let img = document.createElement('img');
	img.file = this.files[0];

	const canvas = new Canvas('#display');

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

	const canvas = new Canvas('#display');
	const maskCanvas = new Canvas('#masked');
	const mask = canvas.mask(parseInt(red), parseInt(green), parseInt(blue));
	maskCanvas.setImageData(mask, 0, 0, true);
});
