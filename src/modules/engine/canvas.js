import { Rgb } from './rgb.js'

// Return x coordinate for a mouse event
// where x is a whole number and relative
// to the canvas' left instead of the 
// document.
function mouseEventCanvasX(canvas, e){
	const rect = canvas.getBoundingClientRect();
	return Math.floor(e.clientX - rect.left);
}

function mouseEventCanvasY(canvas, e){
	const rect = canvas.getBoundingClientRect();
	return Math.floor(e.clientY - rect.top)
}

// Returns a mask ImageData of the canvas.
function mask(canvas, red, green, blue){
	const ctx = canvas.getContext('2d');
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = imageData.data;

	const target = new Rgb(red, green, blue);
	
	for (let i = 0; i < data.length; i += 4) {
		// set to black if target color, else set white.
		const test = Rgb.fromImageData(imageData, i);
		if(target.compare(test)){
			data[i + 0] = 0;
			data[i + 1] = 0;
	  		data[i + 2] = 0;
		} else {
			data[i + 0] = 255;
			data[i + 1] = 255;
	  		data[i + 2] = 255;
		}		 	
	}

	return imageData;
}

class Canvas{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		// Flood fill
		this.ffVisited;
		this.ffStack;
		this.ffTargetColor;
		this.ffXmax;
		this.ffXmin;
		this.ffYmax;
		this.ffYmin;
	}

	ffValidNeighbors(x, y){
		const neighbors = [
			{"x": x - 1, "y": y - 1}, // NW
			{"x": x - 1, "y": y    }, // W
			{"x": x - 1, "y": y + 1}, // SW
			{"x": x    , "y": y - 1}, // N
			{"x": x    , "y": y + 1}, // S
			{"x": x + 1, "y": y - 1}, // NE
			{"x": x + 1, "y": y    }, // E
			{"x": x + 1, "y": y + 1}  // SE
		];

		return neighbors.reduce((acc, neighbor) => {
			const index = Rgb.indexFromXY(this.ffImageData, neighbor.x, neighbor.y);
			const test = Rgb.fromImageData(this.ffImageData, index);
			if(this.ffTargetColor.compare(test)){
				acc.push(JSON.stringify(neighbor));
			}

			return acc;
		}, []);
	}

	ffWorkOn(x, y){
		const point = JSON.stringify({"x": x, "y": y});
		if(this.ffVisited.includes(point)){
			return;
		}
		
		const index = Rgb.indexFromXY(this.ffImageData, x, y);
		const test = Rgb.fromImageData(this.ffImageData, index);
		if(!this.ffTargetColor.compare(test)){
			return;
		}
		this.ffVisited.push(point);

		const validNeighbors = this.ffValidNeighbors(x, y);
		this.ffStack.push(...validNeighbors);
		this.ffXs.push(x);
		this.ffYs.push(y);
		this.floodFilled = true;	
	}

	floodFill(x, y, targetColor){
		this.ffTargetColor = targetColor;
		this.ffStack = [];
		this.ffVisited = [];
		this.ffXmax = -1;
		this.ffXmin = Infinity;
		this.ffYmax = -1;
		this.ffYMin = Infinity;
		this.ffXs = [];
		this.ffYs = [];
		this.floodFilled = false;
		this.ffImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

		this.ffWorkOn(x, y);
		while(this.ffStack.length > 0){
			const xy = this.ffStack.pop();
			this.ffWorkOn(...Object.values(JSON.parse(xy)));
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

export { Canvas, mouseEventCanvasX, mouseEventCanvasY, mask };