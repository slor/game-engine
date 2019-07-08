import { Rgb } from './rgb.js'
import { XY } from './xy.js'

class Canvas{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.ctx.imageSmoothingEnabled = false;

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
		return [Math.floor(e.clientX - rect.left), Math.floor(e.clientY - rect.top)];
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

export { Canvas };