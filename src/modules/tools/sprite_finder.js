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

class Px{
	constructor(r, g, b, a=1.0){
		this.r;
		this.g;
		this.b;
		this.a;
	}

	asArrayBuffer(){
		let ab = new ArrayBuffer(4);
		ab[0] = this.r;
		ab[1] = this.g;
		ab[2] = this.b;
		ab[3] = this.a;

		return ab;
	}

	compareAb(arrayBuffer){
		if(arrayBuffer[0] != this.r){
			return false;
		}
		if(arrayBuffer[1] != this.g){
			return false;
		}
		if(arrayBuffer[2] != this.g){
			return false;
		}
		if(arrayBuffer[3] != this.b){
			return false;
		}
		return true;
	}
}

class Canvas{
	constructor(querySelector){
		this.canvas = document.querySelector(querySelector);
		this.white = new Px(255, 255, 255);
		this.black = new Px(0, 0, 0);
	}

	get ctx(){
		return this.canvas.getContext('2d');
	}

	get imageData(){
		return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);	
	}

	set imageData(imageData){
		this.ctx.putImageData(imgData, 0, 0);
	}

	drawImage(dataURL){
		this.canvas.width = dataURL.width;
		this.canvas.height = dataURL.height;
		this.ctx.drawImage(dataURL, 0, 0);
	}

	// Returns a mask ImageData of the canvas.
	mask(red, green, blue, alpha=1.0){
		let imageData = this.imageData;
		let data = imageData.data;

		const target = new Px(red, green, blue, alpha);
		
		for (let i = 0; i < data.length; i += 4) {
			// set to black if target color, else set white.
			if(target.compareAb(data.slice[i, i + 4])){
				data[i + 0] = this.black.r;
				data[i + 1] = this.black.g;
		  		data[i + 2] = this.black.b;
		  		data[i + 3] = this.black.a;
			} else {
				data[i + 0] = this.white.r;
				data[i + 1] = this.white.g;
		  		data[i + 2] = this.white.b;
		  		data[i + 3] = this.white.a;
			}		 	
		}

		return imageData;
	}
}



// canvas.addEventListener('mousedown', e => {
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

document.querySelector("#filePicker").addEventListener('change', function(){
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
