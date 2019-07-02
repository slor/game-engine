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

	setImageData(imageData, x=null, y=null, width=null, height=null){
		this.ctx.putImageData(imageData, x || 0, y || 0, width || imageData.width, height || imageData.height);
	}

	sizeToImageData(imageData){
		this.canvas.width = imageData.width;
		this.canvas.height = imageData.heigth;
	}

	drawImage(dataURL){
		this.canvas.width = dataURL.width;
		this.canvas.height = dataURL.height;
		this.ctx.drawImage(dataURL, 0, 0);
	}

	// Returns a mask ImageData of the canvas.
	mask(red, green, blue){
		let imageData = this.imageData;
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

canvas.addEventListener('mousedown', e => {
// 	const rect = canvas.getBoundingClientRect();
// 	const x = Math.floor(e.clientX - rect.left);
// 	const y = Math.floor(e.clientY - rect.top);

// 	console.debug(`mouse down at (${x}, ${y})`);

// 	if(maskOutColor === undefined){
// 		let imageData = ctx.getImageData(x, y, 1, 1);
// 		maskOutColor = imageData.data.slice(1, 4);

// 	} else {


// 		let floodFillCalls = 0;
// 		let floodFillFills = 0;

// 		let xMax = 0;
// 		let xMin = Infinity;
// 		let yMax = 0;
// 		let yMin = Infinity;
// 		let foundSprite = false;

// 		function floodFill(x, y){
// 			floodFillCalls++;
			
// 			let imageData = ctx.getImageData(x, y, 1, 1);
// 			let data = imageData.data;
// 			let target = [255, 255, 255];
// 			let replacement = [255, 255, 0];

// 			if(data[0] === replacement[0] && data[1] === replacement[1] && data[2] === replacement[2]){
// 				return;
// 			}

// 			if(data[0] !== target[0] || data[1] !== target[1] || data[2] !== target[2]){
// 				return;
// 			}

// 			floodFillFills++;
// 			foundSprite = true;
// 			data[0] = replacement[0];
// 			data[1] = replacement[1];
// 			data[2] = replacement[2];
// 			ctx.putImageData(imageData, x, y);

// 			if(x > xMax){
// 				xMax = x;
// 			}
// 			if(x < xMin){
// 				xMin = x;
// 			}
// 			if(y > yMax){
// 				yMax = y;
// 			}
// 			if(y < yMin){
// 				yMin = y;
// 			}

// 			floodFill(x, y + 1);
// 			floodFill(x, y - 1);
// 			floodFill(x - 1, y);
// 			floodFill(x + 1, y);
// 		}

// 		floodFill(x, y);

// 		if(!foundSprite){
// 			return;
// 		}

// 		console.debug(`floodFill() calls: ${floodFillCalls}`);
// 		console.debug(`filled ${floodFillFills} pixels`);

// 		const w = xMax - xMin;
// 		const h = yMax - yMin;
// 		console.debug(`Bounding box of filled area: (${xMin}, ${yMin}, ${w}, ${h})`);
// 		ctx.strokeStyle = 'red';
// 		ctx.strokeRect(xMin, yMin, w, h);
// 		ctx.fillStyle = 'rgba(255, 255, 0, 0.60)';
// 		ctx.fillRect(xMin, yMin, w, h);
// 		ctx.font = '16px courier';
// 		ctx.textAlign = 'center';
// 	 	ctx.textBaseline = 'middle'; 	
// 		ctx.fillStyle = 'black';
// 		ctx.fillText(spriteCount++, xMin + Math.floor(w/2), yMin + Math.floor(h/2));

// 		let li = document.createElement('li');
// 		li.innerText = `[${xMin}, ${yMin}, ${w}, ${h}]`;
// 		const list = document.querySelector('#spriteList');
// 		list.appendChild(li);
// 	}

// })

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
	maskCanvas.imageData = canvas.mask(parseInt(red), parseInt(green), parseInt(blue));
});
