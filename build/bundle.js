(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ge = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Game {
    constructor(window) {
        this.SECOND = 1000.0;
        this.TICK = 1000.0 / 60.0; // In ms
        this.DEBUG = true;
        this.SMOOTH = false;

        this.keysPressed = {};
        this.mousePosX = 0;
        this.mousePosY = 0;
        this.mousePressed = false;
        
        this.lastSec = 0; // Timestamp in ms when we last did 1000ms of frames
        this.lastTick = 0; // Timestamp in ms when we last did one TICK
        this.lastFps = 0; // Frames/seconds
        this.framesLastSec = 0; // Frames since last secthis

        this.window = window;
        this.document = this.window.document;
        this.canvas = this.document.getElementById("screen");
        this.context = this.canvas.getContext('2d');
        this.entities = [];

        this.context.imageSmoothingEnabled = this.SMOOTH;
    }

    keyDown(e){
        this.keysPressed[e.key] = true;
    }

    keyUp(e){
        delete this.keysPressed[e.key];
    }    
    
    frame(now){
        const timeSinceLastTick = now - this.lastTick;

        if (timeSinceLastTick >= this.TICK) {
            this.lastTick++;
            this.framesLastSec++;
            this.update();
            this.draw();
        }

        const deltaSecs = now / 1000.0;
        if (deltaSecs >= this.lastSec + 1 ) {
            this.lastSec = deltaSecs;
            this.lastFps = this.framesLastSec;
            this.framesLastSec = 0;
        }
    }

    update(){
        this.entities.forEach(entity => {
            entity.update(this.lastTick, this.keysPressed);
        });
    }

    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawDebugInfo(){
        const ctx = this.context;
        const can = this.canvas;

        // Frame and timing info
        const DEBUG_SIZE = 16; //px
        ctx.fillStyle = 'black';
        ctx.font = `${DEBUG_SIZE}px sans-serif`;
        ctx.textAlign = 'right';

        ctx.fillText(`${this.lastTick}`.split('.')[0], can.width, DEBUG_SIZE);
        ctx.fillText(`${this.framesLastSec}`, can.width, DEBUG_SIZE * 2);
        ctx.fillText(`${this.lastSec}`.split('.')[0], can.width, DEBUG_SIZE * 3);
        ctx.fillText(`${this.lastFps}`.slice(0, 5), can.width, DEBUG_SIZE * 4);

        // Keyboard
        ctx.fillText(`${Object.keys(this.keysPressed)}`, can.width, DEBUG_SIZE * 5);


    }

    draw() {
        this.clear();

        if(this.DEBUG){
            this.drawDebugInfo();
        }

        this.entities.forEach((entity) => {
            entity.draw(this.context);
        });
    }
}

module.exports = {
    "Game": Game
}
},{}],2:[function(require,module,exports){
class Entity{
	constructor(x, y){
		this.x = x;
		this.y = y;

		this.state;
		this.animations = {};
		this.animation;
		this.time;
	}

	registerAnimation(state, sprites, frameSpeed, loop=false){
		this.animations[state] = new Animation(sprites, frameSpeed, loop);
	}

	update(time, keys){
		this.time = time;

		let stateChange = false;

		switch(this.state){
			case 'IDLE':
				if(keys['ArrowDown'] === true){
					this.state = 'DUCK';
					stateChange = true;
				}
				break;
			case 'DUCK':
				if(keys['ArrowDown'] !== true){
					this.state = 'IDLE';
					stateChange = true;
				}
				break;
			default:
				this.state = 'IDLE';
				stateChange = true;
		}

		this.animation = this.animations[this.state];
		this.animation.x = this.x;
		this.animation.y = this.y;
		if(stateChange === true){
			this.animation.rewind(time);
		} else {
			this.animation.advance(time);
		}
	}

	draw(){
		this.animation.draw();
	}
}

class Animation{
	constructor(sprites, frameSpeed, loop){
		this.sprites = sprites;
		this.index = 0;
		this.nextSpriteTime;
		this.loop = loop;

		this.frameSpeed = frameSpeed;
		this.time;
		this.x;
		this.y;
	}

	get sprite(){
		return this.sprites[this.index];
	}

	draw(){
		let sprite = this.sprite;
		sprite.draw(this.x, this.y, 10);
	}

	rewind(time){
		this.time = time;
		this.index = 0;
		this.nextSpriteTime = this.time + this.frameSpeed;
	}

	advance(time){
		this.time = time;

		if(this.time > this.nextSpriteTime){
			this.index++;

			if(this.loop === true){
				this.index = this.index % this.sprites.length;
			} else if(this.index === this.sprites.length) {
				this.index--;
			}

			this.nextSpriteTime = this.nextSpriteTime + this.frameSpeed;
		}
	}
}


module.exports = {
	"Entity": Entity
}
},{}],3:[function(require,module,exports){
const engine = require('./engine');
const sprite = require('./sprite');
const entity = require('./entity');


module.exports = {
	"Game": engine.Game,
	"Loader": sprite.Loader,
	"Sprite": sprite.Sprite,
	"Entity": entity.Entity
}


},{"./engine":1,"./entity":2,"./sprite":4}],4:[function(require,module,exports){
class Loader {
	// Load a sprite sheet once.
	constructor(src, loadedCallback){
		this.sheet = new Image();
		this.sheet.addEventListener('load', loadedCallback, false);
		this.sheet.src = src;
	}
}


class Sprite {
	// slice a sprite from a sheet
	constructor(sheet, ctx, sx, sy, sw, sh){
		this.sheet = sheet;
		this.sx = sx;
		this.sy = sy;
		this.sw = sw;
		this.sh = sh;
		this.ctx = ctx;
	}

	draw(x, y, scale=1){
		this.ctx.drawImage(this.sheet, this.sx, this.sy, this.sw, this.sh, x, y, scale * this.sw, scale * this.sh, );
	}
}


module.exports = {
	"Loader": Loader,
	"Sprite": Sprite
};

},{}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Iod2luZG93KSB7XG4gICAgICAgIHRoaXMuU0VDT05EID0gMTAwMC4wO1xuICAgICAgICB0aGlzLlRJQ0sgPSAxMDAwLjAgLyA2MC4wOyAvLyBJbiBtc1xuICAgICAgICB0aGlzLkRFQlVHID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5TTU9PVEggPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmtleXNQcmVzc2VkID0ge307XG4gICAgICAgIHRoaXMubW91c2VQb3NYID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1kgPSAwO1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sYXN0U2VjID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgMTAwMG1zIG9mIGZyYW1lc1xuICAgICAgICB0aGlzLmxhc3RUaWNrID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgb25lIFRJQ0tcbiAgICAgICAgdGhpcy5sYXN0RnBzID0gMDsgLy8gRnJhbWVzL3NlY29uZHNcbiAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjID0gMDsgLy8gRnJhbWVzIHNpbmNlIGxhc3Qgc2VjdGhpc1xuXG4gICAgICAgIHRoaXMud2luZG93ID0gd2luZG93O1xuICAgICAgICB0aGlzLmRvY3VtZW50ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQ7XG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjcmVlblwiKTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSB0aGlzLlNNT09USDtcbiAgICB9XG5cbiAgICBrZXlEb3duKGUpe1xuICAgICAgICB0aGlzLmtleXNQcmVzc2VkW2Uua2V5XSA9IHRydWU7XG4gICAgfVxuXG4gICAga2V5VXAoZSl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmtleXNQcmVzc2VkW2Uua2V5XTtcbiAgICB9ICAgIFxuICAgIFxuICAgIGZyYW1lKG5vdyl7XG4gICAgICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RUaWNrID0gbm93IC0gdGhpcy5sYXN0VGljaztcblxuICAgICAgICBpZiAodGltZVNpbmNlTGFzdFRpY2sgPj0gdGhpcy5USUNLKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RUaWNrKys7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMrKztcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbHRhU2VjcyA9IG5vdyAvIDEwMDAuMDtcbiAgICAgICAgaWYgKGRlbHRhU2VjcyA+PSB0aGlzLmxhc3RTZWMgKyAxICkge1xuICAgICAgICAgICAgdGhpcy5sYXN0U2VjID0gZGVsdGFTZWNzO1xuICAgICAgICAgICAgdGhpcy5sYXN0RnBzID0gdGhpcy5mcmFtZXNMYXN0U2VjO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpe1xuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZW50aXR5ID0+IHtcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUodGhpcy5sYXN0VGljaywgdGhpcy5rZXlzUHJlc3NlZCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgZHJhd0RlYnVnSW5mbygpe1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNvbnN0IGNhbiA9IHRoaXMuY2FudmFzO1xuXG4gICAgICAgIC8vIEZyYW1lIGFuZCB0aW1pbmcgaW5mb1xuICAgICAgICBjb25zdCBERUJVR19TSVpFID0gMTY7IC8vcHhcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgICAgIGN0eC5mb250ID0gYCR7REVCVUdfU0laRX1weCBzYW5zLXNlcmlmYDtcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9ICdyaWdodCc7XG5cbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdFRpY2t9YC5zcGxpdCgnLicpWzBdLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5mcmFtZXNMYXN0U2VjfWAsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDIpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0U2VjfWAuc3BsaXQoJy4nKVswXSwgY2FuLndpZHRoLCBERUJVR19TSVpFICogMyk7XG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RGcHN9YC5zbGljZSgwLCA1KSwgY2FuLndpZHRoLCBERUJVR19TSVpFICogNCk7XG5cbiAgICAgICAgLy8gS2V5Ym9hcmRcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke09iamVjdC5rZXlzKHRoaXMua2V5c1ByZXNzZWQpfWAsIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDUpO1xuXG5cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG5cbiAgICAgICAgaWYodGhpcy5ERUJVRyl7XG4gICAgICAgICAgICB0aGlzLmRyYXdEZWJ1Z0luZm8oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICBlbnRpdHkuZHJhdyh0aGlzLmNvbnRleHQpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwiR2FtZVwiOiBHYW1lXG59IiwiY2xhc3MgRW50aXR5e1xuXHRjb25zdHJ1Y3Rvcih4LCB5KXtcblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cblx0XHR0aGlzLnN0YXRlO1xuXHRcdHRoaXMuYW5pbWF0aW9ucyA9IHt9O1xuXHRcdHRoaXMuYW5pbWF0aW9uO1xuXHRcdHRoaXMudGltZTtcblx0fVxuXG5cdHJlZ2lzdGVyQW5pbWF0aW9uKHN0YXRlLCBzcHJpdGVzLCBmcmFtZVNwZWVkLCBsb29wPWZhbHNlKXtcblx0XHR0aGlzLmFuaW1hdGlvbnNbc3RhdGVdID0gbmV3IEFuaW1hdGlvbihzcHJpdGVzLCBmcmFtZVNwZWVkLCBsb29wKTtcblx0fVxuXG5cdHVwZGF0ZSh0aW1lLCBrZXlzKXtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXG5cdFx0bGV0IHN0YXRlQ2hhbmdlID0gZmFsc2U7XG5cblx0XHRzd2l0Y2godGhpcy5zdGF0ZSl7XG5cdFx0XHRjYXNlICdJRExFJzpcblx0XHRcdFx0aWYoa2V5c1snQXJyb3dEb3duJ10gPT09IHRydWUpe1xuXHRcdFx0XHRcdHRoaXMuc3RhdGUgPSAnRFVDSyc7XG5cdFx0XHRcdFx0c3RhdGVDaGFuZ2UgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnRFVDSyc6XG5cdFx0XHRcdGlmKGtleXNbJ0Fycm93RG93biddICE9PSB0cnVlKXtcblx0XHRcdFx0XHR0aGlzLnN0YXRlID0gJ0lETEUnO1xuXHRcdFx0XHRcdHN0YXRlQ2hhbmdlID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAnSURMRSc7XG5cdFx0XHRcdHN0YXRlQ2hhbmdlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLmFuaW1hdGlvbiA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLnN0YXRlXTtcblx0XHR0aGlzLmFuaW1hdGlvbi54ID0gdGhpcy54O1xuXHRcdHRoaXMuYW5pbWF0aW9uLnkgPSB0aGlzLnk7XG5cdFx0aWYoc3RhdGVDaGFuZ2UgPT09IHRydWUpe1xuXHRcdFx0dGhpcy5hbmltYXRpb24ucmV3aW5kKHRpbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmFuaW1hdGlvbi5hZHZhbmNlKHRpbWUpO1xuXHRcdH1cblx0fVxuXG5cdGRyYXcoKXtcblx0XHR0aGlzLmFuaW1hdGlvbi5kcmF3KCk7XG5cdH1cbn1cblxuY2xhc3MgQW5pbWF0aW9ue1xuXHRjb25zdHJ1Y3RvcihzcHJpdGVzLCBmcmFtZVNwZWVkLCBsb29wKXtcblx0XHR0aGlzLnNwcml0ZXMgPSBzcHJpdGVzO1xuXHRcdHRoaXMuaW5kZXggPSAwO1xuXHRcdHRoaXMubmV4dFNwcml0ZVRpbWU7XG5cdFx0dGhpcy5sb29wID0gbG9vcDtcblxuXHRcdHRoaXMuZnJhbWVTcGVlZCA9IGZyYW1lU3BlZWQ7XG5cdFx0dGhpcy50aW1lO1xuXHRcdHRoaXMueDtcblx0XHR0aGlzLnk7XG5cdH1cblxuXHRnZXQgc3ByaXRlKCl7XG5cdFx0cmV0dXJuIHRoaXMuc3ByaXRlc1t0aGlzLmluZGV4XTtcblx0fVxuXG5cdGRyYXcoKXtcblx0XHRsZXQgc3ByaXRlID0gdGhpcy5zcHJpdGU7XG5cdFx0c3ByaXRlLmRyYXcodGhpcy54LCB0aGlzLnksIDEwKTtcblx0fVxuXG5cdHJld2luZCh0aW1lKXtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXHRcdHRoaXMuaW5kZXggPSAwO1xuXHRcdHRoaXMubmV4dFNwcml0ZVRpbWUgPSB0aGlzLnRpbWUgKyB0aGlzLmZyYW1lU3BlZWQ7XG5cdH1cblxuXHRhZHZhbmNlKHRpbWUpe1xuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cblx0XHRpZih0aGlzLnRpbWUgPiB0aGlzLm5leHRTcHJpdGVUaW1lKXtcblx0XHRcdHRoaXMuaW5kZXgrKztcblxuXHRcdFx0aWYodGhpcy5sb29wID09PSB0cnVlKXtcblx0XHRcdFx0dGhpcy5pbmRleCA9IHRoaXMuaW5kZXggJSB0aGlzLnNwcml0ZXMubGVuZ3RoO1xuXHRcdFx0fSBlbHNlIGlmKHRoaXMuaW5kZXggPT09IHRoaXMuc3ByaXRlcy5sZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5pbmRleC0tO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm5leHRTcHJpdGVUaW1lID0gdGhpcy5uZXh0U3ByaXRlVGltZSArIHRoaXMuZnJhbWVTcGVlZDtcblx0XHR9XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJFbnRpdHlcIjogRW50aXR5XG59IiwiY29uc3QgZW5naW5lID0gcmVxdWlyZSgnLi9lbmdpbmUnKTtcbmNvbnN0IHNwcml0ZSA9IHJlcXVpcmUoJy4vc3ByaXRlJyk7XG5jb25zdCBlbnRpdHkgPSByZXF1aXJlKCcuL2VudGl0eScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIkdhbWVcIjogZW5naW5lLkdhbWUsXG5cdFwiTG9hZGVyXCI6IHNwcml0ZS5Mb2FkZXIsXG5cdFwiU3ByaXRlXCI6IHNwcml0ZS5TcHJpdGUsXG5cdFwiRW50aXR5XCI6IGVudGl0eS5FbnRpdHlcbn1cblxuIiwiY2xhc3MgTG9hZGVyIHtcblx0Ly8gTG9hZCBhIHNwcml0ZSBzaGVldCBvbmNlLlxuXHRjb25zdHJ1Y3RvcihzcmMsIGxvYWRlZENhbGxiYWNrKXtcblx0XHR0aGlzLnNoZWV0ID0gbmV3IEltYWdlKCk7XG5cdFx0dGhpcy5zaGVldC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgbG9hZGVkQ2FsbGJhY2ssIGZhbHNlKTtcblx0XHR0aGlzLnNoZWV0LnNyYyA9IHNyYztcblx0fVxufVxuXG5cbmNsYXNzIFNwcml0ZSB7XG5cdC8vIHNsaWNlIGEgc3ByaXRlIGZyb20gYSBzaGVldFxuXHRjb25zdHJ1Y3RvcihzaGVldCwgY3R4LCBzeCwgc3ksIHN3LCBzaCl7XG5cdFx0dGhpcy5zaGVldCA9IHNoZWV0O1xuXHRcdHRoaXMuc3ggPSBzeDtcblx0XHR0aGlzLnN5ID0gc3k7XG5cdFx0dGhpcy5zdyA9IHN3O1xuXHRcdHRoaXMuc2ggPSBzaDtcblx0XHR0aGlzLmN0eCA9IGN0eDtcblx0fVxuXG5cdGRyYXcoeCwgeSwgc2NhbGU9MSl7XG5cdFx0dGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIHgsIHksIHNjYWxlICogdGhpcy5zdywgc2NhbGUgKiB0aGlzLnNoLCApO1xuXHR9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiTG9hZGVyXCI6IExvYWRlcixcblx0XCJTcHJpdGVcIjogU3ByaXRlXG59O1xuIl19
