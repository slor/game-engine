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

let input = document.querySelector("#filePicker");
const canvas = document.querySelector("#display");
const ctx = canvas.getContext('2d');
let spriteCount = 1;

function createMask(){
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = imageData.data;
	const target = [0, 255, 255];
	
	for (let i = 0; i < data.length; i += 4) {
		// set to black if target color, else set white.
		if(data[i] === target[0] && data[i + 1] === target[1] && data[i + 2] === target[2]){
			data[i + 0] = 0;    // R value
			data[i + 1] = 0;  // G value
	  		data[i + 2] = 0;    // B value
		} else {
			data[i + 0] = 255;    // R value
			data[i + 1] = 255;  // G value
	  		data[i + 2] = 255;    // B value
		}		 	
	}

	return imageData;
}

function drawMask(img){
	canvas.width = img.width;
	canvas.height = img.height;
	
	ctx.drawImage(img, 0, 0);

	const mask = createMask();
	ctx.putImageData(mask, 0, 0);
}

function drawMaskFromImage(e){
	const file = this.files[0];
	
	let img = document.createElement('img');
	img.file = file;

	const fr = new FileReader();
	fr.onload = (e) => {
		img.onload = (e) => {
			drawMask(e.target);
		}
		img.src = e.target.result;
	};

    fr.readAsDataURL(file);
}


canvas.addEventListener('mousedown', e => {
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor(e.clientX - rect.left);
	const y = Math.floor(e.clientY - rect.top);

	console.debug(`mouse down at (${x}, ${y})`);

	let floodFillCalls = 0;
	let floodFillFills = 0;

	let xMax = 0;
	let xMin = Infinity;
	let yMax = 0;
	let yMin = Infinity;
	let foundSprite = false;

	function floodFill(x, y){
		floodFillCalls++;
		
		let imageData = ctx.getImageData(x, y, 1, 1);
		let data = imageData.data;
		let target = [255, 255, 255];
		let replacement = [255, 255, 0];

		if(data[0] === replacement[0] && data[1] === replacement[1] && data[2] === replacement[2]){
			return;
		}

		if(data[0] !== target[0] || data[1] !== target[1] || data[2] !== target[2]){
			return;
		}

		floodFillFills++;
		foundSprite = true;
		data[0] = replacement[0];
		data[1] = replacement[1];
		data[2] = replacement[2];
		ctx.putImageData(imageData, x, y);

		if(x > xMax){
			xMax = x;
		}
		if(x < xMin){
			xMin = x;
		}
		if(y > yMax){
			yMax = y;
		}
		if(y < yMin){
			yMin = y;
		}

		floodFill(x, y + 1);
		floodFill(x, y - 1);
		floodFill(x - 1, y);
		floodFill(x + 1, y);
	}

	floodFill(x, y);

	if(!foundSprite){
		return;
	}

	console.debug(`floodFill() calls: ${floodFillCalls}`);
	console.debug(`filled ${floodFillFills} pixels`);

	const w = xMax - xMin;
	const h = yMax - yMin;
	console.debug(`Bounding box of filled area: (${xMin}, ${yMin}, ${w}, ${h})`);
	ctx.strokeStyle = 'red';
	ctx.strokeRect(xMin, yMin, w, h);
	ctx.fillStyle = 'rgba(255, 255, 0, 0.60)';
	ctx.fillRect(xMin, yMin, w, h);
	ctx.font = '16px courier';
	ctx.textAlign = 'center';
 	ctx.textBaseline = 'middle'; 	
	ctx.fillStyle = 'black';
	ctx.fillText(spriteCount++, xMin + Math.floor(w/2), yMin + Math.floor(h/2));

	let li = document.createElement('li');
	li.innerText = `[${xMin}, ${yMin}, ${w}, ${h}]`;
	const list = document.querySelector('#spriteList');
	list.appendChild(li);

})

input.addEventListener('change', drawMaskFromImage);
