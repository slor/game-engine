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
		this.stateHandlers = {};
		this.animation;
		this.nextAnimation = [];
		this.time;
	}

	// Register a handler to call when the entity is in a certain
	// state.
	registerState(state, handler, defaultState=false){
		this.stateHandlers[state] = handler;

		if(defaultState === true){
			this.state = state;
		}

		return this;
	}

	get stateHandler(){
		return this.stateHandlers[this.state];
	}

	// Handle the current state based on the entity and the game world.
	// Drive the animation based on the state, which are 1:1 for now.
	update(world){
		// If this is the first update, then we must rewind the animation
		// later
		this.time = world.time;
		this.stateHandler(this, world);

		this.animation.x = this.x;
		this.animation.y = this.y;
		if(this.nextAnimation[this.nextAnimation.length - 1]){
			this.animation = this.nextAnimation.pop().rewind();
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
	rewind(){
		this.index = 0;
		this.nextSpriteTime = null;

		return this;
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
	"Entity": Entity,
	"Animation": Animation
}
},{}],3:[function(require,module,exports){
const engine = require('./engine');
const sprite = require('./sprite');
const entity = require('./entity');


module.exports = {
	"Game": engine.Game,
	"Loader": sprite.Loader,
	"Sprite": sprite.Sprite,
	"Entity": entity.Entity,
	"Animation": entity.Animation,
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3Rvcih3aW5kb3cpIHtcbiAgICAgICAgdGhpcy5TRUNPTkQgPSAxMDAwLjA7XG4gICAgICAgIHRoaXMuVElDSyA9IDEwMDAuMCAvIDYwLjA7IC8vIEluIG1zXG4gICAgICAgIHRoaXMuREVCVUcgPSB0cnVlO1xuICAgICAgICB0aGlzLlNNT09USCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMua2V5c1ByZXNzZWQgPSB7fTtcbiAgICAgICAgdGhpcy5tb3VzZVBvc1ggPSAwO1xuICAgICAgICB0aGlzLm1vdXNlUG9zWSA9IDA7XG4gICAgICAgIHRoaXMubW91c2VQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmxhc3RTZWMgPSAwOyAvLyBUaW1lc3RhbXAgaW4gbXMgd2hlbiB3ZSBsYXN0IGRpZCAxMDAwbXMgb2YgZnJhbWVzXG4gICAgICAgIHRoaXMubGFzdFRpY2sgPSAwOyAvLyBUaW1lc3RhbXAgaW4gbXMgd2hlbiB3ZSBsYXN0IGRpZCBvbmUgVElDS1xuICAgICAgICB0aGlzLmxhc3RGcHMgPSAwOyAvLyBGcmFtZXMvc2Vjb25kc1xuICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMgPSAwOyAvLyBGcmFtZXMgc2luY2UgbGFzdCBzZWN0aGlzXG5cbiAgICAgICAgdGhpcy53aW5kb3cgPSB3aW5kb3c7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQgPSB0aGlzLndpbmRvdy5kb2N1bWVudDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2NyZWVuXCIpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmVudGl0aWVzID0gW107XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHRoaXMuU01PT1RIO1xuICAgIH1cblxuICAgIGtleURvd24oZSl7XG4gICAgICAgIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBrZXlVcChlKXtcbiAgICAgICAgZGVsZXRlIHRoaXMua2V5c1ByZXNzZWRbZS5rZXldO1xuICAgIH0gICAgXG4gICAgXG4gICAgZnJhbWUobm93KXtcbiAgICAgICAgY29uc3QgdGltZVNpbmNlTGFzdFRpY2sgPSBub3cgLSB0aGlzLmxhc3RUaWNrO1xuXG4gICAgICAgIGlmICh0aW1lU2luY2VMYXN0VGljayA+PSB0aGlzLlRJQ0spIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFRpY2srKztcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYysrO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVsdGFTZWNzID0gbm93IC8gMTAwMC4wO1xuICAgICAgICBpZiAoZGVsdGFTZWNzID49IHRoaXMubGFzdFNlYyArIDEgKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RTZWMgPSBkZWx0YVNlY3M7XG4gICAgICAgICAgICB0aGlzLmxhc3RGcHMgPSB0aGlzLmZyYW1lc0xhc3RTZWM7XG4gICAgICAgICAgICB0aGlzLmZyYW1lc0xhc3RTZWMgPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlKCl7XG4gICAgICAgIGNvbnN0IHdvcmxkID0ge1xuICAgICAgICAgICAgJ3RpbWUnOiB0aGlzLmxhc3RUaWNrLFxuICAgICAgICAgICAgJ2tleXNQcmVzc2VkJzogdGhpcy5rZXlzUHJlc3NlZFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goZW50aXR5ID0+IHtcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUod29ybGQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIGRyYXdEZWJ1Z0luZm8oKXtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjb25zdCBjYW4gPSB0aGlzLmNhbnZhcztcblxuICAgICAgICAvLyBGcmFtZSBhbmQgdGltaW5nIGluZm9cbiAgICAgICAgY29uc3QgREVCVUdfU0laRSA9IDE2OyAvL3B4XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjdHguZm9udCA9IGAke0RFQlVHX1NJWkV9cHggc2Fucy1zZXJpZmA7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuXG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RUaWNrfWAuc3BsaXQoJy4nKVswXSwgY2FuLndpZHRoLCBERUJVR19TSVpFKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMuZnJhbWVzTGFzdFNlY31gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAyKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdFNlY31gLnNwbGl0KCcuJylbMF0sIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDMpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0RnBzfWAuc2xpY2UoMCwgNSksIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDQpO1xuXG4gICAgICAgIC8vIEtleWJvYXJkXG4gICAgICAgIGN0eC5maWxsVGV4dChgJHtPYmplY3Qua2V5cyh0aGlzLmtleXNQcmVzc2VkKX1gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiA1KTtcblxuXG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuXG4gICAgICAgIGlmKHRoaXMuREVCVUcpe1xuICAgICAgICAgICAgdGhpcy5kcmF3RGVidWdJbmZvKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgZW50aXR5LmRyYXcodGhpcy5jb250ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkdhbWVcIjogR2FtZVxufSIsIi8vIEEgXCJ0aGluZ1wiIGluIHRoZSBnYW1lIHdvcmxkLiBcbi8vXG4vLyBDYW4gdXBkYXRlIGl0cyBvd24gc3RhdGUgYW5kIGRyYXcgaXRzZWxmLlxuY2xhc3MgRW50aXR5e1xuXHRjb25zdHJ1Y3Rvcih4LCB5KXtcblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cblx0XHR0aGlzLnN0YXRlO1xuXHRcdHRoaXMuc3RhdGVIYW5kbGVycyA9IHt9O1xuXHRcdHRoaXMuYW5pbWF0aW9uO1xuXHRcdHRoaXMubmV4dEFuaW1hdGlvbiA9IFtdO1xuXHRcdHRoaXMudGltZTtcblx0fVxuXG5cdC8vIFJlZ2lzdGVyIGEgaGFuZGxlciB0byBjYWxsIHdoZW4gdGhlIGVudGl0eSBpcyBpbiBhIGNlcnRhaW5cblx0Ly8gc3RhdGUuXG5cdHJlZ2lzdGVyU3RhdGUoc3RhdGUsIGhhbmRsZXIsIGRlZmF1bHRTdGF0ZT1mYWxzZSl7XG5cdFx0dGhpcy5zdGF0ZUhhbmRsZXJzW3N0YXRlXSA9IGhhbmRsZXI7XG5cblx0XHRpZihkZWZhdWx0U3RhdGUgPT09IHRydWUpe1xuXHRcdFx0dGhpcy5zdGF0ZSA9IHN0YXRlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0IHN0YXRlSGFuZGxlcigpe1xuXHRcdHJldHVybiB0aGlzLnN0YXRlSGFuZGxlcnNbdGhpcy5zdGF0ZV07XG5cdH1cblxuXHQvLyBIYW5kbGUgdGhlIGN1cnJlbnQgc3RhdGUgYmFzZWQgb24gdGhlIGVudGl0eSBhbmQgdGhlIGdhbWUgd29ybGQuXG5cdC8vIERyaXZlIHRoZSBhbmltYXRpb24gYmFzZWQgb24gdGhlIHN0YXRlLCB3aGljaCBhcmUgMToxIGZvciBub3cuXG5cdHVwZGF0ZSh3b3JsZCl7XG5cdFx0Ly8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgdXBkYXRlLCB0aGVuIHdlIG11c3QgcmV3aW5kIHRoZSBhbmltYXRpb25cblx0XHQvLyBsYXRlclxuXHRcdHRoaXMudGltZSA9IHdvcmxkLnRpbWU7XG5cdFx0dGhpcy5zdGF0ZUhhbmRsZXIodGhpcywgd29ybGQpO1xuXG5cdFx0dGhpcy5hbmltYXRpb24ueCA9IHRoaXMueDtcblx0XHR0aGlzLmFuaW1hdGlvbi55ID0gdGhpcy55O1xuXHRcdGlmKHRoaXMubmV4dEFuaW1hdGlvblt0aGlzLm5leHRBbmltYXRpb24ubGVuZ3RoIC0gMV0pe1xuXHRcdFx0dGhpcy5hbmltYXRpb24gPSB0aGlzLm5leHRBbmltYXRpb24ucG9wKCkucmV3aW5kKCk7XG5cdFx0fVxuXHRcdHRoaXMuYW5pbWF0aW9uLmFkdmFuY2UodGhpcy50aW1lKTtcblx0fVxuXG5cdGRyYXcoKXtcblx0XHR0aGlzLmFuaW1hdGlvbi5kcmF3KCk7XG5cdH1cbn1cblxuLy8gQSBzZXJpZXMgb2Ygc3ByaXRlcyBwbGF5ZWQgaW4gc2VxdWVuY2UsIG9wdGlvbmFsbHkgYXMgYSBsb29wLlxuY2xhc3MgQW5pbWF0aW9ue1xuXHRjb25zdHJ1Y3RvcihzcHJpdGVzLCBmcmFtZVNwZWVkLCBsb29wKXtcblx0XHR0aGlzLnNwcml0ZXMgPSBzcHJpdGVzO1xuXHRcdHRoaXMuaW5kZXggPSAwO1xuXHRcdHRoaXMubmV4dFNwcml0ZVRpbWU7XG5cdFx0dGhpcy5sb29wID0gbG9vcDtcblxuXHRcdC8vIEkgdGhpbmsgdGhpcyBpcyB3cm9uZy4uLlxuXHRcdHRoaXMuZnJhbWVTcGVlZCA9IGZyYW1lU3BlZWQ7XG5cblx0XHR0aGlzLnRpbWU7XG5cdFx0dGhpcy54O1xuXHRcdHRoaXMueTtcblx0fVxuXG5cdGdldCBzcHJpdGUoKXtcblx0XHRyZXR1cm4gdGhpcy5zcHJpdGVzW3RoaXMuaW5kZXhdO1xuXHR9XG5cblx0ZHJhdygpe1xuXHRcdGxldCBzcHJpdGUgPSB0aGlzLnNwcml0ZTtcblx0XHRzcHJpdGUuZHJhdyh0aGlzLngsIHRoaXMueSwgMTApO1xuXHR9XG5cblx0Ly8gUmVzZXQgdG8gdGhlIGZpcnN0IHNwcml0ZSBpbiB0aGUgYW5pbWF0aW9uLlxuXHRyZXdpbmQoKXtcblx0XHR0aGlzLmluZGV4ID0gMDtcblx0XHR0aGlzLm5leHRTcHJpdGVUaW1lID0gbnVsbDtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Ly8gQWR2YW5jZSB0byB0aGUgbmV4dCBzcHJpdGUgaW4gdGhlIGFuaW1hdGlvbiBpZiBlbm91Z2ggdGltZVxuXHQvLyBoYXMgcGFzc2VkLlxuXHRhZHZhbmNlKHRpbWUpe1xuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cblx0XHQvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBhZHZhbmNlLCBpbml0aWFsaXplIHRvIG9uZSBmcmFtZVNwZWVkIGZyb20gbm93LlxuXHRcdHRoaXMubmV4dFNwcml0ZVRpbWUgPSB0aGlzLm5leHRTcHJpdGVUaW1lIHx8IHRpbWUgKyB0aGlzLmZyYW1lU3BlZWQ7XG5cblx0XHRpZih0aGlzLnRpbWUgPiB0aGlzLm5leHRTcHJpdGVUaW1lKXtcblx0XHRcdC8vIEFkdmFuY2UgdG8gdGhlIG5leHQgZnJhbWUuIEJ1dCBpZiB3ZSdyZSBhdCB0aGUgZW5kLCB0aGVuIGVpdGhlciBcblx0XHRcdC8vIGxvb3AgYmFjayBhcm91bmQgb3Igc3RheSBvbiB0aGUgbGFzdCBmcmFtZS5cblx0XHRcdHRoaXMuaW5kZXgrKztcblxuXHRcdFx0aWYodGhpcy5sb29wID09PSB0cnVlKXtcblx0XHRcdFx0dGhpcy5pbmRleCA9IHRoaXMuaW5kZXggJSB0aGlzLnNwcml0ZXMubGVuZ3RoO1xuXHRcdFx0fSBlbHNlIGlmKHRoaXMuaW5kZXggPT09IHRoaXMuc3ByaXRlcy5sZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5pbmRleC0tO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm5leHRTcHJpdGVUaW1lID0gdGhpcy5uZXh0U3ByaXRlVGltZSArIHRoaXMuZnJhbWVTcGVlZDtcblx0XHR9XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJFbnRpdHlcIjogRW50aXR5LFxuXHRcIkFuaW1hdGlvblwiOiBBbmltYXRpb25cbn0iLCJjb25zdCBlbmdpbmUgPSByZXF1aXJlKCcuL2VuZ2luZScpO1xuY29uc3Qgc3ByaXRlID0gcmVxdWlyZSgnLi9zcHJpdGUnKTtcbmNvbnN0IGVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiR2FtZVwiOiBlbmdpbmUuR2FtZSxcblx0XCJMb2FkZXJcIjogc3ByaXRlLkxvYWRlcixcblx0XCJTcHJpdGVcIjogc3ByaXRlLlNwcml0ZSxcblx0XCJFbnRpdHlcIjogZW50aXR5LkVudGl0eSxcblx0XCJBbmltYXRpb25cIjogZW50aXR5LkFuaW1hdGlvbixcbn1cblxuIiwiLy8gTG9hZCBhIHNwcml0ZSBzaGVldCBvbmNlLlxuY2xhc3MgTG9hZGVyIHtcblx0Y29uc3RydWN0b3Ioc3JjLCBsb2FkZWRDYWxsYmFjayl7XG5cdFx0dGhpcy5zaGVldCA9IG5ldyBJbWFnZSgpO1xuXHRcdHRoaXMuc2hlZXQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGxvYWRlZENhbGxiYWNrLCBmYWxzZSk7XG5cdFx0dGhpcy5zaGVldC5zcmMgPSBzcmM7XG5cdH1cbn1cblxuXG4vLyBBbiBpbWFnZSB0aGF0IGNhbiBiZSBwb3NpdGlvbmVkIGFuZCBkcmF3IGl0c2VsLlxuY2xhc3MgU3ByaXRlIHtcblx0Ly8gc2xpY2UgYSBzcHJpdGUgZnJvbSBhIHNoZWV0XG5cdGNvbnN0cnVjdG9yKHNoZWV0LCBjdHgsIHN4LCBzeSwgc3csIHNoKXtcblx0XHR0aGlzLnNoZWV0ID0gc2hlZXQ7XG5cdFx0dGhpcy5zeCA9IHN4O1xuXHRcdHRoaXMuc3kgPSBzeTtcblx0XHR0aGlzLnN3ID0gc3c7XG5cdFx0dGhpcy5zaCA9IHNoO1xuXHRcdHRoaXMuY3R4ID0gY3R4O1xuXHR9XG5cblx0ZHJhdyh4LCB5LCBzY2FsZT0xKXtcblx0XHR0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5zaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgeCwgeSwgc2NhbGUgKiB0aGlzLnN3LCBzY2FsZSAqIHRoaXMuc2gsICk7XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJMb2FkZXJcIjogTG9hZGVyLFxuXHRcIlNwcml0ZVwiOiBTcHJpdGVcbn07XG4iXX0=
