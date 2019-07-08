import { Canvas } from '../engine/canvas.js';


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
	document.querySelector('#code').innerHTML = '';
});


document.querySelector("#masked").addEventListener('click', function(e) {
	const canvas = new Canvas(this);
	const coords = canvas.getEventCoordinates(e);

	const filled = canvas.floodFill(coords[0], coords[1], canvas.white, canvas.red);

	if(filled){
		const thumbnail = new Canvas(document.createElement('canvas'));
		const display = new Canvas(document.querySelector('#display'));
		const w = canvas.ffXmax - canvas.ffXmin + 1; // This seems to be needed always
		const h = canvas.ffYmax - canvas.ffYmin + 1;
		
		thumbnail.canvas.width = 5 * w;
		thumbnail.canvas.height = 5 * h;
		thumbnail.ctx.imageSmoothingEnabled = false;
		thumbnail.ctx.drawImage(
			display.canvas, 
			canvas.ffXmin, canvas.ffYmin, w, h, 0, 0, 5 * w, 5 * h);

		const li = document.createElement('li');
		li.dataset.spriteLeft = canvas.ffXmin;
		li.dataset.spriteTop = canvas.ffYmin;
		li.dataset.spriteWidth = w;
		li.dataset.spriteHeight = h;
		li.appendChild(thumbnail.canvas);
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


