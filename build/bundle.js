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

		this.state = null;
		this.animations = {};
		this.time = null;
	}

	registerAnimation(state, sprites, frameSpeed){
		this.animations[state] = new Animation(sprites, frameSpeed);
	}

	update(time, keys){
		this.time = time;

		if(keys['ArrowDown'] === true){
            this.state = 'DUCK';
        } else {
        	this.state = 'IDLE';
        }
        
	}

	draw(){
		this.animations[this.state].sprite(this.time).draw(this.x, this.y, 10);
	}
}

class Animation{
	constructor(sprites, frameSpeed){
		this.sprites = sprites;
		this.frameSpeed = frameSpeed;
		this.nextSpriteTime = null;
		this.nextSprite = null;
		this.loop = 1;
	}

	sprite(time){
		if(this.nextSprite === null){
			this.nextSprite = 0;
			this.nextSpriteTime = time + this.frameSpeed;
		}

		if(time > this.nextSpriteTime){
			// bounce back and forth through the sprites
			if(this.nextSprite + this.loop === this.sprites.length){
				this.loop = this.loop * -1;
			} else if (this.nextSprite + this.loop < 0){
				this.loop = this.loop * -1;
			}

			this.nextSprite = this.nextSprite + this.loop;
			this.nextSpriteTime = this.nextSpriteTime + this.frameSpeed;
		}

		return this.sprites[this.nextSprite];
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZW5naW5lL2luZGV4LmpzIiwic3JjL2VudGl0eS9pbmRleC5qcyIsInNyYy9tYWluLmpzIiwic3JjL3Nwcml0ZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKHdpbmRvdykge1xuICAgICAgICB0aGlzLlNFQ09ORCA9IDEwMDAuMDtcbiAgICAgICAgdGhpcy5USUNLID0gMTAwMC4wIC8gNjAuMDsgLy8gSW4gbXNcbiAgICAgICAgdGhpcy5ERUJVRyA9IHRydWU7XG4gICAgICAgIHRoaXMuU01PT1RIID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5rZXlzUHJlc3NlZCA9IHt9O1xuICAgICAgICB0aGlzLm1vdXNlUG9zWCA9IDA7XG4gICAgICAgIHRoaXMubW91c2VQb3NZID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubGFzdFNlYyA9IDA7IC8vIFRpbWVzdGFtcCBpbiBtcyB3aGVuIHdlIGxhc3QgZGlkIDEwMDBtcyBvZiBmcmFtZXNcbiAgICAgICAgdGhpcy5sYXN0VGljayA9IDA7IC8vIFRpbWVzdGFtcCBpbiBtcyB3aGVuIHdlIGxhc3QgZGlkIG9uZSBUSUNLXG4gICAgICAgIHRoaXMubGFzdEZwcyA9IDA7IC8vIEZyYW1lcy9zZWNvbmRzXG4gICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYyA9IDA7IC8vIEZyYW1lcyBzaW5jZSBsYXN0IHNlY3RoaXNcblxuICAgICAgICB0aGlzLndpbmRvdyA9IHdpbmRvdztcbiAgICAgICAgdGhpcy5kb2N1bWVudCA9IHRoaXMud2luZG93LmRvY3VtZW50O1xuICAgICAgICB0aGlzLmNhbnZhcyA9IHRoaXMuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY3JlZW5cIik7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gdGhpcy5TTU9PVEg7XG4gICAgfVxuXG4gICAga2V5RG93bihlKXtcbiAgICAgICAgdGhpcy5rZXlzUHJlc3NlZFtlLmtleV0gPSB0cnVlO1xuICAgIH1cblxuICAgIGtleVVwKGUpe1xuICAgICAgICBkZWxldGUgdGhpcy5rZXlzUHJlc3NlZFtlLmtleV07XG4gICAgfSAgICBcbiAgICBcbiAgICBmcmFtZShub3cpe1xuICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0VGljayA9IG5vdyAtIHRoaXMubGFzdFRpY2s7XG5cbiAgICAgICAgaWYgKHRpbWVTaW5jZUxhc3RUaWNrID49IHRoaXMuVElDSykge1xuICAgICAgICAgICAgdGhpcy5sYXN0VGljaysrO1xuICAgICAgICAgICAgdGhpcy5mcmFtZXNMYXN0U2VjKys7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWx0YVNlY3MgPSBub3cgLyAxMDAwLjA7XG4gICAgICAgIGlmIChkZWx0YVNlY3MgPj0gdGhpcy5sYXN0U2VjICsgMSApIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFNlYyA9IGRlbHRhU2VjcztcbiAgICAgICAgICAgIHRoaXMubGFzdEZwcyA9IHRoaXMuZnJhbWVzTGFzdFNlYztcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzTGFzdFNlYyA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1cGRhdGUoKXtcbiAgICAgICAgdGhpcy5lbnRpdGllcy5mb3JFYWNoKGVudGl0eSA9PiB7XG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKHRoaXMubGFzdFRpY2ssIHRoaXMua2V5c1ByZXNzZWQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIGRyYXdEZWJ1Z0luZm8oKXtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjb25zdCBjYW4gPSB0aGlzLmNhbnZhcztcblxuICAgICAgICAvLyBGcmFtZSBhbmQgdGltaW5nIGluZm9cbiAgICAgICAgY29uc3QgREVCVUdfU0laRSA9IDE2OyAvL3B4XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjdHguZm9udCA9IGAke0RFQlVHX1NJWkV9cHggc2Fucy1zZXJpZmA7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuXG4gICAgICAgIGN0eC5maWxsVGV4dChgJHt0aGlzLmxhc3RUaWNrfWAuc3BsaXQoJy4nKVswXSwgY2FuLndpZHRoLCBERUJVR19TSVpFKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMuZnJhbWVzTGFzdFNlY31gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiAyKTtcbiAgICAgICAgY3R4LmZpbGxUZXh0KGAke3RoaXMubGFzdFNlY31gLnNwbGl0KCcuJylbMF0sIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDMpO1xuICAgICAgICBjdHguZmlsbFRleHQoYCR7dGhpcy5sYXN0RnBzfWAuc2xpY2UoMCwgNSksIGNhbi53aWR0aCwgREVCVUdfU0laRSAqIDQpO1xuXG4gICAgICAgIC8vIEtleWJvYXJkXG4gICAgICAgIGN0eC5maWxsVGV4dChgJHtPYmplY3Qua2V5cyh0aGlzLmtleXNQcmVzc2VkKX1gLCBjYW4ud2lkdGgsIERFQlVHX1NJWkUgKiA1KTtcblxuXG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuXG4gICAgICAgIGlmKHRoaXMuREVCVUcpe1xuICAgICAgICAgICAgdGhpcy5kcmF3RGVidWdJbmZvKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgZW50aXR5LmRyYXcodGhpcy5jb250ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBcIkdhbWVcIjogR2FtZVxufSIsImNsYXNzIEVudGl0eXtcblx0Y29uc3RydWN0b3IoeCwgeSl7XG5cdFx0dGhpcy54ID0geDtcblx0XHR0aGlzLnkgPSB5O1xuXG5cdFx0dGhpcy5zdGF0ZSA9IG51bGw7XG5cdFx0dGhpcy5hbmltYXRpb25zID0ge307XG5cdFx0dGhpcy50aW1lID0gbnVsbDtcblx0fVxuXG5cdHJlZ2lzdGVyQW5pbWF0aW9uKHN0YXRlLCBzcHJpdGVzLCBmcmFtZVNwZWVkKXtcblx0XHR0aGlzLmFuaW1hdGlvbnNbc3RhdGVdID0gbmV3IEFuaW1hdGlvbihzcHJpdGVzLCBmcmFtZVNwZWVkKTtcblx0fVxuXG5cdHVwZGF0ZSh0aW1lLCBrZXlzKXtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXG5cdFx0aWYoa2V5c1snQXJyb3dEb3duJ10gPT09IHRydWUpe1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdEVUNLJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgXHR0aGlzLnN0YXRlID0gJ0lETEUnO1xuICAgICAgICB9XG4gICAgICAgIFxuXHR9XG5cblx0ZHJhdygpe1xuXHRcdHRoaXMuYW5pbWF0aW9uc1t0aGlzLnN0YXRlXS5zcHJpdGUodGhpcy50aW1lKS5kcmF3KHRoaXMueCwgdGhpcy55LCAxMCk7XG5cdH1cbn1cblxuY2xhc3MgQW5pbWF0aW9ue1xuXHRjb25zdHJ1Y3RvcihzcHJpdGVzLCBmcmFtZVNwZWVkKXtcblx0XHR0aGlzLnNwcml0ZXMgPSBzcHJpdGVzO1xuXHRcdHRoaXMuZnJhbWVTcGVlZCA9IGZyYW1lU3BlZWQ7XG5cdFx0dGhpcy5uZXh0U3ByaXRlVGltZSA9IG51bGw7XG5cdFx0dGhpcy5uZXh0U3ByaXRlID0gbnVsbDtcblx0XHR0aGlzLmxvb3AgPSAxO1xuXHR9XG5cblx0c3ByaXRlKHRpbWUpe1xuXHRcdGlmKHRoaXMubmV4dFNwcml0ZSA9PT0gbnVsbCl7XG5cdFx0XHR0aGlzLm5leHRTcHJpdGUgPSAwO1xuXHRcdFx0dGhpcy5uZXh0U3ByaXRlVGltZSA9IHRpbWUgKyB0aGlzLmZyYW1lU3BlZWQ7XG5cdFx0fVxuXG5cdFx0aWYodGltZSA+IHRoaXMubmV4dFNwcml0ZVRpbWUpe1xuXHRcdFx0Ly8gYm91bmNlIGJhY2sgYW5kIGZvcnRoIHRocm91Z2ggdGhlIHNwcml0ZXNcblx0XHRcdGlmKHRoaXMubmV4dFNwcml0ZSArIHRoaXMubG9vcCA9PT0gdGhpcy5zcHJpdGVzLmxlbmd0aCl7XG5cdFx0XHRcdHRoaXMubG9vcCA9IHRoaXMubG9vcCAqIC0xO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLm5leHRTcHJpdGUgKyB0aGlzLmxvb3AgPCAwKXtcblx0XHRcdFx0dGhpcy5sb29wID0gdGhpcy5sb29wICogLTE7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMubmV4dFNwcml0ZSA9IHRoaXMubmV4dFNwcml0ZSArIHRoaXMubG9vcDtcblx0XHRcdHRoaXMubmV4dFNwcml0ZVRpbWUgPSB0aGlzLm5leHRTcHJpdGVUaW1lICsgdGhpcy5mcmFtZVNwZWVkO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnNwcml0ZXNbdGhpcy5uZXh0U3ByaXRlXTtcblx0fVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcIkVudGl0eVwiOiBFbnRpdHlcbn0iLCJjb25zdCBlbmdpbmUgPSByZXF1aXJlKCcuL2VuZ2luZScpO1xuY29uc3Qgc3ByaXRlID0gcmVxdWlyZSgnLi9zcHJpdGUnKTtcbmNvbnN0IGVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwiR2FtZVwiOiBlbmdpbmUuR2FtZSxcblx0XCJMb2FkZXJcIjogc3ByaXRlLkxvYWRlcixcblx0XCJTcHJpdGVcIjogc3ByaXRlLlNwcml0ZSxcblx0XCJFbnRpdHlcIjogZW50aXR5LkVudGl0eVxufVxuXG4iLCJjbGFzcyBMb2FkZXIge1xuXHQvLyBMb2FkIGEgc3ByaXRlIHNoZWV0IG9uY2UuXG5cdGNvbnN0cnVjdG9yKHNyYywgbG9hZGVkQ2FsbGJhY2spe1xuXHRcdHRoaXMuc2hlZXQgPSBuZXcgSW1hZ2UoKTtcblx0XHR0aGlzLnNoZWV0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsb2FkZWRDYWxsYmFjaywgZmFsc2UpO1xuXHRcdHRoaXMuc2hlZXQuc3JjID0gc3JjO1xuXHR9XG59XG5cblxuY2xhc3MgU3ByaXRlIHtcblx0Ly8gc2xpY2UgYSBzcHJpdGUgZnJvbSBhIHNoZWV0XG5cdGNvbnN0cnVjdG9yKHNoZWV0LCBjdHgsIHN4LCBzeSwgc3csIHNoKXtcblx0XHR0aGlzLnNoZWV0ID0gc2hlZXQ7XG5cdFx0dGhpcy5zeCA9IHN4O1xuXHRcdHRoaXMuc3kgPSBzeTtcblx0XHR0aGlzLnN3ID0gc3c7XG5cdFx0dGhpcy5zaCA9IHNoO1xuXHRcdHRoaXMuY3R4ID0gY3R4O1xuXHR9XG5cblx0ZHJhdyh4LCB5LCBzY2FsZT0xKXtcblx0XHR0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5zaGVldCwgdGhpcy5zeCwgdGhpcy5zeSwgdGhpcy5zdywgdGhpcy5zaCwgeCwgeSwgc2NhbGUgKiB0aGlzLnN3LCBzY2FsZSAqIHRoaXMuc2gsICk7XG5cdH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJMb2FkZXJcIjogTG9hZGVyLFxuXHRcIlNwcml0ZVwiOiBTcHJpdGVcbn07XG4iXX0=
