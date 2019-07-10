import { Canvas, mouseEventCanvasX, mouseEventCanvasY, mask } from '../engine/canvas.js';
import { Rgb } from '../engine/rgb.js';

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


// Load the image into the display canvas.
document.querySelector("#filePicker").addEventListener('change', function () {
	let img = document.createElement('img');
	img.file = this.files[0];

	const fr = new FileReader();
	fr.onload = (e) => {
		img.onload = (e) => {
			const dataURL = e.target
			const display = document.querySelector('#display');
			const ctx = display.getContext('2d');

			display.width = dataURL.width;
			display.height = dataURL.height;
			ctx.drawImage(dataURL, 0, 0);

			document.querySelector("#dimensions").innerText = `${display.width} x ${display.height}`;
			document.querySelector("#ratio").innerText = display.width / display.height;
		}
		const fileURL = e.target.result;
		img.src = fileURL;
	};

    fr.readAsDataURL(img.file);
});

// Show a masked out version of the display canvas so the user can
// then click inside a sprite to select it.
document.querySelector("#mask").addEventListener('click', function () {
	const display = document.querySelector('#display');
	const masked = document.querySelector('#masked');

	display.hidden = true;
	masked.hidden = false;
	
	const red = parseInt(document.querySelector("#red").value);
	const green = parseInt(document.querySelector("#green").value);
	const blue = parseInt(document.querySelector("#blue").value);
	const maskedImage = mask(display, red, green, blue);
	
	masked.width = maskedImage.width;
	masked.height= maskedImage.height;

	const ctx = masked.getContext('2d');
	ctx.putImageData(maskedImage, 0, 0);
});

// Hide the masked canvas and show the display canvas.
document.querySelector("#unmask").addEventListener('click', function () {
	const display = document.querySelector('#display');
	const masked = document.querySelector('#masked');
	
	display.hidden = false;
	masked.hidden = true;
});

// Clear the sprites and code.
document.querySelector("#clearSpriteList").addEventListener('click', function () {
	document.querySelector("#spriteList").innerHTML = '';
	document.querySelector('#code').innerHTML = '';
});

// Select a sprite and flood fill it to determine the bounding rect.
document.querySelector("#masked").addEventListener('click', function(e) {
	const x = mouseEventCanvasX(this, e);
	const y = mouseEventCanvasY(this, e);
	const white = new Rgb(255, 255, 255);
	const red = new Rgb(255, 0, 0);
	const floodableCanvas = new Canvas(this);
	const isFilled = floodableCanvas.floodFill(x, y, white);

	if(isFilled){
		const thumbnail = document.createElement('canvas');
		const display = document.querySelector('#display');

		// The +1 is needed because we're always 
		// Math.floor()'ing event coordinates.
		const w = floodableCanvas.ffXmax - floodableCanvas.ffXmin + 1;
		const h = floodableCanvas.ffYmax - floodableCanvas.ffYmin + 1;
		
		// Magnify the thumbnail.
		const scaleFactor = 5; 
		thumbnail.width = scaleFactor * w;
		thumbnail.height = scaleFactor * h;

		const ctx = thumbnail.getContext('2d');
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(
			display, 
			floodableCanvas.ffXmin, 
			floodableCanvas.ffYmin, 
			w, h, 0, 0, 
			scaleFactor * w,
			scaleFactor * h
		);

		const li = document.createElement('li');
		li.dataset.spriteLeft = floodableCanvas.ffXmin;
		li.dataset.spriteTop = floodableCanvas.ffYmin;
		li.dataset.spriteWidth = w;
		li.dataset.spriteHeight = h;
		li.appendChild(thumbnail);
		document.querySelector("#spriteList").appendChild(li);
	}

	const code = document.querySelector('#code');
	const items = [...document.querySelector("#spriteList").childNodes];
	const lines = items.reduce((lines, item) =>{
		lines.push(`[${item.dataset.spriteLeft}, ${item.dataset.spriteTop}, ${item.dataset.spriteWidth}, ${item.dataset.spriteHeight}]`);
		return lines;
	}, []);
	code.innerText = `[${lines.join(',\n')}]`;
});


// Set the mouse cursor for `copy` if it's over a white area of the mask.
document.querySelector("#masked").addEventListener('mousemove', function(e) {
	const sX = mouseEventCanvasX(this, e);
	const sY = mouseEventCanvasY(this, e);
	const ctx = this.getContext('2d');
	const iData = ctx.getImageData(sX, sY, 1, 1);

	if(iData.data[0] === 255 && iData.data[1] === 255 && iData.data[2] === 255){
		this.style.setProperty('cursor', 'copy');
	} else {
		this.style.setProperty('cursor', 'auto');
	}
});

// Pick the mask color based on the pixel the user clicks on.
document.querySelector("#display").addEventListener('click', function(e) {
	const sX = mouseEventCanvasX(this, e);
	const sY = mouseEventCanvasY(this, e);
	const ctx = this.getContext('2d');
	const iData = ctx.getImageData(sX, sY, 1, 1);
	
	document.querySelector("#red").value = iData.data[0];
	document.querySelector("#green").value = iData.data[1];
	document.querySelector("#blue").value = iData.data[2];
});


