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
		this.ffXmax;
		this.ffXmin;
		this.ffYmax;
		this.ffYmin;
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
		this.floodFilled = true;
		this.ffVisited.push(xy);
		this.ffXs.push(x);
		this.ffYs.push(y);
	}

	floodFill(x, y, targetColor, fillColor){
		this.ffTargetColor = targetColor;
		this.ffFillColor = fillColor;
		this.ffStack = [];
		this.ffVisited = [];
		this.ffXmax = -1;
		this.ffXmin = Infinity;
		this.ffYmax = -1;
		this.ffYMin = Infinity;
		this.ffXs = [];
		this.ffYs = [];
		this.floodFilled = false;

		this.ffWorkOn(x, y);
		while(this.ffStack.length > 0){
			const xy = this.ffStack.pop();
			this.ffWorkOn(...JSON.parse(xy));
		}

		this.ffXs.sort((a, b) => { 
			if(a > b){
				return 1;
			}
			if(a === b){
				return 0;
			}
			if(a < b){
				return -1;
			} 
		});
		this.ffYs.sort((a, b) => { 
			if(a > b){
				return 1;
			}
			if(a === b){
				return 0;
			}
			if(a < b){
				return -1;
			} 
		});

		this.ffXmax = this.ffXs[this.ffXs.length - 1];
		this.ffXmin = this.ffXs[0];
		this.ffYmax = this.ffYs[this.ffYs.length - 1];
		this.ffYmin = this.ffYs[0];

		return this.floodFilled;
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
			document.querySelector("#dimensions").innerText = `${canvas.canvas.width} x ${canvas.canvas.height}`;
			document.querySelector("#ratio").innerText = canvas.canvas.width / canvas.canvas.height;
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

	canvas.canvas.hidden = true;
	maskCanvas.canvas.hidden = false;
	maskCanvas.setImageData(mask, 0, 0, true);
});

document.querySelector("#unmask").addEventListener('click', function () {
	const canvas = new Canvas(document.querySelector('#display'));
	const maskCanvas = new Canvas(document.querySelector('#masked'));
	
	canvas.canvas.hidden = false;
	maskCanvas.canvas.hidden = true;
});

document.querySelector("#clearSpriteList").addEventListener('click', function () {
	document.querySelector("#spriteList").innerHTML = '';
});

document.querySelector("#masked").addEventListener('click', function(e) {
	const canvas = new Canvas(this);
	const coords = canvas.getEventCoordinates(e);

	const filled = canvas.floodFill(coords[0], coords[1], canvas.white, canvas.red);

	if(filled){
		const thumbnail = new Canvas(document.createElement('canvas'));
		const display = new Canvas(document.querySelector('#display'));

		const w = canvas.ffXmax - canvas.ffXmin;
		const h = canvas.ffYmax - canvas.ffYmin;
		const iData = display.getImageData(canvas.ffXmin, canvas.ffYmin, w, h);
		thumbnail.setImageData(iData, 0, 0, true);

		const li = document.createElement('li');
		li.appendChild(thumbnail.canvas);
		document.querySelector("#spriteList").appendChild(li);
	}
});

document.querySelector("#masked").addEventListener('mousemove', function(e) {
	const canvas = new Canvas(this);
	const coords = canvas.getEventCoordinates(e);
	const iData = canvas.getImageData(coords[0], coords[1], 1, 1);

	if(iData.data[0] === 255 && iData.data[1] === 255 && iData.data[2] === 255){
		this.style.setProperty('cursor', 'copy');
	} else {
		this.style.setProperty('cursor', 'auto');
	}

});

document.querySelector("#display").addEventListener('click', function(e) {
	const canvas = new Canvas(this);
	const coords = canvas.getEventCoordinates(e);
	const iData = canvas.getImageData(coords[0], coords[1], 1, 1);
	
	document.querySelector("#red").value = iData.data[0];
	document.querySelector("#green").value = iData.data[1];
	document.querySelector("#blue").value = iData.data[2];
});

function clamp(num, min, max){
	return Math.min(Math.max(num, min), max);
}

document.querySelector("#draw").addEventListener('click', function(e) {
	const source = document.querySelector("#display");
	const sourceCtx = source.getContext('2d');
	const dest = document.querySelector("#zoomed");
	const destCtx = dest.getContext('2d');

	const sX = parseInt(document.querySelector("#sX").value);
	const sY = parseInt(document.querySelector("#sY").value);
	const sWidth = parseInt(document.querySelector("#sWidth").value);
	const sHeight = parseInt(document.querySelector("#sHeight").value);
	const dX = parseInt(document.querySelector("#dX").value);
	const dY = parseInt(document.querySelector("#dY").value);
	const dWidth = parseInt(document.querySelector("#dWidth").value);
	const dHeight = parseInt(document.querySelector("#dHeight").value);
	const scale = parseInt(document.querySelector("#scale").value);
	
	destCtx.imageSmoothingEnabled = false;
	destCtx.clearRect(0, 0, dest.width, dest.height);
	destCtx.scale(scale, scale);
	destCtx.drawImage(source, sX, sY);//,sWidth, sHeight, dX, dY,  dWidth, dHeight);
});

