let input = document.querySelector("#filePicker");
const canvas = document.querySelector("#display");
const ctx = canvas.getContext('2d');


function createMask(canvas){
	let imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
	let pixels = imageData.data;

	for (let i = 0; i < pixels.length; i += 4) {
		// cyan is R:0 G:255 B:255
		if(pixels[i + 0] === 0 && pixels[i + 1] === 255 && pixels[i + 2] === 255){
			pixels[i + 0] = 0;    // R value
			pixels[i + 1] = 0;  // G value
	  		pixels[i + 2] = 0;    // B value
		} else {
			pixels[i + 0] = 255;    // R value
			pixels[i + 1] = 255;  // G value
	  		pixels[i + 2] = 255;    // B value
		}			 	
	}

	return imageData;
}

function drawMask(canvas, img){
	canvas.width = img.width;
	canvas.height = img.height;
	
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);

	const mask = createMask(canvas);
	ctx.putImageData(mask, 0, 0);
}

function drawMaskFromImage(e){
	const file = this.files[0];
	
	let img = document.createElement('img');
	img.file = file;

	const fr = new FileReader();
	fr.onload = (e) => {
		img.onload = (e) => {
			drawMask(canvas, e.target);
		}
		img.src = e.target.result;
	};

    fr.readAsDataURL(file);
}

input.addEventListener('change', drawMaskFromImage);

