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
        const world = {
            'time': this.lastTick,
            'keysPressed': this.keysPressed
        }
        
        this.entities.forEach(entity => {
            entity.update(world);
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
// A "thing" in the game world. 
//
// Can update its own state and draw itself.
class Entity{
	constructor(x, y){
		this.x = x;
		this.y = y;

		this.state;
		this.defaultState;
		this.stateHandlers = {};
		this.animations = {};
		this.animation;
		this.time;
	}

	// Register an animation to play when the entity is in a certain state.
	registerAnimation(state, sprites, frameSpeed, loop=false){
		this.animations[state] = new Animation(sprites, frameSpeed, loop);

		return this;
	}

	// Register a handler to call when the entity is in a certain
	// state.
	registerState(state, handler, defaultState=false){
		this.stateHandlers[state] = handler;

		if(defaultState === true){
			this.defaultState = state;
		}

		return this;
	}

	// Handle the current state based on the entity and the game world.
	// Drive the animation based on the state, which are 1:1 for now.
	update(world){
		// If this is the first update, then we must rewind the animation
		// later
		this.time = world.time;
		this.state = this.state || this.defaultState;

		let stateChanged = this.stateHandlers[this.state](this, world);

		this.animation = this.animations[this.state];
		this.animation.x = this.x;
		this.animation.y = this.y;
		if(stateChanged){
			this.animation.rewind(this.time);
		}
		this.animation.advance(this.time);
	}

	draw(){
		this.animation.draw();
	}
}

// A series of sprites played in sequence, optionally as a loop.
class Animation{
	constructor(sprites, frameSpeed, loop){
		this.sprites = sprites;
		this.index = 0;
		this.nextSpriteTime;
		this.loop = loop;

		// I think this is wrong...
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

	// Reset to the first sprite in the animation.
	rewind(time){
		this.index = 0;
	}

	// Advance to the next sprite in the animation if enough time
	// has passed.
	advance(time){
		this.time = time;

		// If this is the first advance, initialize to one frameSpeed from now.
		this.nextSpriteTime = this.nextSpriteTime || time + this.frameSpeed;

		if(this.time > this.nextSpriteTime){
			// Advance to the next frame. But if we're at the end, then either 
			// loop back around or stay on the last frame.
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
// Load a sprite sheet once.
class Loader {
	constructor(src, loadedCallback){
		this.sheet = new Image();
		this.sheet.addEventListener('load', loadedCallback, false);
		this.sheet.src = src;
	}
}


// An image that can be positioned and draw itsel.
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3Iod2luZG93KSB7XG4gICAgICAgIHRoaXMuU0VDT05EID0gMTAwMC4wO1xuICAgICAgICB0aGlzLlRJQ0sgPSAxMDAwLjAgLyA2MC4wOyAvLyBJbiBtc1xuICAgICAgICB0aGlzLkRFQlVHID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5TTU9PVEggPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmtleXNQcmVzc2VkID0ge307XG4gICAgICAgIHRoaXMubW91c2VQb3NYID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1kgPSAwO1xuICAgICAgICB0aGlzLm1vdXNlUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5sYXN0U2VjID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgMTAwMG1zIG9mIGZyYW1lc1xuICAgICAgICB0aGlzLmxhc3RUaWNrID0gMDsgLy8gVGltZXN0YW1wIGluIG1zIHdoZW4gd2UgbGFzdCBkaWQgb25lIFRJQ0tcbiAgICAgICAgdGhpcy5sYXN0RnBzID0gMDsgLy8gRnJhbWVzL3NlY29uZHNcbiAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjID0gMDsgLy8gRnJhbWVzIHNpbmNlIGxhc3Qgc2VjdGhpc1xuXG4gICAgICAgIHRoaXMud2luZG93ID0gd2luZG93O1xuICAgICAgICB0aGlzLmRvY3VtZW50ID0gdGhpcy53aW5kb3cuZG9jdW1lbnQ7XG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNjcmVlblwiKTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSB0aGlzLlNNT09USDtcbiAgICB9XG5cbiAgICBrZXlEb3duKGUpe1xuICAgICAgICB0aGlzLmtleXNQcmVzc2VkW2Uua2V5XSA9IHRydWU7XG4gICAgfVxuXG4gICAga2V5VXAoZSl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmtleXNQcmVzc2VkW2Uua2V5XTtcbiAgICB9ICAgIFxuICAgIFxuICAgIGZyYW1lKG5vdyl7XG4gICAgICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RUaWNrID0gbm93IC0gdGhpcy5sYXN0VGljaztcblxuICAgICAgICBpZiAodGltZVNpbmNlTGFzdFRpY2sgPj0gdGhpcy5USUNLKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RUaWNrKys7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMrKztcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlbHRhU2VjcyA9IG5vdyAvIDEwMDAuMDtcbiAgICAgICAgaWYgKGRlbHRhU2VjcyA+PSB0aGlzLmxhc3RTZWMgKyAxICkge1xuICAgICAgICAgICAgdGhpcy5sYXN0U2VjID0gZGVsdGFTZWNzO1xuICAgICAgICAgICAgdGhpcy5sYXN0RnBzID0gdGhpcy5mcmFtZXNMYXN0U2VjO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpe1xuICAgICAgICBjb25zdCB3b3JsZCA9IHtcbiAgICAgICAgICAgICd0aW1lJzogdGhpcy5sYXN0VGljayxcbiAgICAgICAgICAgICdrZXlzUHJlc3NlZCc6IHRoaXMua2V5c1ByZXNzZWRcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGVudGl0eSA9PiB7XG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKHdvcmxkKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xlYXIoKXtcbiAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBkcmF3RGVidWdJbmZvKCl7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY29uc3QgY2FuID0gdGhpcy5jYW52YXM7XG5cbiAgICAgICAgLy8gRnJhbWUgYW5kIHRpbWluZyBpbmZvXG4gICAgICAgIGNvbnN0IERFQlVHX1NJWkUgPSAxNjsgLy9weFxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgY3R4LmZvbnQgPSBgJHtERUJVR19TSVpFfXB4IHNhbnMtc2VyaWZgO1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcblxuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0VGlja31gLnNwbGl0KCcuJylbMF0sIGNhbi53aWR0aCwgREVCVUdfU0laRSk7XG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmZyYW1lc0xhc3RTZWN9YCwgY2FuLndpZHRoLCBERUJVR19TSVpFICogMik7XG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RTZWN9YC5zcGxpdCgnLicpWzBdLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAzKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdEZwc31gLnNsaWNlKDAsIDUpLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiA0KTtcblxuICAgICAgICAvLyBLZXlib2FyZFxuICAgICAgICBjdHguZmlsbFRleHQoYCR7T2JqZWN0LmtleXModGhpcy5rZXlzUHJlc3NlZCl9YCwgY2FuLndpZHRoLCBERUJVR19TSVpFICogNSk7XG5cblxuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcblxuICAgICAgICBpZih0aGlzLkRFQlVHKXtcbiAgICAgICAgICAgIHRoaXMuZHJhd0RlYnVnSW5mbygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgIGVudGl0eS5kcmF3KHRoaXMuY29udGV4dCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJHYW1lXCI6IEdhbWVcbn0iLCIvLyBBIFwidGhpbmdcIiBpbiB0aGUgZ2FtZSB3b3JsZC4gXG4vL1xuLy8gQ2FuIHVwZGF0ZSBpdHMgb3duIHN0YXRlIGFuZCBkcmF3IGl0c2VsZi5cbmNsYXNzIEVudGl0eXtcblx0Y29uc3RydWN0b3IoeCwgeSl7XG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXG5cdFx0dGhpcy5zdGF0ZTtcblx0XHR0aGlzLmRlZmF1bHRTdGF0ZTtcblx0XHR0aGlzLnN0YXRlSGFuZGxlcnMgPSB7fTtcblx0XHR0aGlzLmFuaW1hdGlvbnMgPSB7fTtcblx0XHR0aGlzLmFuaW1hdGlvbjtcblx0XHR0aGlzLnRpbWU7XG5cdH1cblxuXHQvLyBSZWdpc3RlciBhbiBhbmltYXRpb24gdG8gcGxheSB3aGVuIHRoZSBlbnRpdHkgaXMgaW4gYSBjZXJ0YWluIHN0YXRlLlxuXHRyZWdpc3RlckFuaW1hdGlvbihzdGF0ZSwgc3ByaXRlcywgZnJhbWVTcGVlZCwgbG9vcD1mYWxzZSl7XG5cdFx0dGhpcy5hbmltYXRpb25zW3N0YXRlXSA9IG5ldyBBbmltYXRpb24oc3ByaXRlcywgZnJhbWVTcGVlZCwgbG9vcCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8vIFJlZ2lzdGVyIGEgaGFuZGxlciB0byBjYWxsIHdoZW4gdGhlIGVudGl0eSBpcyBpbiBhIGNlcnRhaW5cblx0Ly8gc3RhdGUuXG5cdHJlZ2lzdGVyU3RhdGUoc3RhdGUsIGhhbmRsZXIsIGRlZmF1bHRTdGF0ZT1mYWxzZSl7XG5cdFx0dGhpcy5zdGF0ZUhhbmRsZXJzW3N0YXRlXSA9IGhhbmRsZXI7XG5cblx0XHRpZihkZWZhdWx0U3RhdGUgPT09IHRydWUpe1xuXHRcdFx0dGhpcy5kZWZhdWx0U3RhdGUgPSBzdGF0ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8vIEhhbmRsZSB0aGUgY3VycmVudCBzdGF0ZSBiYXNlZCBvbiB0aGUgZW50aXR5IGFuZCB0aGUgZ2FtZSB3b3JsZC5cblx0Ly8gRHJpdmUgdGhlIGFuaW1hdGlvbiBiYXNlZCBvbiB0aGUgc3RhdGUsIHdoaWNoIGFyZSAxOjEgZm9yIG5vdy5cblx0dXBkYXRlKHdvcmxkKXtcblx0XHQvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCB1cGRhdGUsIHRoZW4gd2UgbXVzdCByZXdpbmQgdGhlIGFuaW1hdGlvblxuXHRcdC8vIGxhdGVyXG5cdFx0dGhpcy50aW1lID0gd29ybGQudGltZTtcblx0XHR0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZSB8fCB0aGlzLmRlZmF1bHRTdGF0ZTtcblxuXHRcdGxldCBzdGF0ZUNoYW5nZWQgPSB0aGlzLnN0YXRlSGFuZGxlcnNbdGhpcy5zdGF0ZV0odGhpcywgd29ybGQpO1xuXG5cdFx0dGhpcy5hbmltYXRpb24gPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5zdGF0ZV07XG5cdFx0dGhpcy5hbmltYXRpb24ueCA9IHRoaXMueDtcblx0XHR0aGlzLmFuaW1hdGlvbi55ID0gdGhpcy55O1xuXHRcdGlmKHN0YXRlQ2hhbmdlZCl7XG5cdFx0XHR0aGlzLmFuaW1hdGlvbi5yZXdpbmQodGhpcy50aW1lKTtcblx0XHR9XG5cdFx0dGhpcy5hbmltYXRpb24uYWR2YW5jZSh0aGlzLnRpbWUpO1xuXHR9XG5cblx0ZHJhdygpe1xuXHRcdHRoaXMuYW5pbWF0aW9uLmRyYXcoKTtcblx0fVxufVxuXG4vLyBBIHNlcmllcyBvZiBzcHJpdGVzIHBsYXllZCBpbiBzZXF1ZW5jZSwgb3B0aW9uYWxseSBhcyBhIGxvb3AuXG5jbGFzcyBBbmltYXRpb257XG5cdGNvbnN0cnVjdG9yKHNwcml0ZXMsIGZyYW1lU3BlZWQsIGxvb3Ape1xuXHRcdHRoaXMuc3ByaXRlcyA9IHNwcml0ZXM7XG5cdFx0dGhpcy5pbmRleCA9IDA7XG5cdFx0dGhpcy5uZXh0U3ByaXRlVGltZTtcblx0XHR0aGlzLmxvb3AgPSBsb29wO1xuXG5cdFx0Ly8gSSB0aGluayB0aGlzIGlzIHdyb25nLi4uXG5cdFx0dGhpcy5mcmFtZVNwZWVkID0gZnJhbWVTcGVlZDtcblxuXHRcdHRoaXMudGltZTtcblx0XHR0aGlzLng7XG5cdFx0dGhpcy55O1xuXHR9XG5cblx0Z2V0IHNwcml0ZSgpe1xuXHRcdHJldHVybiB0aGlzLnNwcml0ZXNbdGhpcy5pbmRleF07XG5cdH1cblxuXHRkcmF3KCl7XG5cdFx0bGV0IHNwcml0ZSA9IHRoaXMuc3ByaXRlO1xuXHRcdHNwcml0ZS5kcmF3KHRoaXMueCwgdGhpcy55LCAxMCk7XG5cdH1cblxuXHQvLyBSZXNldCB0byB0aGUgZmlyc3Qgc3ByaXRlIGluIHRoZSBhbmltYXRpb24uXG5cdHJld2luZCh0aW1lKXtcblx0XHR0aGlzLmluZGV4ID0gMDtcblx0fVxuXG5cdC8vIEFkdmFuY2UgdG8gdGhlIG5leHQgc3ByaXRlIGluIHRoZSBhbmltYXRpb24gaWYgZW5vdWdoIHRpbWVcblx0Ly8gaGFzIHBhc3NlZC5cblx0YWR2YW5jZSh0aW1lKXtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXG5cdFx0Ly8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgYWR2YW5jZSwgaW5pdGlhbGl6ZSB0byBvbmUgZnJhbWVTcGVlZCBmcm9tIG5vdy5cblx0XHR0aGlzLm5leHRTcHJpdGVUaW1lID0gdGhpcy5uZXh0U3ByaXRlVGltZSB8fCB0aW1lICsgdGhpcy5mcmFtZVNwZWVkO1xuXG5cdFx0aWYodGhpcy50aW1lID4gdGhpcy5uZXh0U3ByaXRlVGltZSl7XG5cdFx0XHQvLyBBZHZhbmNlIHRvIHRoZSBuZXh0IGZyYW1lLiBCdXQgaWYgd2UncmUgYXQgdGhlIGVuZCwgdGhlbiBlaXRoZXIgXG5cdFx0XHQvLyBsb29wIGJhY2sgYXJvdW5kIG9yIHN0YXkgb24gdGhlIGxhc3QgZnJhbWUuXG5cdFx0XHR0aGlzLmluZGV4Kys7XG5cblx0XHRcdGlmKHRoaXMubG9vcCA9PT0gdHJ1ZSl7XG5cdFx0XHRcdHRoaXMuaW5kZXggPSB0aGlzLmluZGV4ICUgdGhpcy5zcHJpdGVzLmxlbmd0aDtcblx0XHRcdH0gZWxzZSBpZih0aGlzLmluZGV4ID09PSB0aGlzLnNwcml0ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMuaW5kZXgtLTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5uZXh0U3ByaXRlVGltZSA9IHRoaXMubmV4dFNwcml0ZVRpbWUgKyB0aGlzLmZyYW1lU3BlZWQ7XG5cdFx0fVxuXHR9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiRW50aXR5XCI6IEVudGl0eVxufSIsImNvbnN0IGVuZ2luZSA9IHJlcXVpcmUoJy4vZW5naW5lJyk7XG5jb25zdCBzcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZScpO1xuY29uc3QgZW50aXR5ID0gcmVxdWlyZSgnLi9lbnRpdHknKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJHYW1lXCI6IGVuZ2luZS5HYW1lLFxuXHRcIkxvYWRlclwiOiBzcHJpdGUuTG9hZGVyLFxuXHRcIlNwcml0ZVwiOiBzcHJpdGUuU3ByaXRlLFxuXHRcIkVudGl0eVwiOiBlbnRpdHkuRW50aXR5XG59XG5cbiIsIi8vIExvYWQgYSBzcHJpdGUgc2hlZXQgb25jZS5cbmNsYXNzIExvYWRlciB7XG5cdGNvbnN0cnVjdG9yKHNyYywgbG9hZGVkQ2FsbGJhY2spe1xuXHRcdHRoaXMuc2hlZXQgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLnNoZWV0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsb2FkZWRDYWxsYmFjaywgZmFsc2UpO1xuXHRcdHRoaXMuc2hlZXQuc3JjID0gc3JjO1xuXHR9XG59XG5cblxuLy8gQW4gaW1hZ2UgdGhhdCBjYW4gYmUgcG9zaXRpb25lZCBhbmQgZHJhdyBpdHNlbC5cbmNsYXNzIFNwcml0ZSB7XG5cdC8vIHNsaWNlIGEgc3ByaXRlIGZyb20gYSBzaGVldFxuXHRjb25zdHJ1Y3RvcihzaGVldCwgY3R4LCBzeCwgc3ksIHN3LCBzaCl7XG5cdFx0dGhpcy5zaGVldCA9IHNoZWV0O1xuXHRcdHRoaXMuc3ggPSBzeDtcblx0XHR0aGlzLnN5ID0gc3k7XG5cdFx0dGhpcy5zdyA9IHN3O1xuXHRcdHRoaXMuc2ggPSBzaDtcblx0XHR0aGlzLmN0eCA9IGN0eDtcblx0fVxuXG5cdGRyYXcoeCwgeSwgc2NhbGU9MSl7XG5cdFx0dGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuc2hlZXQsIHRoaXMuc3gsIHRoaXMuc3ksIHRoaXMuc3csIHRoaXMuc2gsIHgsIHksIHNjYWxlICogdGhpcy5zdywgc2NhbGUgKiB0aGlzLnNoLCApO1xuXHR9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiTG9hZGVyXCI6IExvYWRlcixcblx0XCJTcHJpdGVcIjogU3ByaXRlXG59O1xuIl19
